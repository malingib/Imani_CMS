<?php

namespace App\Http\Controllers;

use App\Models\ChurchEvent;
use App\Models\Member;
use App\Models\Transaction;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();

        $members = Member::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();
        $transactions = Transaction::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->latest()->limit(50)->get();
        $events = ChurchEvent::query()
            ->when($churchId, fn ($q) => $q->where('church_id', $churchId))
            ->with('attendees')
            ->orderBy('date')
            ->get();

        return Inertia::render('Dashboard', [
            'members' => $members->map(fn ($m) => $this->mapMember($m))->values(),
            'transactions' => $transactions->map(fn ($t) => $this->mapTransaction($t))->values(),
            'events' => $events->map(fn ($e) => $this->mapEvent($e))->values(),
            'stats' => [
                'memberCount' => $members->count(),
                'incomeTotal' => $transactions->where('category', 'Income')->sum('amount'),
                'expenseTotal' => $transactions->where('category', 'Expense')->sum('amount'),
                'upcomingEvents' => $events->count(),
            ],
        ]);
    }
}
