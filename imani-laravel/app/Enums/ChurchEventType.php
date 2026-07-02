<?php

namespace App\Enums;

enum ChurchEventType: string
{
    case WORSHIP = 'WORSHIP';
    case BIBLE_STUDY = 'BIBLE_STUDY';
    case PRAYER = 'PRAYER';
    case OUTREACH = 'OUTREACH';
    case YOUTH = 'YOUTH';
    case OTHER = 'OTHER';
}
