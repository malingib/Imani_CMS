<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Church;
use App\Models\User;

abstract class TenantPolicy
{
    protected function isSuperAdmin(User $user): bool
    {
        return $user->role === UserRole::SUPER_ADMIN;
    }

    protected function belongsToChurch(User $user, Church|string|null $church): bool
    {
        if ($church === null) {
            return false;
        }

        $churchId = $church instanceof Church ? $church->id : $church;

        if ($this->isSuperAdmin($user)) {
            $activeId = session('active_church_id', $user->active_church_id);

            return $activeId === null || $activeId === $churchId;
        }

        return $user->church_id === $churchId;
    }
}
