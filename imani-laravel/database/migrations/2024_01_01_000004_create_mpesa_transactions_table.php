<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mpesa_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('church_id')->nullable()->constrained('churches')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->foreignUuid('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->foreignUuid('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->foreignUuid('finance_transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->string('purpose');
            $table->string('phone');
            $table->unsignedInteger('amount');
            $table->string('gift_type')->nullable();
            $table->string('checkout_request_id')->nullable()->index();
            $table->string('merchant_request_id')->nullable();
            $table->string('mpesa_receipt_number')->nullable()->index();
            $table->string('status')->default('pending');
            $table->unsignedSmallInteger('result_code')->nullable();
            $table->string('result_desc')->nullable();
            $table->json('raw_callback')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('mpesa_phone')->nullable()->after('stripe_subscription_id');
            $table->timestamp('paid_until')->nullable()->after('end_date');
        });

        Schema::table('churches', function (Blueprint $table) {
            $table->string('mpesa_billing_phone')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('churches', function (Blueprint $table) {
            $table->dropColumn('mpesa_billing_phone');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['mpesa_phone', 'paid_until']);
        });

        Schema::dropIfExists('mpesa_transactions');
    }
};
