<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('gemini')]
#[Model('gemini-2.0-flash')]
class OutreachScoutAgent implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You are a church outreach coordinator in Kenya. Suggest specific real-world locations for outreach with public accessibility, safety, and community visibility.';
    }

    public function scout(string $query, ?float $latitude = null, ?float $longitude = null): array
    {
        $locationHint = ($latitude !== null && $longitude !== null)
            ? " User coordinates: {$latitude}, {$longitude}."
            : '';

        $text = (string) $this->prompt(
            "Find 3-4 specific real-world locations for this request: \"{$query}\". Focus on public accessibility, safety, and community visibility in a Kenyan context.{$locationHint}"
        );

        return [
            'text' => $text,
            'groundingChunks' => [],
        ];
    }
}
