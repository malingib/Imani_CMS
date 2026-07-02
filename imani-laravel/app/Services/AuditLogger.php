<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Str;

class AuditLogger
{
    public static function log(
        User $user,
        string $action,
        string $module,
        string $severity = 'INFO',
        ?array $metadata = null,
    ): void {
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'church_id' => $user->effectiveChurchId() ?? $user->church_id,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'action' => $action,
            'module' => $module,
            'timestamp' => now()->toIso8601String(),
            'severity' => $severity,
            'metadata' => $metadata,
        ]);
    }
}
