<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(): Response
    {
        $churchId = $this->churchId();
        $logs = AuditLog::query()->when($churchId, fn ($q) => $q->where('church_id', $churchId))->latest('timestamp')->limit(200)->get();

        return Inertia::render('AuditLogs/Index', [
            'auditLogs' => $logs->map(fn ($l) => $this->mapAuditLog($l))->values(),
        ]);
    }
}
