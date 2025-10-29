import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { generateConsultationSystemPrompt } from '@/lib/prompts/consultation-prompt';
import { generateSpecialistSystemPrompt, SpecialistType } from '@/lib/prompts/specialist-prompts';
import { AssessmentData, UserPersona } from '@/lib/types';

// Types for API
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConsultRequestBody {
  messages: Message[];
  assessmentData: AssessmentData;
  specialistType?: SpecialistType; // Optional: for multi-specialist consultations
}

// Jargon validation: terms to avoid and their replacements by persona
const jargonReplacements: Record<UserPersona, Record<string, string>> = {
  'board-executive': {
    'débito técnico': 'limitações do sistema',
    'deploy pipeline': 'processo de lançamento',
    'code coverage': 'cobertura de qualidade',
    'ci/cd': 'automação de entregas',
    'refactoring': 'modernização do código',
    'merge conflicts': 'problemas de integração',
    'technical debt': 'limitações técnicas acumuladas',
  },
  'finance-ops': {
    'merge conflicts': 'conflitos no processo',
    'refactoring': 'reestruturação',
    'technical debt': 'passivo técnico',
    'ci/cd': 'automação de processos',
  },
  'product-business': {
    'ci/cd': 'automação de lançamentos',
    'code review': 'revisão de qualidade',
    'test coverage': 'cobertura de testes de qualidade',
  },
  'engineering-tech': {}, // Can use technical jargon freely
  'it-devops': {}, // Can use technical jargon freely
};

/**
 * Validates and sanitizes Claude's response to remove inappropriate jargon
 * for the given persona
 */
function validateAndSanitizeResponse(text: string, persona: UserPersona): string {
  const replacements = jargonReplacements[persona];

  // If persona can use technical jargon freely, return as-is
  if (!replacements || Object.keys(replacements).length === 0) {
    return text;
  }

  let sanitized = text;
  let violationsFound: string[] = [];

  // Check and replace forbidden jargon
  Object.entries(replacements).forEach(([jargon, replacement]) => {
    const regex = new RegExp(jargon, 'gi');
    if (regex.test(sanitized)) {
      violationsFound.push(jargon);
      sanitized = sanitized.replace(regex, replacement);
    }
  });

  // Log violations for monitoring (in production, send to analytics)
  if (violationsFound.length > 0) {
    console.warn(`⚠️  Jargon detected and replaced for ${persona}:`, violationsFound);
  }

  return sanitized;
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: ConsultRequestBody = await req.json();
    const { messages, assessmentData, specialistType } = body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    if (!assessmentData) {
      return NextResponse.json(
        { error: 'Assessment data required' },
        { status: 400 }
      );
    }

    // Generate system prompt based on specialist type or default consultation
    const systemPrompt = specialistType
      ? generateSpecialistSystemPrompt(specialistType, assessmentData as AssessmentData)
      : generateConsultationSystemPrompt(assessmentData);

    // If messages array is empty (start of conversation), add initial user message
    // Claude API requires at least one message
    const conversationMessages = messages.length === 0
      ? [{ role: 'user' as const, content: 'Olá! Estou pronto para responder suas perguntas sobre minha empresa.' }]
      : messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

    console.log('[API /api/consult] Calling Claude with:', {
      specialistType,
      messageCount: conversationMessages.length,
      systemPromptLength: systemPrompt.length
    });

    // Call Anthropic API with streaming
    const stream = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationMessages,
      stream: true,
    });

    // Create readable stream for client with jargon validation
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedText = ''; // Buffer for validation

          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              let text = event.delta.text;

              // Accumulate text for better validation context
              accumulatedText += text;

              // Apply jargon validation and sanitization
              const sanitized = validateAndSanitizeResponse(text, assessmentData.persona);

              // If text was changed, log it
              if (sanitized !== text) {
                text = sanitized;
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }

            if (event.type === 'message_stop') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Anthropic API error:', error);

    // Handle specific Anthropic errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process consultation request', details: error.message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'AI Consultation API',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
}
