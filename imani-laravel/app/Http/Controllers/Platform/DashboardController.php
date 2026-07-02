<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Church;
use App\Models\Member;
use App\Models\Subscription;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Platform/Index', [
            'stats' => [
                'churches' => Church::count(),
                'members' => Member::withoutGlobalScopes()->count(),
                'subscriptions' => Subscription::where('status', 'active')->count(),
                'revenue' => Transaction::withoutGlobalScopes()->where('category', 'Income')->sum('amount'),
            ],
        ]);
    }
}
