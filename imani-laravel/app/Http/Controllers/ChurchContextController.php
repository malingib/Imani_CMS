<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChurchContextController extends Controller
{
    public function switch(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->role === UserRole::SUPER_ADMIN, 403);

        $validated = $request->validate([
            'churchId' => 'nullable|uuid',
        ]);

        session(['active_church_id' => $validated['churchId']]);

        if ($validated['churchId'] === null) {
            $user->update(['active_church_id' => null]);
        } else {
            $user->update(['active_church_id' => $validated['churchId']]);
        }

        if ($validated['churchId']) {
            return redirect()->route('dashboard');
        }

        return redirect()->route('platform.dashboard');
    }
}
