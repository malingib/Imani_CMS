<?php

namespace App\Enums;

enum NotificationType: string
{
    case SYSTEM = 'SYSTEM';
    case MPESA = 'MPESA';
    case MEMBER = 'MEMBER';
    case EVENT = 'EVENT';
}
