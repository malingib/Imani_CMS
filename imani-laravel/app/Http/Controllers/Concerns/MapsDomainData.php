<?php

namespace App\Http\Controllers\Concerns;

use App\Models\AuditLog;
use App\Models\Budget;
use App\Models\Church;
use App\Models\ChurchEvent;
use App\Models\Communication;
use App\Models\Group;
use App\Models\Invitation;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Notification;
use App\Models\RecurringExpense;
use App\Models\Sermon;
use App\Models\Subscription;
use App\Models\Transaction;

trait MapsDomainData
{
    protected function mapMember(Member $m): array
    {
        return [
            'id' => $m->id,
            'firstName' => $m->first_name,
            'lastName' => $m->last_name,
            'phone' => $m->phone,
            'email' => $m->email,
            'location' => $m->location ?? '',
            'groups' => $m->groups ?? [],
            'status' => $m->status?->value ?? $m->status,
            'joinDate' => $m->join_date ?? '',
            'birthday' => $m->birthday,
            'age' => $m->age,
            'gender' => $m->gender,
            'maritalStatus' => $m->marital_status?->value ?? $m->marital_status,
            'membershipType' => $m->membership_type?->value ?? $m->membership_type,
            'photo' => $m->photo,
            'stewardshipScore' => $m->stewardship_score,
        ];
    }

    protected function mapTransaction(Transaction $t): array
    {
        return [
            'id' => $t->id,
            'memberId' => $t->member_id,
            'memberName' => $t->member_name ?? '',
            'amount' => (float) $t->amount,
            'type' => $t->type?->value ?? $t->type,
            'paymentMethod' => $t->payment_method?->value ?? $t->payment_method,
            'date' => $t->date,
            'reference' => $t->reference ?? '',
            'category' => $t->category?->value ?? $t->category,
            'notes' => $t->notes,
            'phoneNumber' => $t->phone_number,
            'source' => $t->source?->value ?? $t->source ?? 'MANUAL',
        ];
    }

    protected function mapEvent(ChurchEvent $e): array
    {
        $attendance = $e->relationLoaded('attendees')
            ? $e->attendees->pluck('id')->all()
            : $e->attendees()->pluck('members.id')->all();

        return [
            'id' => $e->id,
            'title' => $e->title,
            'description' => $e->description ?? '',
            'date' => $e->date,
            'time' => $e->time ?? '',
            'location' => $e->location ?? '',
            'type' => $e->type?->value ?? $e->type,
            'coordinator' => $e->coordinator,
            'attendance' => $attendance,
            'contactPerson' => $e->contact_person,
            'rsvpDeadline' => $e->rsvp_deadline,
            'recurrence' => $e->recurrence?->value ?? $e->recurrence,
        ];
    }

    protected function mapAuditLog(AuditLog $log): array
    {
        return [
            'id' => $log->id,
            'userId' => $log->user_id,
            'userName' => $log->user_name,
            'action' => $log->action,
            'module' => $log->module,
            'timestamp' => $log->timestamp ?? $log->created_at?->toIso8601String(),
            'severity' => $log->severity?->value ?? $log->severity ?? 'INFO',
            'metadata' => $log->metadata,
        ];
    }

    protected function mapCommunication(Communication $c): array
    {
        return [
            'id' => $c->id,
            'type' => $c->type?->value ?? $c->type,
            'recipientCount' => $c->recipient_count ?? 0,
            'targetGroupName' => $c->target_group_name ?? '',
            'subject' => $c->subject ?? '',
            'content' => $c->content,
            'date' => $c->date,
            'status' => $c->status?->value ?? $c->status,
            'sender' => $c->sender ?? '',
            'scheduledFor' => $c->scheduled_for,
            'deliveryBreakdown' => $c->delivery_breakdown,
        ];
    }

    protected function mapGroup(Group $g): array
    {
        return [
            'id' => $g->id,
            'name' => $g->name,
            'description' => $g->description ?? '',
            'memberCount' => $g->member_count ?? 0,
        ];
    }

    protected function mapSermon(Sermon $s): array
    {
        return [
            'id' => $s->id,
            'title' => $s->title,
            'speaker' => $s->speaker,
            'date' => $s->date,
            'time' => $s->time ?? '',
            'scripture' => $s->scripture ?? '',
            'event' => $s->event ?? '',
            'eventId' => $s->event_id ?? '',
            'transcript' => $s->transcript ?? '',
        ];
    }

    protected function mapBudget(Budget $b): array
    {
        return [
            'id' => $b->id,
            'category' => $b->category,
            'amount' => (float) $b->amount,
            'spent' => (float) $b->spent,
            'month' => $b->month,
        ];
    }

    protected function mapRecurringExpense(RecurringExpense $r): array
    {
        return [
            'id' => $r->id,
            'category' => $r->category,
            'amount' => (float) $r->amount,
            'frequency' => $r->frequency?->value ?? $r->frequency,
            'nextDate' => $r->next_date ?? '',
        ];
    }

    protected function mapNotification(Notification $n): array
    {
        return [
            'id' => $n->id,
            'title' => $n->title,
            'message' => $n->message,
            'time' => $n->time ?? '',
            'type' => $n->type?->value ?? $n->type,
            'read' => (bool) $n->read,
        ];
    }

    protected function mapChurch(Church $c, ?int $memberCount = null): array
    {
        return [
            'id' => $c->id,
            'name' => $c->name,
            'slug' => $c->slug,
            'tier' => $c->tier,
            'status' => $c->status,
            'logoUrl' => $c->logo_url,
            'address' => $c->address,
            'phone' => $c->phone,
            'email' => $c->email,
            'memberCount' => $memberCount ?? $c->members()->count(),
        ];
    }

    protected function mapInvitation(Invitation $i): array
    {
        return [
            'id' => $i->id,
            'churchId' => $i->church_id,
            'email' => $i->email,
            'role' => $i->role,
            'token' => $i->token,
            'expiresAt' => $i->expires_at?->toIso8601String(),
            'acceptedAt' => $i->accepted_at?->toIso8601String(),
        ];
    }

    protected function mapSubscription(Subscription $s): array
    {
        return [
            'id' => $s->id,
            'churchId' => $s->church_id,
            'tier' => $s->tier,
            'status' => $s->status,
            'startDate' => $s->start_date?->toIso8601String(),
            'endDate' => $s->end_date?->toIso8601String(),
        ];
    }

    protected function mapInvoice(Invoice $i): array
    {
        return [
            'id' => $i->id,
            'churchId' => $i->church_id,
            'amount' => (float) $i->amount,
            'status' => $i->status,
            'dueDate' => $i->due_date?->format('Y-m-d'),
            'paidAt' => $i->paid_at?->toIso8601String(),
        ];
    }
}
