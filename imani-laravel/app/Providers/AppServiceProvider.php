<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\Church;
use App\Models\User;
use App\Policies\ChurchPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        Church::class => ChurchPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Church::class, ChurchPolicy::class);

        Gate::before(function (User $user, string $ability) {
            if ($user->role === UserRole::SUPER_ADMIN) {
                return true;
            }

            return null;
        });
    }
}
