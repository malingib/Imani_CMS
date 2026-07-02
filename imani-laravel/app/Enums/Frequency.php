<?php

namespace App\Enums;

enum Frequency: string
{
    case WEEKLY = 'Weekly';
    case MONTHLY = 'Monthly';
    case QUARTERLY = 'Quarterly';
    case YEARLY = 'Yearly';
}
