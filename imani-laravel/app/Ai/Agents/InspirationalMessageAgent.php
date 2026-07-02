<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('gemini')]
#[Model('gemini-2.0-flash')]
class InspirationalMessageAgent implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You write short, powerful inspirational messages for church WhatsApp groups with Kenyan cultural nuances.';
    }

    public function generate(string $topic): string
    {
        return (string) $this->prompt(
            "Write a short, powerful, 100-word inspirational message for a church WhatsApp group. Topic: \"{$topic}\". Use Kenyan cultural nuances and include 1 relevant Bible verse."
        );
    }
}
