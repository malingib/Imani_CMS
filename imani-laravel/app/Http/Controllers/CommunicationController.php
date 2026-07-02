<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Communication;
use App\Models\Group;
use App\Models\Member;
use App\Models\Sermon;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CommunicationController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();
        $logs = Communication::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->latest()->get();
        $members = Member::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();

        return Inertia::render('Communication/Index', [
            'logs' => $logs->map(fn ($c) => $this->mapCommunication($c))->values(),
            'members' => $members->map(fn ($m) => $this->mapMember($m))->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $churchId = $this->churchId();
        abort_unless($churchId, 403);

        $validated = $request->validate([
            'type' => 'required|string',
            'content' => 'required|string',
            'subject' => 'nullable|string',
            'targetGroupName' => 'nullable|string',
            'recipientCount' => 'nullable|integer',
        ]);

        Communication::create([
            'id' => (string) Str::uuid(),
            'church_id' => $churchId,
            'type' => $validated['type'],
            'content' => $validated['content'],
            'subject' => $validated['subject'] ?? null,
            'target_group_name' => $validated['targetGroupName'] ?? 'All',
            'recipient_count' => $validated['recipientCount'] ?? 0,
            'date' => now()->format('Y-m-d'),
            'status' => 'Sent',
            'sender' => $request->user()->name,
        ]);

        return back()->with('success', 'Message sent');
    }
}
