<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $church = $user?->church;

        return Inertia::render('Settings/Index', [
            'church' => $church ? [
                'name' => $church->name,
                'email' => $church->email,
                'phone' => $church->phone,
                'address' => $church->address,
            ] : null,
            'userRole' => $user?->role?->value,
        ]);
    }
}
