<?php

namespace App\Traits;

use App\Models\Church;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToChurch
{
    public static function bootBelongsToChurch(): void
    {
        static::addGlobalScope('church', function (Builder $builder): void {
            $churchId = static::resolveChurchId();

            if ($churchId !== null) {
                $builder->where($builder->getModel()->getTable().'.church_id', $churchId);
            }
        });

        static::creating(function ($model): void {
            if (empty($model->church_id)) {
                $churchId = static::resolveChurchId();
                if ($churchId !== null) {
                    $model->church_id = $churchId;
                }
            }
        });
    }

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public static function resolveChurchId(): ?string
    {
        $user = Auth::user();

        if ($user === null) {
            return null;
        }

        if ($user->role?->isPlatformAdmin()) {
            return session('active_church_id', $user->active_church_id);
        }

        return $user->church_id;
    }

    public function scopeForChurch(Builder $query, string $churchId): Builder
    {
        return $query->withoutGlobalScope('church')->where('church_id', $churchId);
    }
}
