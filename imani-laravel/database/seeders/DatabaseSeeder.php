<?php

namespace Database\Seeders;

use App\Enums\MemberStatus;
use App\Enums\MembershipType;
use App\Enums\MaritalStatus;
use App\Enums\TransactionCategory;
use App\Enums\TransactionSource;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\Church;
use App\Models\ChurchEvent;
use App\Models\Group;
use App\Models\Member;
use App\Models\PlatformSetting;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    private const DEMO_CHURCH_ID = '00000000-0000-0000-0000-000000000001';

    public function run(): void
    {
        $church = Church::query()->updateOrCreate(
            ['id' => self::DEMO_CHURCH_ID],
            [
                'name' => 'Demo Church',
                'slug' => 'demo-church',
                'tier' => 'pro',
                'status' => 'active',
                'email' => 'hello@demo-church.test',
            ]
        );

        $nairobiChapel = Church::query()->updateOrCreate(
            ['slug' => 'nairobi-chapel'],
            [
                'name' => 'Nairobi Chapel',
                'tier' => 'basic',
                'status' => 'active',
                'email' => 'hello@nairobi-chapel.test',
            ]
        );

        Subscription::query()->firstOrCreate(
            ['church_id' => $church->id, 'tier' => 'pro'],
            ['status' => 'active', 'start_date' => now()]
        );

        Subscription::query()->firstOrCreate(
            ['church_id' => $nairobiChapel->id, 'tier' => 'basic'],
            ['status' => 'active', 'start_date' => now()]
        );

        PlatformSetting::query()->firstOrCreate(
            ['id' => 'global'],
            ['flags' => []]
        );

        $members = $this->seedMembers($church);
        $this->seedTransactions($church, $members);
        $this->seedGroups($church);
        $this->seedEvents($church, $members);
        $this->seedUsers($church, $members);
    }

    private function seedMembers(Church $church): array
    {
        $data = [
            ['id' => 'm0000001-0000-0000-0000-000000000001', 'first_name' => 'David', 'last_name' => 'Ochieng', 'phone' => '+254712345678', 'email' => 'david.ochieng@example.com', 'location' => 'Nairobi West', 'groups' => ['Youth Fellowship', 'Media & Tech'], 'gender' => 'Male', 'marital_status' => MaritalStatus::SINGLE, 'membership_type' => MembershipType::FULL],
            ['id' => 'm0000001-0000-0000-0000-000000000002', 'first_name' => 'Mary', 'last_name' => 'Wambui', 'phone' => '+254722111222', 'email' => 'mary.wambui@example.com', 'location' => 'Kileleshwa', 'groups' => ['Women of Grace'], 'gender' => 'Female', 'marital_status' => MaritalStatus::MARRIED, 'membership_type' => MembershipType::FULL],
            ['id' => 'm0000001-0000-0000-0000-000000000003', 'first_name' => 'John', 'last_name' => 'Kamau', 'phone' => '+254733333444', 'email' => 'john.kamau@example.com', 'location' => 'Nairobi CBD', 'groups' => ['Men of Faith', 'Choir'], 'gender' => 'Male', 'marital_status' => MaritalStatus::MARRIED, 'membership_type' => MembershipType::FULL],
            ['id' => 'm0000001-0000-0000-0000-000000000004', 'first_name' => 'Grace', 'last_name' => 'Njoki', 'phone' => '+254744555666', 'email' => 'grace.njoki@example.com', 'location' => 'Westlands', 'groups' => ['Youth Fellowship'], 'gender' => 'Female', 'marital_status' => MaritalStatus::SINGLE, 'membership_type' => MembershipType::PROBATION],
            ['id' => 'm0000001-0000-0000-0000-000000000005', 'first_name' => 'Samuel', 'last_name' => 'Mwangi', 'phone' => '+254755777888', 'email' => 'samuel.mwangi@example.com', 'location' => 'Karen', 'groups' => ['Media & Tech'], 'gender' => 'Male', 'marital_status' => MaritalStatus::MARRIED, 'membership_type' => MembershipType::ASSOCIATE],
        ];

        $members = [];

        foreach ($data as $row) {
            $members[$row['id']] = Member::withoutGlobalScopes()->updateOrCreate(
                ['id' => $row['id']],
                [
                    'church_id' => $church->id,
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'phone' => $row['phone'],
                    'email' => $row['email'],
                    'location' => $row['location'],
                    'groups' => $row['groups'],
                    'status' => MemberStatus::ACTIVE,
                    'join_date' => '2023-01-15',
                    'gender' => $row['gender'],
                    'marital_status' => $row['marital_status'],
                    'membership_type' => $row['membership_type'],
                ]
            );
        }

        return $members;
    }

    private function seedTransactions(Church $church, array $members): void
    {
        $rows = [
            ['id' => 't0000001-0000-0000-0000-000000000001', 'member_id' => 'm0000001-0000-0000-0000-000000000001', 'member_name' => 'David Ochieng', 'amount' => 5000, 'type' => TransactionType::TITHE, 'payment_method' => 'M-Pesa', 'date' => '2024-05-19', 'reference' => 'QSG812L90P', 'category' => TransactionCategory::INCOME],
            ['id' => 't0000001-0000-0000-0000-000000000002', 'member_id' => 'm0000001-0000-0000-0000-000000000002', 'member_name' => 'Mary Wambui', 'amount' => 12000, 'type' => TransactionType::TITHE, 'payment_method' => 'M-Pesa', 'date' => '2024-05-18', 'reference' => 'QSG912M34Q', 'category' => TransactionCategory::INCOME],
            ['id' => 't0000001-0000-0000-0000-000000000003', 'member_id' => null, 'member_name' => 'Church Utilities', 'amount' => 4500, 'type' => TransactionType::UTILITY, 'payment_method' => 'Bank Transfer', 'date' => '2024-05-15', 'reference' => 'UTL-MAY-001', 'category' => TransactionCategory::EXPENSE],
            ['id' => 't0000001-0000-0000-0000-000000000004', 'member_id' => 'm0000001-0000-0000-0000-000000000003', 'member_name' => 'John Kamau', 'amount' => 3000, 'type' => TransactionType::OFFERING, 'payment_method' => 'Cash', 'date' => '2024-05-19', 'reference' => 'OFF-0519-001', 'category' => TransactionCategory::INCOME],
            ['id' => 't0000001-0000-0000-0000-000000000005', 'member_id' => 'm0000001-0000-0000-0000-000000000001', 'member_name' => 'David Ochieng', 'amount' => 2000, 'type' => TransactionType::PROJECT, 'payment_method' => 'M-Pesa', 'date' => '2024-05-20', 'reference' => 'PRJ-0520-001', 'category' => TransactionCategory::INCOME],
        ];

        foreach ($rows as $row) {
            Transaction::withoutGlobalScopes()->updateOrCreate(
                ['id' => $row['id']],
                [
                    'church_id' => $church->id,
                    'member_id' => $row['member_id'],
                    'member_name' => $row['member_name'],
                    'amount' => $row['amount'],
                    'type' => $row['type'],
                    'payment_method' => $row['payment_method'],
                    'date' => $row['date'],
                    'reference' => $row['reference'],
                    'category' => $row['category'],
                    'source' => TransactionSource::MANUAL,
                ]
            );
        }
    }

    private function seedGroups(Church $church): void
    {
        $groups = [
            ['id' => 'g0000001-0000-0000-0000-000000000001', 'name' => 'Youth Fellowship', 'description' => 'For young adults aged 18-35', 'member_count' => 45],
            ['id' => 'g0000001-0000-0000-0000-000000000002', 'name' => 'Media & Tech', 'description' => 'Manages church media and technology', 'member_count' => 12],
            ['id' => 'g0000001-0000-0000-0000-000000000003', 'name' => 'Women of Grace', 'description' => "Women's ministry fellowship", 'member_count' => 30],
            ['id' => 'g0000001-0000-0000-0000-000000000004', 'name' => 'Men of Faith', 'description' => "Men's ministry fellowship", 'member_count' => 25],
            ['id' => 'g0000001-0000-0000-0000-000000000005', 'name' => 'Choir', 'description' => 'Church music and worship team', 'member_count' => 20],
        ];

        foreach ($groups as $group) {
            Group::withoutGlobalScopes()->updateOrCreate(
                ['id' => $group['id']],
                [
                    'church_id' => $church->id,
                    'name' => $group['name'],
                    'description' => $group['description'],
                    'member_count' => $group['member_count'],
                ]
            );
        }
    }

    private function seedEvents(Church $church, array $members): void
    {
        $events = [
            ['id' => 'e0000001-0000-0000-0000-000000000001', 'title' => 'Sunday Worship Service', 'description' => 'Main weekly worship service', 'date' => '2024-05-26', 'time' => '09:00 AM', 'location' => 'Main Sanctuary', 'type' => 'WORSHIP', 'coordinator' => 'Pastor John'],
            ['id' => 'e0000001-0000-0000-0000-000000000002', 'title' => 'Midweek Bible Study', 'description' => 'Wednesday Bible study session', 'date' => '2024-05-29', 'time' => '06:00 PM', 'location' => 'Fellowship Hall', 'type' => 'BIBLE_STUDY', 'coordinator' => 'Elder Peter'],
            ['id' => 'e0000001-0000-0000-0000-000000000003', 'title' => 'Youth Outreach', 'description' => 'Community outreach event', 'date' => '2024-06-01', 'time' => '10:00 AM', 'location' => 'Nairobi West', 'type' => 'OUTREACH', 'coordinator' => 'Brother David'],
        ];

        foreach ($events as $event) {
            ChurchEvent::withoutGlobalScopes()->updateOrCreate(
                ['id' => $event['id']],
                [
                    'church_id' => $church->id,
                    'title' => $event['title'],
                    'description' => $event['description'],
                    'date' => $event['date'],
                    'time' => $event['time'],
                    'location' => $event['location'],
                    'type' => $event['type'],
                    'coordinator' => $event['coordinator'],
                ]
            );
        }

        foreach ([
            'm0000001-0000-0000-0000-000000000003',
            'm0000001-0000-0000-0000-000000000002',
        ] as $memberId) {
            DB::table('event_attendance')->updateOrInsert(
                [
                    'event_id' => 'e0000001-0000-0000-0000-000000000001',
                    'member_id' => $memberId,
                ],
                ['church_id' => $church->id]
            );
        }
    }

    private function seedUsers(Church $church, array $members): void
    {
        $password = Hash::make('password');

        $accounts = [
            ['email' => 'superadmin@imani.test', 'name' => 'Platform Owner', 'role' => UserRole::SUPER_ADMIN, 'church_id' => null, 'member_id' => null, 'active_church_id' => null],
            ['email' => 'admin@demo-church.test', 'name' => 'Church Admin', 'role' => UserRole::ADMIN, 'church_id' => $church->id, 'member_id' => null, 'active_church_id' => null],
            ['email' => 'pastor@demo-church.test', 'name' => 'Pastor John', 'role' => UserRole::PASTOR, 'church_id' => $church->id, 'member_id' => null, 'active_church_id' => null],
            ['email' => 'treasurer@demo-church.test', 'name' => 'Church Treasurer', 'role' => UserRole::TREASURER, 'church_id' => $church->id, 'member_id' => null, 'active_church_id' => null],
            ['email' => 'secretary@demo-church.test', 'name' => 'Church Secretary', 'role' => UserRole::SECRETARY, 'church_id' => $church->id, 'member_id' => null, 'active_church_id' => null],
            ['email' => 'david.ochieng@example.com', 'name' => 'David Ochieng', 'role' => UserRole::MEMBER, 'church_id' => $church->id, 'member_id' => $members['m0000001-0000-0000-0000-000000000001']->id, 'active_church_id' => null],
        ];

        foreach ($accounts as $account) {
            User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => $password,
                    'role' => $account['role'],
                    'church_id' => $account['church_id'],
                    'member_id' => $account['member_id'],
                    'active_church_id' => $account['active_church_id'],
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
