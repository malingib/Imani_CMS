/**
 * Web Worker for parsing CSV files in background thread
 * Prevents UI blocking for large CSV imports
 */

export interface ParseCsvMessage {
  type: 'PARSE_CSV';
  payload: {
    csv: string;
    headers?: string[];
  };
}

export interface ParseResultMessage {
  type: 'PARSE_RESULT';
  payload: {
    success: boolean;
    rows?: Record<string, string>[];
    error?: string;
  };
}

/**
 * Parse CSV string into array of objects
 * Handles quotes, commas in values, and empty rows
 */
function parseCsv(csv: string, customHeaders?: string[]): Record<string, string>[] {
  const lines = csv.split('\n');
  if (lines.length < 1) return [];

  // Extract or use provided headers
  const headerLine = lines[0];
  const headers = customHeaders || parseHeader(headerLine);

  if (headers.length === 0) {
    throw new Error('No headers found in CSV');
  }

  const rows: Record<string, string>[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty rows

    try {
      const values = parseRow(line);

      // Map values to headers
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    } catch (error) {
      console.warn(`Error parsing row ${i + 1}:`, error);
      // Continue parsing other rows instead of throwing
    }
  }

  return rows;
}

/**
 * Parse CSV header line
 */
function parseHeader(line: string): string[] {
  return parseRow(line).map(h => h.trim().toLowerCase());
}

/**
 * Parse a single CSV row, handling quoted values with commas
 * Supports:
 * - Quoted values with commas: "value, with, commas"
 * - Escaped quotes: "value with ""quotes"""
 * - Unquoted values
 */
function parseRow(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add last field
  values.push(current.trim());

  return values;
}

/**
 * Message handler for worker
 */
self.onmessage = (event: MessageEvent<ParseCsvMessage>) => {
  const { type, payload } = event.data;

  if (type === 'PARSE_CSV') {
    try {
      const { csv, headers } = payload;
      const rows = parseCsv(csv, headers);

      const response: ParseResultMessage = {
        type: 'PARSE_RESULT',
        payload: {
          success: true,
          rows,
        },
      };

      self.postMessage(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const response: ParseResultMessage = {
        type: 'PARSE_RESULT',
        payload: {
          success: false,
          error: errorMessage,
        },
      };

      self.postMessage(response);
    }
  }
};

export {};
