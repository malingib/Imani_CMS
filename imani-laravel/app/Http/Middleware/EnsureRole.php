<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        if ($user->role === UserRole::SUPER_ADMIN) {
            return $next($request);
        }

        $allowed = collect($roles)
            ->map(fn (string $role) => UserRole::from($role))
            ->all();

        if (! in_array($user->role, $allowed, true)) {
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}
