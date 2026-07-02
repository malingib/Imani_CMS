<?php

namespace App\Http\Controllers;

use App\Models\ChurchEvent;
use App\Models\Member;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class MemberPortalController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $member = $user?->member;

        $transactions = $member
            ? Transaction::query()->where('member_id', $member->id)->latest()->limit(20)->get()
            : collect();

        $events = ChurchEvent::query()
            ->when($user?->church_id, fn ($q) => $q->where('church_id', $user->church_id))
            ->with('attendees')
            ->orderBy('date')
            ->limit(10)
            ->get();

        return Inertia::render('Portal/Index', [
            'member' => $member ? $this->mapMember($member) : null,
            'transactions' => $transactions->map(fn ($t) => $this->mapTransaction($t))->values(),
            'events' => $events->map(fn ($e) => $this->mapEvent($e))->values(),
        ]);
    }
}
