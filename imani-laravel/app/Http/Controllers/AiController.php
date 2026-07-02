<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function sermonOutline(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => 'required|string|max:500',
            'scripture' => 'required|string|max:500',
        ]);

        return response()->json([
            'response' => $this->gemini->sermonOutline($validated['topic'], $validated['scripture']),
        ]);
    }

    public function bibleReflection(Request $request): JsonResponse
    {
        $validated = $request->validate(['reference' => 'required|string|max:200']);

        return response()->json([
            'response' => $this->gemini->bibleReflection($validated['reference']),
        ]);
    }

    public function inspirationalMessage(Request $request): JsonResponse
    {
        $validated = $request->validate(['topic' => 'required|string|max:500']);

        return response()->json([
            'response' => $this->gemini->inspirationalMessage($validated['topic']),
        ]);
    }

    public function dailyVerse(): JsonResponse
    {
        return response()->json(['response' => $this->gemini->dailyVerse()]);
    }

    public function outreachScout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|max:1000',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        return response()->json([
            'response' => $this->gemini->outreachScout(
                $validated['query'],
                $validated['latitude'] ?? null,
                $validated['longitude'] ?? null,
            ),
            'groundingChunks' => [],
        ]);
    }

    public function financeAnalysis(Request $request): JsonResponse
    {
        $validated = $request->validate(['transactions' => 'required|array']);

        return response()->json($this->gemini->analyzeFinances($validated['transactions']));
    }
}
