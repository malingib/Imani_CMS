<?php

namespace App\Enums;

enum MemberStatus: string
{
    case ACTIVE = 'Active';
    case INACTIVE = 'Inactive';
    case VISITOR = 'Visitor';
    case YOUTH = 'Youth';
    case DECEASED = 'Deceased';
    case ARCHIVED = 'Archived';
}
