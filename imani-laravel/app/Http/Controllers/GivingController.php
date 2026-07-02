<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class GivingController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $transactions = $user?->member_id
            ? Transaction::query()->where('member_id', $user->member_id)->where('category', 'Income')->get()
            : collect();

        return Inertia::render('Giving/Index', [
            'transactions' => $transactions->map(fn ($t) => $this->mapTransaction($t))->values(),
            'member' => $user?->member ? $this->mapMember($user->member) : null,
        ]);
    }
}
