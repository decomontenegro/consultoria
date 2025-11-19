/**
 * Business Quiz - LLM Response Parser
 *
 * Parses and validates LLM responses with multiple fallback strategies
 */

import { z } from 'zod';

// ============================================================================
// PARSER FUNCTIONS
// ============================================================================

/**
 * Parse LLM response text to extract JSON
 *
 * Tries multiple strategies:
 * 1. Direct JSON parse
 * 2. Extract from markdown code blocks
 * 3. Extract any JSON object from text
 * 4. Extract from multiple JSON objects (use first valid)
 *
 * @param responseText - Raw text from LLM
 * @returns Parsed object or null
 */
export function extractJSON(responseText: string): any | null {
  // Strategy 1: Direct JSON parse
  try {
    return JSON.parse(responseText);
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Extract from markdown code blocks
  const markdownMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (markdownMatch) {
    try {
      return JSON.parse(markdownMatch[1]);
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 3: Extract any JSON object
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 4: Try to find multiple JSON objects and use first valid
  const multiJsonMatches = responseText.matchAll(/\{[^{}]*\}/g);
  for (const match of multiJsonMatches) {
    try {
      return JSON.parse(match[0]);
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Parse and validate LLM response against Zod schema
 *
 * @param responseText - Raw text from LLM
 * @param schema - Zod schema to validate against
 * @param fallback - Default value if parsing fails
 * @returns Validated object
 *
 * @example
 * const result = parseLLMResponse(
 *   llmResponse.text,
 *   ExpertiseDetectionSchema,
 *   { detectedArea: 'marketing-growth', confidence: 0.5 }
 * );
 */
export function parseLLMResponse<T>(
  responseText: string,
  schema: z.ZodSchema<T>,
  fallback?: T
): T {
  // Try to extract JSON
  const extracted = extractJSON(responseText);

  if (!extracted) {
    console.warn('[LLM Parser] No JSON found in response');
    if (fallback) {
      console.warn('[LLM Parser] Using fallback value');
      return fallback;
    }
    throw new Error('Failed to extract JSON from LLM response');
  }

  // Validate against schema
  try {
    return schema.parse(extracted);
  } catch (error) {
    console.error('[LLM Parser] Schema validation failed:', error);

    if (fallback) {
      console.warn('[LLM Parser] Using fallback value');
      return fallback;
    }

    throw new Error(
      `LLM response does not match expected schema: ${error}`
    );
  }
}

/**
 * Parse LLM response with safe fallback (never throws)
 *
 * @param responseText - Raw text from LLM
 * @param schema - Zod schema to validate against
 * @param fallback - Default value if parsing fails
 * @returns Validated object (guaranteed to return fallback if parsing fails)
 */
export function parseLLMResponseSafe<T>(
  responseText: string,
  schema: z.ZodSchema<T>,
  fallback: T
): T {
  try {
    return parseLLMResponse(responseText, schema, fallback);
  } catch (error) {
    console.error('[LLM Parser] Parsing failed completely, using fallback');
    return fallback;
  }
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema for Expertise Detection response
 */
export const ExpertiseDetectionSchema = z.object({
  detectedArea: z.enum([
    'marketing-growth',
    'sales-commercial',
    'product',
    'operations-logistics',
    'financial',
    'people-culture',
    'technology-data',
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(20),
  signals: z.array(
    z.object({
      area: z.enum([
        'marketing-growth',
        'sales-commercial',
        'product',
        'operations-logistics',
        'financial',
        'people-culture',
        'technology-data',
      ]),
      score: z.number().min(0).max(1),
      evidences: z.array(z.string()),
    })
  ).optional(),
});

export type ExpertiseDetectionResult = z.infer<typeof ExpertiseDetectionSchema>;

/**
 * Schema for Risk Area Selection response
 */
export const RiskAreaSelectionSchema = z.object({
  selectedAreas: z.array(
    z.enum([
      'marketing-growth',
      'sales-commercial',
      'product',
      'operations-logistics',
      'financial',
      'people-culture',
      'technology-data',
    ])
  ).min(3).max(3), // Exactly 3 areas
  reasoning: z.string().min(20),
});

export type RiskAreaSelectionResult = z.infer<typeof RiskAreaSelectionSchema>;

/**
 * Schema for Health Score
 */
export const HealthScoreSchema = z.object({
  area: z.enum([
    'marketing-growth',
    'sales-commercial',
    'product',
    'operations-logistics',
    'financial',
    'people-culture',
    'technology-data',
  ]),
  score: z.number().min(0).max(100),
  status: z.enum(['critical', 'attention', 'good', 'excellent']),
  keyMetrics: z.array(
    z.object({
      name: z.string(),
      value: z.union([z.string(), z.number()]),
      benchmark: z.union([z.string(), z.number()]).optional(),
      status: z.enum(['below', 'at', 'above']),
    })
  ),
});

/**
 * Schema for Detected Pattern
 */
export const DetectedPatternSchema = z.object({
  pattern: z.string(),
  evidence: z.array(z.string()),
  impact: z.enum(['high', 'medium', 'low']),
});

/**
 * Schema for Root Cause
 */
export const RootCauseSchema = z.object({
  issue: z.string(),
  relatedAreas: z.array(z.string()),
  explanation: z.string(),
});

/**
 * Schema for Recommendation
 */
export const RecommendationSchema = z.object({
  area: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  expectedImpact: z.string(),
  timeframe: z.string(),
  effort: z.enum(['low', 'medium', 'high']),
  dependencies: z.array(z.string()).optional(),
});

/**
 * Schema for Roadmap Phase
 */
export const RoadmapPhaseSchema = z.object({
  phase: z.enum(['30-days', '60-days', '90-days']),
  focus: z.array(z.string()),
  keyActions: z.array(z.string()),
});

/**
 * Schema for Complete Diagnostic Generation response
 */
export const DiagnosticGenerationSchema = z.object({
  healthScores: z.array(HealthScoreSchema),
  detectedPatterns: z.array(DetectedPatternSchema),
  rootCauses: z.array(RootCauseSchema),
  recommendations: z.array(RecommendationSchema),
  roadmap: z.array(RoadmapPhaseSchema).optional(),
});

export type DiagnosticGenerationResult = z.infer<typeof DiagnosticGenerationSchema>;

// ============================================================================
// SCHEMA UTILITIES
// ============================================================================

/**
 * Create a safe version of a schema with default fallbacks
 *
 * @example
 * const SafeExpertiseSchema = makeSafeSchema(ExpertiseDetectionSchema, {
 *   detectedArea: 'marketing-growth',
 *   confidence: 0.5,
 *   reasoning: 'Could not analyze',
 *   signals: []
 * });
 */
export function makeSafeSchema<T extends z.ZodTypeAny>(
  schema: T,
  defaults: z.infer<T>
): z.ZodDefault<T> {
  return schema.catch(defaults) as z.ZodDefault<T>;
}

/**
 * Validate an object against a schema and return validation result
 */
export function validateSchema<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

// ============================================================================
// DEBUGGING UTILITIES
// ============================================================================

/**
 * Pretty print schema validation errors
 */
export function formatSchemaError(error: z.ZodError): string {
  return error.errors
    .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
    .join('\n');
}

/**
 * Log LLM response for debugging
 */
export function debugLLMResponse(
  responseText: string,
  parsed: any,
  valid: boolean
): void {
  console.log('='.repeat(60));
  console.log('🔍 LLM Response Debug');
  console.log('='.repeat(60));
  console.log('Raw text:', responseText.substring(0, 200) + '...');
  console.log('Parsed:', JSON.stringify(parsed, null, 2).substring(0, 500));
  console.log('Valid:', valid ? '✅ Yes' : '❌ No');
  console.log('='.repeat(60));
}
