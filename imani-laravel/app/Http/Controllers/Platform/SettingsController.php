<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $settings = PlatformSetting::firstOrCreate(['id' => 'global'], ['flags' => []]);

        return Inertia::render('Platform/Settings', [
            'flags' => $settings->flags ?? [],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate(['flags' => 'required|array']);

        PlatformSetting::updateOrCreate(
            ['id' => 'global'],
            ['flags' => $validated['flags']]
        );

        return back()->with('success', 'Settings saved');
    }
}
