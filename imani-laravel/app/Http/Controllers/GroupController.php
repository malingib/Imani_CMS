<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();
        $members = Member::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();

        return Inertia::render('Groups/Index', [
            'members' => $members->map(fn ($m) => $this->mapMember($m))->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $churchId = $this->churchId();
        abort_unless($churchId, 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Group::create([
            'id' => (string) Str::uuid(),
            'church_id' => $churchId,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'member_count' => 0,
        ]);

        return back()->with('success', 'Group created');
    }
}
