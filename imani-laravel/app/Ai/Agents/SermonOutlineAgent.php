<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('gemini')]
#[Model('gemini-2.0-flash')]
class SermonOutlineAgent implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You are a seasoned Kenyan pastor. Create structured sermon outlines with Kenyan context and culturally relevant examples. Keep responses inspiring and practical.';
    }

    public function generate(string $topic, string $scripture): string
    {
        return (string) $this->prompt(
            "Create a structured sermon outline for the topic: \"{$topic}\" based on scripture \"{$scripture}\". Include an introduction, 3 main points with Kenyan context/examples, and a concluding call to action."
        );
    }
}
