<?php

namespace App\Providers;

use App\Enums\UserRole;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Fortify::loginView(fn () => Inertia::render('Auth/Login'));

        $this->app->singleton(LoginResponse::class, function () {
            return new class implements LoginResponse
            {
                public function toResponse($request)
                {
                    return redirect()->intended(FortifyServiceProvider::redirectPath($request->user()));
                }
            };
        });

        Fortify::authenticateUsing(function (Request $request) {
            $user = \App\Models\User::where('email', $request->email)->first();

            if ($user && \Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
                return $user;
            }

            return null;
        });

        RateLimiter::for('login', function (Request $request) {
            if (app()->environment('local', 'testing') || env('E2E', false)) {
                return Limit::none();
            }

            $email = (string) $request->email;

            return Limit::perMinute(5)->by($email.$request->ip());
        });
    }

    public static function redirectPath(?\App\Models\User $user): string
    {
        if ($user === null) {
            return '/login';
        }

        return match ($user->role) {
            UserRole::MEMBER => '/portal',
            UserRole::SUPER_ADMIN => '/platform',
            default => '/dashboard',
        };
    }
}
