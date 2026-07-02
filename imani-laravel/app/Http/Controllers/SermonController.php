<?php

namespace App\Http\Controllers;

use App\Models\Sermon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SermonController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();
        $sermons = Sermon::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->latest('date')->get();

        return Inertia::render('Sermons/Index', [
            'sermons' => $sermons->map(fn ($s) => $this->mapSermon($s))->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $churchId = $this->churchId();
        abort_unless($churchId, 403);

        $validated = $request->validate([
            'title' => 'required|string',
            'speaker' => 'required|string',
            'date' => 'required|string',
            'scripture' => 'nullable|string',
            'transcript' => 'nullable|string',
        ]);

        Sermon::create([
            'id' => (string) Str::uuid(),
            'church_id' => $churchId,
            'title' => $validated['title'],
            'speaker' => $validated['speaker'],
            'date' => $validated['date'],
            'scripture' => $validated['scripture'] ?? '',
            'transcript' => $validated['transcript'] ?? '',
        ]);

        return back()->with('success', 'Sermon saved');
    }
}
