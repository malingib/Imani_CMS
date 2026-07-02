import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseCsvParserOptions {
  headers?: string[];
}

export interface UseCsvParserResult {
  isWorking: boolean;
  error: string | null;
  parseCsv: (csv: string) => Promise<Record<string, string>[]>;
}

/**
 * Hook for parsing CSV files using Web Worker
 * Prevents UI blocking for large files
 *
 * @example
 * const { isWorking, error, parseCsv } = useWorkerCSVParser();
 *
 * const handleFile = async (file: File) => {
 *   const text = await file.text();
 *   const rows = await parseCsv(text);
 *   console.log(`Parsed ${rows.length} rows`);
 * };
 */
export const useWorkerCSVParser = (
  options: UseCsvParserOptions = {}
): UseCsvParserResult => {
  const workerRef = useRef<Worker | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolveRef = useRef<((rows: Record<string, string>[]) => void) | null>(null);
  const rejectRef = useRef<((error: string) => void) | null>(null);

  // Initialize worker
  useEffect(() => {
    // Create worker from the public file
    workerRef.current = new Worker('/workers/csv-parser.worker.ts', {
      type: 'module',
    });

    // Handle worker messages
    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'PARSE_RESULT') {
        setIsWorking(false);

        if (payload.success && payload.rows) {
          resolveRef.current?.(payload.rows);
          setError(null);
        } else {
          const errorMessage = payload.error || 'Unknown error';
          rejectRef.current?.(errorMessage);
          setError(errorMessage);
        }

        // Clear resolve/reject
        resolveRef.current = null;
        rejectRef.current = null;
      }
    };

    // Handle worker errors
    workerRef.current.onerror = (event) => {
      setIsWorking(false);
      const errorMessage = event.message || 'Worker error';
      rejectRef.current?.(errorMessage);
      setError(errorMessage);

      // Clear resolve/reject
      resolveRef.current = null;
      rejectRef.current = null;
    };

    // Cleanup
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const parseCsv = useCallback((csv: string): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      // Store resolve/reject for worker callback
      resolveRef.current = resolve;
      rejectRef.current = reject;
      setIsWorking(true);
      setError(null);

      // Send message to worker
      workerRef.current.postMessage({
        type: 'PARSE_CSV',
        payload: {
          csv,
          headers: options.headers,
        },
      });
    });
  }, [options.headers]);

  return {
    isWorking,
    error,
    parseCsv,
  };
};
