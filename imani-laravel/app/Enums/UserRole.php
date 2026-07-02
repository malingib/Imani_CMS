<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'SUPER_ADMIN';
    case ADMIN = 'ADMIN';
    case PASTOR = 'PASTOR';
    case TREASURER = 'TREASURER';
    case SECRETARY = 'SECRETARY';
    case MEMBER = 'MEMBER';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN => 'Admin',
            self::PASTOR => 'Pastor',
            self::TREASURER => 'Treasurer',
            self::SECRETARY => 'Secretary',
            self::MEMBER => 'Member',
        };
    }

    public function isPlatformAdmin(): bool
    {
        return $this === self::SUPER_ADMIN;
    }
}
