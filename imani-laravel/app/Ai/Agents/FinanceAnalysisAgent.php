<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('gemini')]
#[Model('gemini-2.0-flash')]
class FinanceAnalysisAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You analyze church finances from a Kenyan context. Provide actionable summaries and practical recommendations for church leadership.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'summary' => $schema->string()->required(),
            'recommendations' => $schema->array()->items($schema->string())->required(),
        ];
    }

    public function analyze(array $transactions): array
    {
        $response = $this->prompt(
            'Analyze these church transactions. Provide a summary and an array of recommendations. Transactions: '.json_encode($transactions)
        );

        if (is_array($response)) {
            return $response;
        }

        $decoded = json_decode((string) $response, true);

        return is_array($decoded) ? $decoded : [
            'summary' => (string) $response,
            'recommendations' => [],
        ];
    }
}
