<?php

namespace App\Enums;

enum MpesaPurpose: string
{
    case GIVING = 'giving';
    case PLATFORM_SUBSCRIPTION = 'platform_subscription';
    case PLATFORM_INVOICE = 'platform_invoice';
}
