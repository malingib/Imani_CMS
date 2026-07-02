<?php

namespace App\Http\Controllers;

use App\Models\ChurchEvent;
use App\Models\Member;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();

        $events = ChurchEvent::query()
            ->when($churchId, fn ($q) => $q->where('church_id', $churchId))
            ->with('attendees')
            ->orderBy('date')
            ->get();

        $members = Member::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();

        return Inertia::render('Events/Index', [
            'events' => $events->map(fn ($e) => $this->mapEvent($e))->values(),
            'members' => $members->map(fn ($m) => $this->mapMember($m))->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $churchId = $this->churchId();
        abort_unless($churchId, 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|string',
            'time' => 'nullable|string',
            'location' => 'nullable|string',
            'type' => 'nullable|string',
            'coordinator' => 'nullable|string',
            'contactPerson' => 'nullable|string',
            'rsvpDeadline' => 'nullable|string',
            'recurrence' => 'nullable|string',
        ]);

        ChurchEvent::create([
            'id' => (string) Str::uuid(),
            'church_id' => $churchId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'date' => $validated['date'],
            'time' => $validated['time'] ?? '',
            'location' => $validated['location'] ?? '',
            'type' => $validated['type'] ?? 'OTHER',
            'coordinator' => $validated['coordinator'] ?? null,
            'contact_person' => $validated['contactPerson'] ?? null,
            'rsvp_deadline' => $validated['rsvpDeadline'] ?? null,
            'recurrence' => $validated['recurrence'] ?? 'NONE',
        ]);

        AuditLogger::log($request->user(), 'Created event', 'EVENTS');

        return back()->with('success', 'Event created');
    }

    public function destroy(Request $request, ChurchEvent $event): RedirectResponse
    {
        $this->authorizeChurch($event->church_id);
        $event->delete();
        AuditLogger::log($request->user(), 'Deleted event', 'EVENTS');

        return back()->with('success', 'Event deleted');
    }

    public function updateAttendance(Request $request, ChurchEvent $event): RedirectResponse
    {
        $this->authorizeChurch($event->church_id);

        $validated = $request->validate([
            'attendance' => 'required|array',
            'attendance.*' => 'uuid',
        ]);

        $sync = [];
        foreach ($validated['attendance'] as $memberId) {
            $sync[$memberId] = ['church_id' => $event->church_id];
        }
        $event->attendees()->sync($sync);

        AuditLogger::log($request->user(), 'Updated attendance', 'EVENTS');

        return back()->with('success', 'Attendance updated');
    }

    public function rsvp(Request $request, ChurchEvent $event): RedirectResponse
    {
        $this->authorizeChurch($event->church_id);

        $validated = $request->validate(['memberId' => 'required|uuid']);
        $event->attendees()->syncWithoutDetaching([
            $validated['memberId'] => ['church_id' => $event->church_id],
        ]);

        return back()->with('success', 'RSVP recorded');
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
