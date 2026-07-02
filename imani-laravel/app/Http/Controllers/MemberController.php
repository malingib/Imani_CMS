<?php

namespace App\Http\Controllers;

use App\Models\ChurchEvent;
use App\Models\Member;
use App\Models\Transaction;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();

        $members = Member::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();
        $transactions = Transaction::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();
        $events = ChurchEvent::query()
            ->when($churchId, fn ($q) => $q->where('church_id', $churchId))
            ->with('attendees')
            ->get();

        return Inertia::render('Members/Index', [
            'members' => $members->map(fn ($m) => $this->mapMember($m))->values(),
            'transactions' => $transactions->map(fn ($t) => $this->mapTransaction($t))->values(),
            'events' => $events->map(fn ($e) => $this->mapEvent($e))->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $churchId = $this->churchId();
        abort_unless($churchId, 403);

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'location' => 'nullable|string',
            'groups' => 'nullable|array',
            'status' => 'nullable|string',
            'joinDate' => 'nullable|string',
            'birthday' => 'nullable|string',
            'age' => 'nullable|integer',
            'gender' => 'nullable|string',
            'maritalStatus' => 'nullable|string',
            'membershipType' => 'nullable|string',
            'photo' => 'nullable|string',
        ]);

        Member::create([
            'id' => (string) Str::uuid(),
            'church_id' => $churchId,
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'location' => $validated['location'] ?? null,
            'groups' => $validated['groups'] ?? [],
            'status' => $validated['status'] ?? 'Active',
            'join_date' => $validated['joinDate'] ?? now()->format('Y-m-d'),
            'birthday' => $validated['birthday'] ?? null,
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'marital_status' => $validated['maritalStatus'] ?? null,
            'membership_type' => $validated['membershipType'] ?? null,
            'photo' => $validated['photo'] ?? null,
        ]);

        AuditLogger::log($request->user(), 'Created member', 'MEMBERS');

        return back()->with('success', 'Member saved');
    }

    public function storeBulk(Request $request): RedirectResponse
    {
        $churchId = $this->churchId();
        abort_unless($churchId, 403);

        $validated = $request->validate([
            'members' => 'required|array',
            'members.*.firstName' => 'required|string',
            'members.*.lastName' => 'required|string',
            'members.*.phone' => 'required|string',
            'members.*.email' => 'required|email',
        ]);

        foreach ($validated['members'] as $row) {
            Member::create([
                'id' => (string) Str::uuid(),
                'church_id' => $churchId,
                'first_name' => $row['firstName'],
                'last_name' => $row['lastName'],
                'phone' => $row['phone'],
                'email' => $row['email'],
                'location' => $row['location'] ?? null,
                'groups' => $row['groups'] ?? [],
                'status' => $row['status'] ?? 'Active',
                'join_date' => $row['joinDate'] ?? now()->format('Y-m-d'),
            ]);
        }

        AuditLogger::log($request->user(), 'Bulk imported members', 'MEMBERS');

        return back()->with('success', 'Members imported');
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeChurch($member->church_id);

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'location' => 'nullable|string',
            'groups' => 'nullable|array',
            'status' => 'nullable|string',
            'joinDate' => 'nullable|string',
            'birthday' => 'nullable|string',
            'age' => 'nullable|integer',
            'gender' => 'nullable|string',
            'maritalStatus' => 'nullable|string',
            'membershipType' => 'nullable|string',
            'photo' => 'nullable|string',
        ]);

        $member->update([
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'location' => $validated['location'] ?? null,
            'groups' => $validated['groups'] ?? [],
            'status' => $validated['status'] ?? $member->status,
            'join_date' => $validated['joinDate'] ?? $member->join_date,
            'birthday' => $validated['birthday'] ?? null,
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'marital_status' => $validated['maritalStatus'] ?? null,
            'membership_type' => $validated['membershipType'] ?? null,
            'photo' => $validated['photo'] ?? null,
        ]);

        AuditLogger::log($request->user(), 'Updated member', 'MEMBERS');

        return back()->with('success', 'Member updated');
    }

    public function destroy(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeChurch($member->church_id);
        $member->delete();
        AuditLogger::log($request->user(), 'Deleted member', 'MEMBERS');

        return back()->with('success', 'Member deleted');
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
