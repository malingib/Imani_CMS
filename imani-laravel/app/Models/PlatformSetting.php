<?php

namespace App\Models;

class PlatformSetting extends BaseModel
{
    protected $table = 'platform_settings';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'flags',
    ];

    protected function casts(): array
    {
        return [
            'flags' => 'array',
        ];
    }
}
