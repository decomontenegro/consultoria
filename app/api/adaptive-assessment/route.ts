/**
 * POST /api/adaptive-assessment
 *
 * Initialize a new adaptive assessment session
 *
 * Request:
 * {
 *   persona: UserPersona,
 *   partialData?: Partial<AssessmentData>
 * }
 *
 * Response:
 * {
 *   sessionId: string,
 *   success: true
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/sessions/unified-session-manager';
import type { UserPersona, DeepPartial, AssessmentData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Safe parsing: handle empty body gracefully
    const bodyText = await request.text();
    const body = bodyText.trim() ? JSON.parse(bodyText) : {};
    const { persona: providedPersona, partialData = {} } = body;

    // ✅ FIX: Infer persona from userExpertise (from Step -2) instead of defaulting to technical
    const userExpertise: string[] = (partialData as any).userExpertise || [];

    let inferredPersona: UserPersona = 'board-executive'; // Default non-technical

    if (userExpertise.includes('engineering-tech')) {
      inferredPersona = 'engineering-tech';
    } else if (userExpertise.includes('product-ux')) {
      inferredPersona = 'product-business';
    } else if (userExpertise.includes('finance-ops')) {
      inferredPersona = 'finance-ops';
    } else if (userExpertise.includes('strategy-business')) {
      inferredPersona = 'board-executive';
    }

    // Use provided persona, or inferred from expertise, or default to board-executive
    const persona = providedPersona || inferredPersona;

    console.log('🎯 [Adaptive] Persona selection:', {
      provided: providedPersona,
      userExpertise,
      inferred: inferredPersona,
      final: persona
    });

    const validPersonas = ['board-executive', 'engineering-tech', 'product-business', 'finance-ops', 'it-devops'];

    // Validate persona format
    if (!validPersonas.includes(persona)) {
      return NextResponse.json(
        { error: `Invalid persona. Must be one of: ${validPersonas.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('🚀 [Adaptive Assessment] Initializing session for persona:', persona, providedPersona ? '(provided)' : userExpertise.length > 0 ? '(inferred from expertise)' : '(default non-technical)');

    // Calculate initial persona confidence based on how we got here
    // If we have partialData from AI Router, confidence is higher
    // If inferred from userExpertise (Step -2), confidence is high (explicit user selection)
    // If persona not provided and no expertise, confidence is low (will be detected during conversation)
    const hasPartialData = Object.keys(partialData).length > 0;
    const hasExpertise = userExpertise.length > 0;

    let personaConfidence = 0.3; // Default low (will detect)
    if (providedPersona) {
      personaConfidence = hasPartialData ? 0.8 : 0.6;
    } else if (hasExpertise) {
      personaConfidence = 0.75; // High confidence from explicit expertise selection
    }

    // Create session using unified session manager
    const context = createSession({
      mode: 'ai-readiness',
      initialPersona: persona as UserPersona,
      initialData: partialData as DeepPartial<AssessmentData>,
    });

    // Update persona confidence if we calculated a custom one
    if (personaConfidence !== 0.5) {
      context.personaConfidence = personaConfidence;
    }

    console.log('✅ [Adaptive Assessment] Session created:', {
      sessionId: context.sessionId,
      persona,
      personaConfidence,
      hasPartialData
    });

    return NextResponse.json({
      sessionId: context.sessionId,
      success: true
    });

  } catch (error) {
    console.error('❌ [Adaptive Assessment] Initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize session' },
      { status: 500 }
    );
  }
}
