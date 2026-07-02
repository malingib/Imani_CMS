<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('gemini')]
#[Model('gemini-2.0-flash')]
class BibleReflectionAgent implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You are a Bible scholar and Kenyan pastor. Provide accurate scripture text and brief reflections for modern Kenyan congregations.';
    }

    public function reflect(string $reference): string
    {
        return (string) $this->prompt(
            "Retrieve the text of the following scripture reference: \"{$reference}\". Provide the response in two parts:\n1. The exact text of the verse(s).\n2. A brief, 100-word reflection focusing on its application for a modern Kenyan congregation.\n\nFormat:\nTEXT: [Verse text here]\nREFLECTION: [Your reflection here]"
        );
    }
}
