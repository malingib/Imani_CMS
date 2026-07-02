<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->uuid('user_id')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone');
            $table->string('email');
            $table->string('location')->nullable();
            $table->json('groups')->nullable();
            $table->string('status')->default('Active');
            $table->string('join_date')->nullable();
            $table->string('birthday')->nullable();
            $table->integer('age')->nullable();
            $table->string('gender')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('membership_type')->nullable();
            $table->string('photo')->nullable();
            $table->integer('stewardship_score')->nullable();
            $table->timestamps();
        });

        Schema::create('groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('member_count')->default(0);
            $table->timestamps();
        });

        Schema::create('group_members', function (Blueprint $table) {
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->foreignUuid('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->primary(['group_id', 'member_id']);
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->foreignUuid('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('member_name')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('type');
            $table->string('payment_method')->nullable();
            $table->string('date');
            $table->string('reference')->nullable();
            $table->string('category');
            $table->text('notes')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('source')->default('MANUAL');
            $table->timestamps();
        });

        Schema::create('budgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('category');
            $table->decimal('amount', 12, 2);
            $table->decimal('spent', 12, 2)->default(0);
            $table->string('month');
            $table->timestamps();
        });

        Schema::create('recurring_expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('category');
            $table->decimal('amount', 12, 2);
            $table->string('frequency');
            $table->string('next_date')->nullable();
            $table->timestamps();
        });

        Schema::create('church_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('date');
            $table->string('time')->nullable();
            $table->string('location')->nullable();
            $table->string('type')->default('OTHER');
            $table->string('coordinator')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('rsvp_deadline')->nullable();
            $table->string('recurrence')->default('NONE');
            $table->json('coordinates')->nullable();
            $table->timestamps();
        });

        Schema::create('event_attendance', function (Blueprint $table) {
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->foreignUuid('event_id')->constrained('church_events')->cascadeOnDelete();
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->primary(['event_id', 'member_id']);
        });

        Schema::create('communications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('type');
            $table->integer('recipient_count')->nullable();
            $table->string('target_group_name')->nullable();
            $table->string('subject')->nullable();
            $table->text('content');
            $table->string('date');
            $table->string('status')->default('Sent');
            $table->string('sender')->nullable();
            $table->string('scheduled_for')->nullable();
            $table->json('delivery_breakdown')->nullable();
            $table->timestamps();
        });

        Schema::create('sermons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('title');
            $table->string('speaker');
            $table->string('date');
            $table->string('time')->nullable();
            $table->string('scripture')->nullable();
            $table->string('event')->nullable();
            $table->foreignUuid('event_id')->nullable()->constrained('church_events')->nullOnDelete();
            $table->text('transcript')->nullable();
            $table->timestamps();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->foreignUuid('member_id')->nullable()->constrained('members')->cascadeOnDelete();
            $table->string('type');
            $table->text('description')->nullable();
            $table->string('timestamp')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('time')->nullable();
            $table->string('type');
            $table->boolean('read')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->constrained('churches')->cascadeOnDelete();
            $table->string('user_id')->nullable();
            $table->string('user_name')->nullable();
            $table->string('action');
            $table->string('module');
            $table->string('timestamp')->nullable();
            $table->string('severity')->default('INFO');
            $table->json('metadata')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('sermons');
        Schema::dropIfExists('communications');
        Schema::dropIfExists('event_attendance');
        Schema::dropIfExists('church_events');
        Schema::dropIfExists('recurring_expenses');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('group_members');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('members');
    }
};
