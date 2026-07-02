<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('gemini')]
#[Model('gemini-2.0-flash')]
class DailyVerseAgent implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You generate unique, encouraging Bible verses. Avoid overused verses unless exceptionally fitting. Focus on hope, resilience, leadership, or community grace.';
    }

    public function generate(): string
    {
        $seed = time();

        return (string) $this->prompt(
            "Generate one unique, powerful, and encouraging Bible verse. Seed: {$seed}. Return ONLY in this exact format: \"Verse Text | Reference\"."
        );
    }
}
