<?php

namespace App\Http\Controllers;

use App\Services\MpesaService;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(private readonly MpesaService $mpesa) {}

    public function index(): Response
    {
        $church = request()->user()?->church;
        $subscription = $church?->subscription;
        $tier = $subscription?->tier ?? $church?->tier ?? 'basic';

        return Inertia::render('Billing/Index', [
            'tier' => $tier,
            'churchName' => $church?->name ?? '',
            'monthlyAmount' => $this->mpesa->tierAmount($tier),
            'paidUntil' => $subscription?->paid_until?->format('M j, Y'),
            'billingPhone' => $church?->mpesa_billing_phone,
            'subscriptionStatus' => $subscription?->status ?? 'pending',
            'pendingInvoices' => $church
                ? $church->invoices()->where('status', 'pending')->get()->map(fn ($i) => $this->mapInvoice($i))->values()
                : [],
        ]);
    }
}
