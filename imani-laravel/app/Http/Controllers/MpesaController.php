<?php

namespace App\Http\Controllers;

use App\Enums\MpesaPurpose;
use App\Enums\MpesaStatus;
use App\Models\Invoice;
use App\Models\MpesaTransaction;
use App\Models\Subscription;
use App\Services\MpesaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MpesaController extends Controller
{
    public function __construct(private readonly MpesaService $mpesa) {}

    public function callback(Request $request): JsonResponse
    {
        $this->mpesa->handleCallback($request->all());

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    public function status(string $checkoutRequestId): JsonResponse
    {
        $mpesa = MpesaTransaction::query()
            ->where('checkout_request_id', $checkoutRequestId)
            ->firstOrFail();

        return response()->json([
            'status' => $mpesa->status->value,
            'resultDesc' => $mpesa->result_desc,
            'receipt' => $mpesa->mpesa_receipt_number,
        ]);
    }

    public function stkPushGiving(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:1', 'max:150000'],
            'gift_type' => ['required', Rule::in(['Tithe', 'Offering', 'Project', 'Benevolence'])],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = $request->user();
        $member = $user?->member;

        if ($member === null) {
            return response()->json(['message' => 'No member profile linked.'], 422);
        }

        $phone = $this->mpesa->normalizePhone($data['phone'] ?? $member->phone ?? '');

        $mpesa = MpesaTransaction::create([
            'id' => (string) Str::uuid(),
            'church_id' => $this->churchId(),
            'user_id' => $user->id,
            'member_id' => $member->id,
            'purpose' => MpesaPurpose::GIVING,
            'phone' => $phone,
            'amount' => $data['amount'],
            'gift_type' => $data['gift_type'],
            'status' => MpesaStatus::PENDING,
        ]);

        $response = $this->mpesa->stkPush($mpesa);

        return response()->json([
            'message' => $response['CustomerMessage'] ?? 'STK Push sent. Check your phone.',
            'checkoutRequestId' => $mpesa->checkout_request_id,
        ]);
    }

    public function stkPushSubscription(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $church = $request->user()?->church;

        if ($church === null) {
            return response()->json(['message' => 'Church context required.'], 422);
        }

        $subscription = $church->subscription ?? Subscription::create([
            'id' => (string) Str::uuid(),
            'church_id' => $church->id,
            'tier' => $church->tier ?? 'basic',
            'status' => 'pending',
            'start_date' => now(),
        ]);

        $amount = $this->mpesa->tierAmount($subscription->tier ?? 'basic');
        $phone = $this->mpesa->normalizePhone($data['phone']);

        $mpesa = MpesaTransaction::create([
            'id' => (string) Str::uuid(),
            'church_id' => $church->id,
            'user_id' => $request->user()->id,
            'subscription_id' => $subscription->id,
            'purpose' => MpesaPurpose::PLATFORM_SUBSCRIPTION,
            'phone' => $phone,
            'amount' => $amount,
            'status' => MpesaStatus::PENDING,
        ]);

        $response = $this->mpesa->stkPush($mpesa);

        return response()->json([
            'message' => $response['CustomerMessage'] ?? 'STK Push sent. Check your phone.',
            'checkoutRequestId' => $mpesa->checkout_request_id,
            'amount' => $amount,
        ]);
    }

    public function stkPushInvoice(Request $request): JsonResponse
    {
        $data = $request->validate([
            'invoice_id' => ['required', 'uuid', 'exists:invoices,id'],
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $invoice = Invoice::query()->findOrFail($data['invoice_id']);

        if ($invoice->church_id !== $this->churchId()) {
            abort(403);
        }

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Invoice already paid.'], 422);
        }

        $phone = $this->mpesa->normalizePhone($data['phone']);
        $amount = (int) ceil((float) $invoice->amount);

        $mpesa = MpesaTransaction::create([
            'id' => (string) Str::uuid(),
            'church_id' => $invoice->church_id,
            'user_id' => $request->user()->id,
            'invoice_id' => $invoice->id,
            'subscription_id' => $invoice->subscription_id,
            'purpose' => MpesaPurpose::PLATFORM_INVOICE,
            'phone' => $phone,
            'amount' => $amount,
            'status' => MpesaStatus::PENDING,
        ]);

        $response = $this->mpesa->stkPush($mpesa);

        return response()->json([
            'message' => $response['CustomerMessage'] ?? 'STK Push sent. Check your phone.',
            'checkoutRequestId' => $mpesa->checkout_request_id,
            'amount' => $amount,
        ]);
    }
}
