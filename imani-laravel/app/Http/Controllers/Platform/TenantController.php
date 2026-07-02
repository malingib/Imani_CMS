<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Church;
use App\Models\Member;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(): Response
    {
        $churches = Church::withCount('members')->orderBy('name')->get();

        return Inertia::render('Platform/Tenants', [
            'churches' => $churches->map(fn ($c) => $this->mapChurch($c, $c->members_count))->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:churches,slug',
            'tier' => 'nullable|string|in:basic,pro',
            'email' => 'nullable|email',
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        $church = Church::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'slug' => $slug,
            'tier' => $validated['tier'] ?? 'basic',
            'status' => 'active',
            'email' => $validated['email'] ?? null,
        ]);

        Subscription::create([
            'id' => (string) Str::uuid(),
            'church_id' => $church->id,
            'tier' => $church->tier,
            'status' => 'active',
            'start_date' => now(),
        ]);

        return back()->with('success', 'Church created');
    }
}
