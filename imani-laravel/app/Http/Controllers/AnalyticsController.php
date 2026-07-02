<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();
        $members = Member::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->get();

        return Inertia::render('Analytics/Index', [
            'members' => $members->map(fn ($m) => $this->mapMember($m))->values(),
        ]);
    }
}
