<?php

namespace App\Enums;

enum CommunicationStatus: string
{
    case SENT = 'Sent';
    case SCHEDULED = 'Scheduled';
    case FAILED = 'Failed';
}
