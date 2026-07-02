<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\MapsDomainData;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use AuthorizesRequests;
    use MapsDomainData;

    protected function churchId(): ?string
    {
        return request()->user()?->effectiveChurchId();
    }
}
