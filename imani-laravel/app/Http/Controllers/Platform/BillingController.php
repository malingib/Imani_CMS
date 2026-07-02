<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Subscription;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $subscriptions = Subscription::with('church')->get();
        $invoices = Invoice::with('church')->latest()->get();

        return Inertia::render('Platform/Billing', [
            'subscriptions' => $subscriptions->map(fn ($s) => $this->mapSubscription($s))->values(),
            'invoices' => $invoices->map(fn ($i) => $this->mapInvoice($i))->values(),
        ]);
    }
}
