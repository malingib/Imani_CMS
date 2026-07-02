<?php

return [

  'environment' => env('MPESA_ENV', 'sandbox'),

  'consumer_key' => env('MPESA_CONSUMER_KEY'),
  'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
  'passkey' => env('MPESA_PASSKEY'),
  'shortcode' => env('MPESA_SHORTCODE', '174379'),

  'callback_url' => env('MPESA_CALLBACK_URL', rtrim((string) env('APP_URL', 'http://localhost'), '/').'/mpesa/callback'),

  'base_url' => env('MPESA_ENV', 'sandbox') === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke',

  'tiers' => [
        'basic' => (int) env('MPESA_TIER_BASIC_KES', 2500),
        'pro' => (int) env('MPESA_TIER_PRO_KES', 4500),
  ],

];
