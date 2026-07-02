<?php

namespace App\Policies;

use App\Models\Church;
use App\Models\User;

class ChurchPolicy extends TenantPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function view(User $user, Church $church): bool
    {
        return $this->isSuperAdmin($user) || $this->belongsToChurch($user, $church);
    }

    public function create(User $user): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function update(User $user, Church $church): bool
    {
        return $this->isSuperAdmin($user);
    }

    public function delete(User $user, Church $church): bool
    {
        return $this->isSuperAdmin($user);
    }
}
