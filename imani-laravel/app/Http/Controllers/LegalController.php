<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function privacy(): Response
    {
        return Inertia::render('Legal/Privacy');
    }

    public function compliance(): Response
    {
        return Inertia::render('Legal/Compliance');
    }

    public function security(): Response
    {
        return Inertia::render('Legal/Security');
    }
}
