<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\RecurringExpense;
use App\Models\Transaction;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();

        $transactions = Transaction::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->latest()->get();
        $budgets = Budget::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();
        $recurring = RecurringExpense::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();

        return Inertia::render('Finance/Index', [
            'transactions' => $transactions->map(fn ($t) => $this->mapTransaction($t))->values(),
            'budgets' => $budgets->map(fn ($b) => $this->mapBudget($b))->values(),
            'recurringExpenses' => $recurring->map(fn ($r) => $this->mapRecurringExpense($r))->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $churchId = $this->churchId();
        abort_unless($churchId, 403);

        $validated = $request->validate([
            'memberId' => 'nullable|uuid',
            'memberName' => 'required|string',
            'amount' => 'required|numeric',
            'type' => 'required|string',
            'paymentMethod' => 'nullable|string',
            'date' => 'required|string',
            'reference' => 'nullable|string',
            'category' => 'required|string',
            'notes' => 'nullable|string',
            'phoneNumber' => 'nullable|string',
            'source' => 'nullable|string',
        ]);

        Transaction::create([
            'id' => (string) Str::uuid(),
            'church_id' => $churchId,
            'member_id' => $validated['memberId'] ?? null,
            'member_name' => $validated['memberName'],
            'amount' => $validated['amount'],
            'type' => $validated['type'],
            'payment_method' => $validated['paymentMethod'] ?? 'Cash',
            'date' => $validated['date'],
            'reference' => $validated['reference'] ?? '',
            'category' => $validated['category'],
            'notes' => $validated['notes'] ?? null,
            'phone_number' => $validated['phoneNumber'] ?? null,
            'source' => $validated['source'] ?? 'MANUAL',
        ]);

        AuditLogger::log($request->user(), 'Created transaction', 'FINANCE');

        return back()->with('success', 'Transaction saved');
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorizeChurch($transaction->church_id);

        $validated = $request->validate([
            'memberId' => 'nullable|uuid',
            'memberName' => 'required|string',
            'amount' => 'required|numeric',
            'type' => 'required|string',
            'paymentMethod' => 'nullable|string',
            'date' => 'required|string',
            'reference' => 'nullable|string',
            'category' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $transaction->update([
            'member_id' => $validated['memberId'] ?? null,
            'member_name' => $validated['memberName'],
            'amount' => $validated['amount'],
            'type' => $validated['type'],
            'payment_method' => $validated['paymentMethod'] ?? $transaction->payment_method,
            'date' => $validated['date'],
            'reference' => $validated['reference'] ?? '',
            'category' => $validated['category'],
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLogger::log($request->user(), 'Updated transaction', 'FINANCE');

        return back()->with('success', 'Transaction updated');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorizeChurch($transaction->church_id);
        $transaction->delete();
        AuditLogger::log($request->user(), 'Deleted transaction', 'FINANCE');

        return back()->with('success', 'Transaction deleted');
    }

    protected function authorizeChurch(?string $churchId): void
    {
        $user = request()->user();
        if ($user->role->value === 'SUPER_ADMIN') {
            return;
        }
        abort_unless($user->church_id === $churchId, 403);
    }
}
