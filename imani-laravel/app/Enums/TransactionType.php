<?php

namespace App\Enums;

enum TransactionType: string
{
    case TITHE = 'Tithe';
    case OFFERING = 'Offering';
    case PROJECT = 'Project';
    case HARAMBEE = 'Harambee';
    case BENEVOLENCE = 'Benevolence';
    case EXPENSE = 'Expense';
    case SALARY = 'Salary';
    case UTILITY = 'Utility';
    case MAINTENANCE = 'Maintenance';
}
