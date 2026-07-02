<?php

namespace App\Enums;

enum TransactionCategory: string
{
    case INCOME = 'Income';
    case EXPENSE = 'Expense';
}
