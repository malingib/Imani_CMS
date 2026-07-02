<?php

namespace App\Enums;

enum AppView: string
{
    case DASHBOARD = 'DASHBOARD';
    case MEMBERS = 'MEMBERS';
    case FINANCE = 'FINANCE';
    case GROUPS = 'GROUPS';
    case EVENTS = 'EVENTS';
    case COMMUNICATION = 'COMMUNICATION';
    case REPORTS = 'REPORTS';
    case SERMONS = 'SERMONS';
    case ANALYTICS = 'ANALYTICS';
    case SETTINGS = 'SETTINGS';
    case AUDIT_LOGS = 'AUDIT_LOGS';
    case BILLING = 'BILLING';
    case MY_PORTAL = 'MY_PORTAL';
    case MY_GIVING = 'MY_GIVING';
    case PRIVACY = 'PRIVACY';
    case COMPLIANCE = 'COMPLIANCE';
    case SECURITY = 'SECURITY';
    case PLATFORM_DASHBOARD = 'PLATFORM_DASHBOARD';
    case TENANTS = 'TENANTS';
    case INVITATIONS = 'INVITATIONS';
    case PLATFORM_SETTINGS = 'PLATFORM_SETTINGS';
}
