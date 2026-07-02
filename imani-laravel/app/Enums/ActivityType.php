<?php

namespace App\Enums;

enum ActivityType: string
{
    case PAYMENT = 'PAYMENT';
    case EVENT_RSVP = 'EVENT_RSVP';
    case PROFILE_UPDATE = 'PROFILE_UPDATE';
    case GROUP_JOIN = 'GROUP_JOIN';
}
