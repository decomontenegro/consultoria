/**
 * Business Quiz - LLM Integration
 *
 * Wrapper for Claude API calls with retry logic and error handling
 */

import Anthropic from '@anthropic-ai/sdk';

// Validate API key availability
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_api_key_here') {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. Please set it in your .env.local file.\n' +
      'Get your API key from: https://console.anthropic.com/settings/keys'
    );
  }

  return new Anthropic({ apiKey });
}

// Initialize Anthropic client (lazy initialization)
let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropic) {
    anthropic = getAnthropicClient();
  }
  return anthropic;
}

// ============================================================================
// TYPES
// ============================================================================

export interface LLMCallOptions {
  model?: 'haiku' | 'sonnet';
  maxTokens?: number;
  temperature?: number;
  timeout?: number; // milliseconds
  retries?: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  cost: number; // in BRL
}

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

const MODEL_CONFIGS = {
  haiku: {
    id: 'claude-haiku-4-5-20250815',
    costPer1kInput: 0.0001 * 5.5, // $0.0001 * 5.5 (USD to BRL)
    costPer1kOutput: 0.0005 * 5.5,
  },
  sonnet: {
    id: 'claude-sonnet-4-5-20250929',
    costPer1kInput: 0.0015 * 5.5, // $0.0015 * 5.5 (USD to BRL)
    costPer1kOutput: 0.0075 * 5.5,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateCost(
  model: 'haiku' | 'sonnet',
  inputTokens: number,
  outputTokens: number
): number {
  const config = MODEL_CONFIGS[model];
  const inputCost = (inputTokens / 1000) * config.costPer1kInput;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutput;
  return inputCost + outputCost;
}

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('LLM_TIMEOUT')), ms)
  );
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN LLM CALL FUNCTION
// ============================================================================

/**
 * Call Claude LLM with retry logic and error handling
 *
 * @param prompt - The prompt to send to Claude
 * @param options - Configuration options
 * @returns LLM response with text, usage, and cost
 *
 * @example
 * const response = await callLLM('Analyze this...', {
 *   model: 'sonnet',
 *   maxTokens: 1024,
 *   retries: 2
 * });
 */
export async function callLLM(
  prompt: string,
  options: LLMCallOptions = {}
): Promise<LLMResponse> {
  const {
    model = 'sonnet',
    maxTokens = 2048,
    temperature = 0.3,
    timeout: timeoutMs = 30000, // 30s default
    retries = 2,
  } = options;

  const modelConfig = MODEL_CONFIGS[model];

  // Try up to retries times
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🤖 [LLM] Calling ${model} (attempt ${attempt}/${retries})...`);

      // Get client (validates API key)
      const client = getClient();

      // Race between API call and timeout
      const response = await Promise.race([
        client.messages.create({
          model: modelConfig.id,
          max_tokens: maxTokens,
          temperature,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
        timeout(timeoutMs * attempt), // Increase timeout on retries
      ]);

      // Extract text from response
      const text = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Calculate cost
      const cost = calculateCost(
        model,
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      console.log(`✅ [LLM] Success! Tokens: ${response.usage.input_tokens + response.usage.output_tokens}, Cost: R$${cost.toFixed(4)}`);

      return {
        text,
        model: modelConfig.id,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        cost,
      };
    } catch (error: any) {
      console.error(`❌ [LLM] Attempt ${attempt} failed:`, error.message);

      // If last attempt, throw error
      if (attempt === retries) {
        throw new Error(
          `LLM call failed after ${retries} attempts: ${error.message}`
        );
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      console.log(`⏳ [LLM] Retrying in ${backoffMs}ms...`);
      await delay(backoffMs);
    }
  }

  // Should never reach here
  throw new Error('LLM call failed unexpectedly');
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Call Claude Haiku (fast, cheap, simple tasks)
 */
export async function callHaiku(
  prompt: string,
  maxTokens: number = 1024
): Promise<LLMResponse> {
  return callLLM(prompt, {
    model: 'haiku',
    maxTokens,
    temperature: 0.3,
    timeout: 15000, // 15s
    retries: 2,
  });
}

/**
 * Call Claude Sonnet (complex analysis, high quality)
 */
export async function callSonnet(
  prompt: string,
  maxTokens: number = 2048
): Promise<LLMResponse> {
  return callLLM(prompt, {
    model: 'sonnet',
    maxTokens,
    temperature: 0.3,
    timeout: 30000, // 30s
    retries: 2,
  });
}

// ============================================================================
// COST TRACKING
// ============================================================================

interface CostTracker {
  totalCalls: number;
  totalCost: number;
  callsBySonnet: number;
  callsByHaiku: number;
}

const costTracker: CostTracker = {
  totalCalls: 0,
  totalCost: 0,
  callsBySonnet: 0,
  callsByHaiku: 0,
};

/**
 * Track LLM costs (call after each LLM call)
 */
export function trackLLMCost(model: 'haiku' | 'sonnet', cost: number): void {
  costTracker.totalCalls++;
  costTracker.totalCost += cost;

  if (model === 'sonnet') {
    costTracker.callsBySonnet++;
  } else {
    costTracker.callsByHaiku++;
  }

  // Alert if cost exceeds budget
  if (cost > 1.5) {
    console.warn(`⚠️ [LLM] High cost alert: R$${cost.toFixed(2)}`);
  }
}

/**
 * Get cost statistics
 */
export function getLLMCostStats(): CostTracker {
  return { ...costTracker };
}

/**
 * Reset cost tracker
 */
export function resetLLMCostTracker(): void {
  costTracker.totalCalls = 0;
  costTracker.totalCost = 0;
  costTracker.callsBySonnet = 0;
  costTracker.callsByHaiku = 0;
}
