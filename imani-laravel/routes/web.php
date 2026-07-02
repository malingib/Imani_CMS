<?php

use App\Http\Controllers\AiController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ChurchContextController;
use App\Http\Controllers\CommunicationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\GivingController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberPortalController;
use App\Http\Controllers\MpesaController;
use App\Http\Controllers\Platform\BillingController as PlatformBillingController;
use App\Http\Controllers\Platform\DashboardController as PlatformDashboardController;
use App\Http\Controllers\Platform\InvitationController;
use App\Http\Controllers\Platform\SettingsController as PlatformSettingsController;
use App\Http\Controllers\Platform\TenantController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SermonController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'));

Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');
Route::get('/compliance', [LegalController::class, 'compliance'])->name('compliance');
Route::get('/security', [LegalController::class, 'security'])->name('security');

Route::post('/mpesa/callback', [MpesaController::class, 'callback'])->name('mpesa.callback');

Route::middleware(['auth', 'super-admin'])->prefix('platform')->name('platform.')->group(function () {
    Route::get('/', [PlatformDashboardController::class, 'index'])->name('dashboard');
    Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::post('/tenants', [TenantController::class, 'store'])->name('tenants.store');
    Route::get('/invitations', [InvitationController::class, 'index'])->name('invitations.index');
    Route::post('/invitations', [InvitationController::class, 'store'])->name('invitations.store');
    Route::get('/billing', [PlatformBillingController::class, 'index'])->name('billing');
    Route::get('/settings', [PlatformSettingsController::class, 'index'])->name('settings');
    Route::put('/settings', [PlatformSettingsController::class, 'update'])->name('settings.update');
    Route::post('/church-switch', [ChurchContextController::class, 'switch'])->name('church.switch');
});

Route::middleware(['auth', 'church.context'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SUPER_ADMIN')
        ->name('dashboard');

    Route::get('/members', [MemberController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN')
        ->name('members.index');
    Route::post('/members', [MemberController::class, 'store'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');
    Route::post('/members/bulk', [MemberController::class, 'storeBulk'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');
    Route::put('/members/{member}', [MemberController::class, 'update'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');
    Route::delete('/members/{member}', [MemberController::class, 'destroy'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');

    Route::get('/finance', [FinanceController::class, 'index'])
        ->middleware('role:ADMIN,TREASURER,SUPER_ADMIN')
        ->name('finance.index');
    Route::post('/finance/transactions', [FinanceController::class, 'store'])->middleware('role:ADMIN,TREASURER,SUPER_ADMIN');
    Route::put('/finance/transactions/{transaction}', [FinanceController::class, 'update'])->middleware('role:ADMIN,TREASURER,SUPER_ADMIN');
    Route::delete('/finance/transactions/{transaction}', [FinanceController::class, 'destroy'])->middleware('role:ADMIN,TREASURER,SUPER_ADMIN');

    Route::get('/events', [EventController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN')
        ->name('events.index');
    Route::post('/events', [EventController::class, 'store'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');
    Route::put('/events/{event}/attendance', [EventController::class, 'updateAttendance'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');
    Route::post('/events/{event}/rsvp', [EventController::class, 'rsvp'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN,MEMBER');

    Route::get('/communication', [CommunicationController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN')
        ->name('communication.index');
    Route::post('/communication', [CommunicationController::class, 'store'])->middleware('role:ADMIN,PASTOR,SECRETARY,SUPER_ADMIN');

    Route::get('/groups', [GroupController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SUPER_ADMIN')
        ->name('groups.index');
    Route::post('/groups', [GroupController::class, 'store'])->middleware('role:ADMIN,PASTOR,SUPER_ADMIN');

    Route::get('/reports', [ReportController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SUPER_ADMIN')
        ->name('reports.index');

    Route::get('/analytics', [AnalyticsController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SUPER_ADMIN')
        ->name('analytics.index');

    Route::get('/sermons', [SermonController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,SUPER_ADMIN,MEMBER')
        ->name('sermons.index');
    Route::post('/sermons', [SermonController::class, 'store'])->middleware('role:ADMIN,PASTOR,SUPER_ADMIN');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('role:ADMIN,SUPER_ADMIN')
        ->name('audit-logs.index');

    Route::get('/billing', [BillingController::class, 'index'])
        ->middleware('role:ADMIN')
        ->name('billing.index');
    Route::post('/billing/mpesa/stk-push', [MpesaController::class, 'stkPushSubscription'])
        ->middleware('role:ADMIN')
        ->name('billing.mpesa.stk-push');
    Route::post('/billing/mpesa/invoice', [MpesaController::class, 'stkPushInvoice'])
        ->middleware('role:ADMIN')
        ->name('billing.mpesa.invoice');

    Route::get('/settings', [SettingsController::class, 'index'])
        ->middleware('role:ADMIN,PASTOR,TREASURER,SUPER_ADMIN')
        ->name('settings.index');

    Route::get('/portal', [MemberPortalController::class, 'index'])
        ->middleware('role:MEMBER,SUPER_ADMIN')
        ->name('portal');
    Route::get('/giving', [GivingController::class, 'index'])
        ->middleware('role:MEMBER,SUPER_ADMIN')
        ->name('giving');
    Route::post('/giving/mpesa/stk-push', [MpesaController::class, 'stkPushGiving'])
        ->middleware('role:MEMBER,SUPER_ADMIN')
        ->name('giving.mpesa.stk-push');
    Route::get('/mpesa/status/{checkoutRequestId}', [MpesaController::class, 'status'])
        ->name('mpesa.status');

    Route::prefix('ai')->name('ai.')->group(function () {
        Route::post('/sermon-outline', [AiController::class, 'sermonOutline'])->name('sermon-outline');
        Route::post('/bible-reflection', [AiController::class, 'bibleReflection'])->name('bible-reflection');
        Route::post('/inspirational-message', [AiController::class, 'inspirationalMessage'])->name('inspirational-message');
        Route::post('/daily-verse', [AiController::class, 'dailyVerse'])->name('daily-verse');
        Route::post('/outreach-scout', [AiController::class, 'outreachScout'])->name('outreach-scout');
        Route::post('/finance-analysis', [AiController::class, 'financeAnalysis'])->name('finance-analysis');
    });
});
