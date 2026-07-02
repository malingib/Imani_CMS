<?php

namespace App\Services;

use App\Enums\MpesaPurpose;
use App\Enums\MpesaStatus;
use App\Enums\NotificationType;
use App\Enums\PaymentMethod;
use App\Enums\TransactionCategory;
use App\Enums\TransactionSource;
use App\Models\Invoice;
use App\Models\MpesaTransaction;
use App\Models\Notification;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MpesaService
{
    public function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '0')) {
            return '254'.substr($digits, 1);
        }

        if (str_starts_with($digits, '254')) {
            return $digits;
        }

        if (str_starts_with($digits, '7') || str_starts_with($digits, '1')) {
            return '254'.$digits;
        }

        throw new \InvalidArgumentException('Invalid Kenyan phone number.');
    }

    public function accessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3500, function () {
            $key = config('mpesa.consumer_key');
            $secret = config('mpesa.consumer_secret');

            if (empty($key) || empty($secret)) {
                throw new \RuntimeException('M-Pesa credentials are not configured.');
            }

            $response = Http::withBasicAuth($key, $secret)
                ->get(config('mpesa.base_url').'/oauth/v1/generate?grant_type=client_credentials');

            if ($response->failed()) {
                Log::error('M-Pesa OAuth failed', ['body' => $response->body()]);
                throw new \RuntimeException('Failed to obtain M-Pesa access token.');
            }

            return $response->json('access_token');
        });
    }

    public function stkPush(MpesaTransaction $mpesa): array
    {
        $timestamp = now()->format('YmdHis');
        $password = base64_encode(config('mpesa.shortcode').config('mpesa.passkey').$timestamp);

        $payload = [
            'BusinessShortCode' => config('mpesa.shortcode'),
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => $mpesa->amount,
            'PartyA' => $mpesa->phone,
            'PartyB' => config('mpesa.shortcode'),
            'PhoneNumber' => $mpesa->phone,
            'CallBackURL' => config('mpesa.callback_url'),
            'AccountReference' => substr($mpesa->id, 0, 12),
            'TransactionDesc' => match ($mpesa->purpose) {
                MpesaPurpose::GIVING => 'Imani Giving',
                MpesaPurpose::PLATFORM_SUBSCRIPTION => 'Imani Subscription',
                MpesaPurpose::PLATFORM_INVOICE => 'Imani Invoice',
            },
        ];

        $response = Http::withToken($this->accessToken())
            ->post(config('mpesa.base_url').'/mpesa/stkpush/v1/processrequest', $payload);

        if ($response->failed()) {
            Log::error('M-Pesa STK Push failed', ['body' => $response->body(), 'payload' => $payload]);
            $mpesa->update([
                'status' => MpesaStatus::FAILED,
                'result_desc' => $response->json('errorMessage') ?? 'STK Push request failed',
            ]);
            throw new \RuntimeException($response->json('errorMessage') ?? 'M-Pesa STK Push failed.');
        }

        $data = $response->json();

        $mpesa->update([
            'checkout_request_id' => $data['CheckoutRequestID'] ?? null,
            'merchant_request_id' => $data['MerchantRequestID'] ?? null,
            'result_desc' => $data['ResponseDescription'] ?? null,
        ]);

        return $data;
    }

    public function handleCallback(array $payload): void
    {
        $body = $payload['Body']['stkCallback'] ?? null;

        if ($body === null) {
            Log::warning('M-Pesa callback missing stkCallback body', $payload);

            return;
        }

        $checkoutId = $body['CheckoutRequestID'] ?? null;
        $mpesa = MpesaTransaction::query()->where('checkout_request_id', $checkoutId)->first();

        if ($mpesa === null) {
            Log::warning('M-Pesa callback for unknown checkout', ['checkout' => $checkoutId]);

            return;
        }

        $resultCode = (int) ($body['ResultCode'] ?? 1);
        $metadata = collect($body['CallbackMetadata']['Item'] ?? [])->mapWithKeys(
            fn ($item) => [$item['Name'] => $item['Value'] ?? null]
        );

        $mpesa->update([
            'raw_callback' => $payload,
            'result_code' => $resultCode,
            'result_desc' => $body['ResultDesc'] ?? null,
            'mpesa_receipt_number' => $metadata->get('MpesaReceiptNumber'),
            'status' => $resultCode === 0 ? MpesaStatus::COMPLETED : MpesaStatus::FAILED,
        ]);

        if ($resultCode !== 0) {
            return;
        }

        match ($mpesa->purpose) {
            MpesaPurpose::GIVING => $this->fulfillGiving($mpesa, $metadata),
            MpesaPurpose::PLATFORM_SUBSCRIPTION => $this->fulfillSubscription($mpesa),
            MpesaPurpose::PLATFORM_INVOICE => $this->fulfillInvoice($mpesa),
        };
    }

    protected function fulfillGiving(MpesaTransaction $mpesa, $metadata): void
    {
        if ($mpesa->finance_transaction_id) {
            return;
        }

        $member = $mpesa->member;
        $receipt = $metadata->get('MpesaReceiptNumber') ?? $mpesa->mpesa_receipt_number;

        $transaction = Transaction::create([
            'id' => (string) Str::uuid(),
            'church_id' => $mpesa->church_id,
            'member_id' => $mpesa->member_id,
            'member_name' => $member ? $member->full_name : 'Member',
            'amount' => $mpesa->amount,
            'type' => $mpesa->gift_type ?? 'Offering',
            'payment_method' => PaymentMethod::MPESA->value,
            'date' => now()->format('Y-m-d'),
            'reference' => $receipt ?? $mpesa->checkout_request_id,
            'category' => TransactionCategory::INCOME->value,
            'notes' => 'M-Pesa STK Push',
            'phone_number' => $mpesa->phone,
            'source' => TransactionSource::INTEGRATED->value,
        ]);

        $mpesa->update(['finance_transaction_id' => $transaction->id]);

        Notification::create([
            'id' => (string) Str::uuid(),
            'church_id' => $mpesa->church_id,
            'title' => 'M-Pesa Received',
            'message' => 'KES '.number_format($mpesa->amount).' received via M-Pesa.',
            'time' => now()->toIso8601String(),
            'type' => NotificationType::MPESA->value,
            'read' => false,
        ]);
    }

    protected function fulfillSubscription(MpesaTransaction $mpesa): void
    {
        $subscription = $mpesa->subscription
            ?? ($mpesa->church_id
                ? Subscription::query()->where('church_id', $mpesa->church_id)->latest()->first()
                : null);

        if ($subscription === null) {
            return;
        }

        $subscription->update([
            'status' => 'active',
            'paid_until' => now()->addMonth(),
            'mpesa_phone' => $mpesa->phone,
        ]);

        $church = $subscription->church;
        if ($church) {
            $church->update([
                'status' => 'active',
                'mpesa_billing_phone' => $mpesa->phone,
            ]);
        }
    }

    protected function fulfillInvoice(MpesaTransaction $mpesa): void
    {
        $invoice = $mpesa->invoice;

        if ($invoice === null) {
            return;
        }

        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        if ($invoice->subscription) {
            $invoice->subscription->update([
                'status' => 'active',
                'paid_until' => now()->addMonth(),
            ]);
        }
    }

    public function tierAmount(string $tier): int
    {
        return config("mpesa.tiers.{$tier}") ?? config('mpesa.tiers.basic');
    }
}
