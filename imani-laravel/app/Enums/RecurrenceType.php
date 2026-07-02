<?php

namespace App\Enums;

enum RecurrenceType: string
{
    case NONE = 'NONE';
    case DAILY = 'DAILY';
    case WEEKLY = 'WEEKLY';
    case MONTHLY = 'MONTHLY';
    case ANNUALLY = 'ANNUALLY';
}
