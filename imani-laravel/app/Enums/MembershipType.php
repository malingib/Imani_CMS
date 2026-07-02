<?php

namespace App\Enums;

enum MembershipType: string
{
    case FULL = 'Full Member';
    case PROBATION = 'Probation';
    case ASSOCIATE = 'Associate';
    case CLERGY = 'Clergy';
    case NON_COMMUNICANT = 'Non-Communicant';
}
