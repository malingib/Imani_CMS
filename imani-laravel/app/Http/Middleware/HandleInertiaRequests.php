<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Church;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->value,
                    'avatar' => $user->avatar,
                    'churchId' => $user->church_id,
                    'memberId' => $user->member_id,
                ] : null,
            ],
            'activeChurch' => fn () => $this->resolveActiveChurch($request),
            'churches' => fn () => $this->resolveChurches($user),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'toasts' => fn () => $request->session()->get('toasts', []),
        ];
    }

    protected function resolveActiveChurch(Request $request): ?array
    {
        $church = $request->attributes->get('active_church');

        if ($church === null && $request->user()) {
            $churchId = $request->user()->effectiveChurchId();
            $church = $churchId ? Church::find($churchId) : null;
        }

        if ($church === null) {
            return null;
        }

        return [
            'id' => $church->id,
            'name' => $church->name,
            'slug' => $church->slug,
            'tier' => $church->tier,
            'status' => $church->status,
        ];
    }

    protected function resolveChurches($user): array
    {
        if ($user === null) {
            return [];
        }

        if ($user->role === UserRole::SUPER_ADMIN) {
            return Church::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'tier', 'status'])
                ->toArray();
        }

        if ($user->church) {
            return [[
                'id' => $user->church->id,
                'name' => $user->church->name,
                'slug' => $user->church->slug,
                'tier' => $user->church->tier,
                'status' => $user->church->status,
            ]];
        }

        return [];
    }
}
