<?php

namespace App\Enums;

enum CommunicationType: string
{
    case SMS = 'SMS';
    case EMAIL = 'Email';
    case WHATSAPP = 'WhatsApp';
}
