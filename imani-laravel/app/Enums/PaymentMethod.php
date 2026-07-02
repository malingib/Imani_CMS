<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case MPESA = 'M-Pesa';
    case CASH = 'Cash';
    case BANK_TRANSFER = 'Bank Transfer';
    case CHEQUE = 'Cheque';
}
