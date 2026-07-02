<?php

namespace App\Http\Controllers;

use App\Models\ChurchEvent;
use App\Models\Member;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();
        $transactions = Transaction::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();
        $members = Member::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();

        $events = ChurchEvent::query()
            ->when($churchId, fn ($q) => $q->where('church_id', $churchId))
            ->with('attendees')
            ->get();

        return Inertia::render('Reports/Index', [
            'transactions' => $transactions->map(fn ($t) => $this->mapTransaction($t))->values(),
            'members' => $members->map(fn ($m) => $this->mapMember($m))->values(),
            'events' => $events->map(fn ($e) => $this->mapEvent($e))->values(),
        ]);
    }
}
