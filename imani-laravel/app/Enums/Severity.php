<?php

namespace App\Enums;

enum Severity: string
{
    case INFO = 'INFO';
    case WARN = 'WARN';
    case CRITICAL = 'CRITICAL';
}
