<?php

namespace App\Enums;

enum TransactionSource: string
{
    case MANUAL = 'MANUAL';
    case INTEGRATED = 'INTEGRATED';
}
