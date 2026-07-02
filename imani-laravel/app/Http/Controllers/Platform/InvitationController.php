<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Church;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function index(): Response
    {
        $invitations = Invitation::with('church')->latest()->get();
        $churches = Church::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Platform/Invitations', [
            'invitations' => $invitations->map(fn ($i) => array_merge($this->mapInvitation($i), [
                'churchName' => $i->church?->name,
            ]))->values(),
            'churches' => $churches,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'churchId' => 'required|uuid|exists:churches,id',
            'email' => 'required|email',
            'role' => 'required|string',
        ]);

        Invitation::create([
            'id' => (string) Str::uuid(),
            'church_id' => $validated['churchId'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'token' => Str::random(64),
            'expires_at' => now()->addDays(7),
        ]);

        return back()->with('success', 'Invitation sent');
    }
}
