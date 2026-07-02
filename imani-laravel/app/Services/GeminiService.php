<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    public function prompt(string $message): string
    {
        $apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY'));

        if (empty($apiKey)) {
            throw new \RuntimeException('GEMINI_API_KEY is not configured.');
        }

        $response = Http::timeout(60)->post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='.$apiKey,
            [
                'contents' => [['parts' => [['text' => $message]]]],
            ]
        );

        if ($response->failed()) {
            Log::error('Gemini API error', ['body' => $response->body()]);
            throw new \RuntimeException('Gemini request failed.');
        }

        return $response->json('candidates.0.content.parts.0.text') ?? '';
    }

    public function sermonOutline(string $topic, string $scripture): string
    {
        return $this->prompt("Act as a seasoned Kenyan pastor. Create a structured sermon outline for the topic: \"{$topic}\" based on scripture \"{$scripture}\". Include an introduction, 3 main points with Kenyan context/examples, and a concluding call to action. Keep it inspiring and culturally relevant.");
    }

    public function bibleReflection(string $reference): string
    {
        return $this->prompt("Act as a Bible Scholar and Kenyan Pastor.\nTask: Retrieve the text of the following scripture reference: \"{$reference}\".\nProvide the response in two parts:\n1. The exact text of the verse(s).\n2. A brief, 100-word reflection or \"Exegesis\" focusing on its application for a modern Kenyan congregation.\n\nFormat:\nTEXT: [Verse text here]\nREFLECTION: [Your reflection here]");
    }

    public function inspirationalMessage(string $topic): string
    {
        return $this->prompt("Write a short, powerful, 100-word inspirational message for a church WhatsApp group. Topic: \"{$topic}\". Use Kenyan cultural nuances and include 1 relevant Bible verse.");
    }

    public function dailyVerse(): string
    {
        $seed = time();

        return $this->prompt("Generate one unique, powerful, and encouraging Bible verse.\nSeed: {$seed}.\nAvoid repeating common verses like Jeremiah 29:11 or Psalm 23 unless they are exceptionally fitting.\nFocus on themes of hope, resilience, leadership, or community grace.\nIMPORTANT: Return ONLY in this exact format: \"Verse Text | Reference\".");
    }

    public function outreachScout(string $query, ?float $lat = null, ?float $lng = null): string
    {
        $hint = ($lat && $lng) ? " User coordinates: {$lat}, {$lng}." : '';

        return $this->prompt("As a church outreach coordinator, find 3-4 specific real-world locations for this request: \"{$query}\". Focus on public accessibility, safety, and community visibility in a Kenyan context.{$hint}");
    }

    public function analyzeFinances(array $transactions): array
    {
        $text = $this->prompt('Analyze these church transactions from a Kenyan context. Return strict JSON with keys "summary" and "recommendations" where recommendations is an array of strings. Transactions: '.json_encode($transactions));

        try {
            return json_decode($text, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return ['summary' => $text, 'recommendations' => []];
        }
    }
}
