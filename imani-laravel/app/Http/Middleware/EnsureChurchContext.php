<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Church;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureChurchContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        if ($user->role === UserRole::SUPER_ADMIN) {
            $churchId = session('active_church_id', $user->active_church_id);

            if ($churchId === null && ! $request->routeIs('platform.*')) {
                return redirect()->route('platform.dashboard');
            }

            if ($churchId !== null) {
                $church = Church::find($churchId);
                if ($church !== null) {
                    $request->attributes->set('active_church', $church);
                }
            }
        } elseif ($user->church_id === null) {
            abort(403, 'No church context assigned.');
        } else {
            $request->attributes->set('active_church', $user->church);
        }

        return $next($request);
    }
}
