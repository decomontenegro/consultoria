# 🧠 ULTRATHINK: Business Health Quiz - FASE 2 Implementation

**Date:** 18/11/2025
**System:** Business Health Quiz (Holistic Business Diagnostic)
**Status:** FASE 1 Complete → FASE 2 Design & Implementation Plan
**Estimated Delivery:** 8-10 business days

---

## 📋 EXECUTIVE SUMMARY

### FASE 1 Foundation (✅ Complete)
- **Question Bank:** 53 questions across 7 business areas
- **Session Manager:** In-memory storage with 2-hour TTL
- **Type System:** Complete type safety (321 lines)
- **Area Relationships:** Full dependency matrix
- **Status:** Ready for production

### FASE 2 Scope
**Goal:** Build adaptive question routing system using Claude LLM to:
1. Detect user expertise from open-ended questions
2. Route to relevant deep-dive questions
3. Intelligently select risk scan areas
4. Generate comprehensive business diagnostic

**Key Innovation:** AI-powered expertise detection + dynamic routing (vs static forms)

**Total Cost per Quiz:** R$0.80-1.00
**Total Questions:** 19 questions (7 context + 4 expertise + 5 deep-dive + 3 risk-scan)
**Estimated Time:** 8-12 minutes per quiz

---

## 🎯 API ARCHITECTURE

### Route 1: POST /api/business-quiz/start
**Purpose:** Initialize quiz session

**Response:**
```json
{
  "sessionId": "biz-quiz-1731887654321-abc123def",
  "firstQuestion": {
    "id": "ctx-001",
    "questionText": "Qual é o nome da sua empresa?",
    "inputType": "text",
    "placeholder": "Ex: TechCorp, Startup XYZ"
  },
  "progress": {
    "currentBlock": "context",
    "questionIndex": 1,
    "totalInBlock": 7
  }
}
```

---

### Route 2: POST /api/business-quiz/answer
**Purpose:** Submit answer and get next question (with AI routing)

**Request:**
```json
{
  "sessionId": "biz-quiz-...",
  "questionId": "ctx-001",
  "answer": "TechCorp"
}
```

**Response (Normal):**
```json
{
  "success": true,
  "nextQuestion": { ... },
  "progress": {
    "currentBlock": "context",
    "questionIndex": 2,
    "totalInBlock": 7,
    "overallProgress": 10
  },
  "completed": false
}
```

**Response (After Expertise Detection):**
```json
{
  "success": true,
  "nextQuestion": { "id": "mktg-001", ... },
  "blockTransition": {
    "from": "expertise",
    "to": "deep-dive",
    "message": "Detectamos sua expertise em Marketing & Growth!"
  },
  "expertiseDetected": {
    "area": "marketing-growth",
    "confidence": 0.85,
    "reasoning": "User mentioned CAC, LTV, conversion rates with specific numbers..."
  },
  "progress": { ... },
  "completed": false
}
```

---

### Route 3: POST /api/business-quiz/detect-expertise (Internal)
**Purpose:** Analyze expertise questions using Claude Sonnet

**LLM Prompt:**
```
You are a business consultant analyzing responses to identify a user's area of expertise.

COMPANY CONTEXT:
Industry: Fintech
Stage: Scaleup
Team Size: 50

QUESTIONS & ANSWERS:
Q: Qual o maior desafio que sua empresa enfrenta hoje?
A: CAC está em R$200, muito alto. Nosso LTV:CAC ratio é apenas 2:1.

Q: Se você tivesse que escolher UMA área para transformar...
A: Marketing - precisamos otimizar o funil. Conversão está em 1%.

Q: Quais métricas você acompanha semanalmente?
A: CAC, LTV, MQL to SQL conversion, activation rate, churn

Q: Descreva uma situação recente onde a empresa perdeu dinheiro...
A: Gastamos R$50k em ads, conversão foi apenas 1%, CAC explodiu

BUSINESS AREAS:
1. Marketing & Growth (CAC, LTV, acquisition, growth metrics)
2. Sales & Commercial (pipeline, win rate, sales cycle)
3. Product (development, PMF, roadmap, features)
4. Operations & Logistics (fulfillment, processes, automation)
5. Financial (runway, burn rate, profitability, planning)
6. People & Culture (hiring, turnover, culture, team)
7. Technology & Data (stack, CI/CD, tech debt, data)

TASK:
Identify which area the user knows MOST about.

OUTPUT (JSON only):
{
  "detectedArea": "marketing-growth",
  "confidence": 0.85,
  "reasoning": "User mentioned CAC, LTV, conversion rates with specific numbers. Discussed growth tactics in detail.",
  "signals": [
    {
      "area": "marketing-growth",
      "score": 0.85,
      "evidences": ["Mentioned CAC of R$200", "Discussed conversion funnel", "Talked about activation strategy"]
    }
  ]
}
```

**Model:** Claude Sonnet 4.5 (complex analysis, R$0.15 per call)

**Fallback (if LLM fails):** Rule-based algorithm
```typescript
function fallbackExpertiseDetection(answers: QuizAnswer[]): DetectionResult {
  const areaScores: Record<BusinessArea, number> = {};

  answers.forEach(answer => {
    // Score based on answer length (longer = more knowledge)
    const lengthScore = Math.min(answer.answer.length / 500, 1);

    // Keyword matching
    const keywords = AREA_KEYWORDS[answer.area];
    const keywordScore = countKeywords(answer.answer, keywords) / keywords.length;

    // Numeric mentions (indicates metrics knowledge)
    const numericScore = (answer.answer.match(/\d+/g) || []).length * 0.1;

    const totalScore = lengthScore * 0.4 + keywordScore * 0.4 + numericScore * 0.2;
    areaScores[answer.area] = (areaScores[answer.area] || 0) + totalScore;
  });

  const topArea = Object.entries(areaScores).sort((a, b) => b[1] - a[1])[0];

  return {
    detectedArea: topArea[0] as BusinessArea,
    confidence: Math.min(topArea[1] / answers.length, 0.9),
    reasoning: 'Detected via rule-based analysis (LLM unavailable)',
    signals: []
  };
}
```

---

### Route 4: POST /api/business-quiz/complete
**Purpose:** Generate final diagnostic report

**LLM Prompt (Diagnostic Generation):**
```
Generate a comprehensive business health diagnostic.

COMPANY:
{
  "name": "TechCorp",
  "industry": "Fintech",
  "stage": "scaleup",
  "teamSize": 50,
  "monthlyRevenue": "R$500k"
}

DETECTED EXPERTISE: marketing-growth

DATA COLLECTED:
{
  "marketingGrowth": {
    "primaryChannel": "Pago (Google Ads, Facebook Ads)",
    "cacKnown": true,
    "cac": 200,
    "conversionRate": 1,
    "topChallenge": "CAC muito alto, conversão baixa"
  },
  "salesCommercial": {
    "churnRate": 6
  },
  "technologyData": {
    "incidentFrequency": "weekly"
  }
}

TASK:
1. Calculate health scores (0-100) for each of 7 areas
2. Identify patterns (e.g., "high-cac-low-conversion")
3. Find root causes
4. Generate prioritized recommendations
5. Create 30-60-90 day roadmap

OUTPUT (JSON):
{
  "healthScores": [
    {
      "area": "marketing-growth",
      "score": 45,
      "status": "attention",
      "keyMetrics": [
        { "name": "CAC", "value": "R$200", "benchmark": "R$80-120", "status": "below" }
      ]
    }
  ],
  "detectedPatterns": [
    {
      "pattern": "high-cac-low-conversion",
      "evidence": ["CAC R$200", "Conversion 1%", "No automation"],
      "impact": "high"
    }
  ],
  "rootCauses": [
    {
      "issue": "High CAC driven by poor targeting and low conversion",
      "relatedAreas": ["marketing-growth", "technology-data"],
      "explanation": "Paid acquisition without proper funnel optimization or automation leads to wasted spend..."
    }
  ],
  "recommendations": [
    {
      "area": "marketing-growth",
      "priority": "critical",
      "title": "Otimizar funil de conversão",
      "description": "Implementar análise de cada etapa do funil para identificar gargalos...",
      "expectedImpact": "Reduzir CAC em 30-40% e aumentar conversão para 2-3%",
      "timeframe": "30-60 days",
      "effort": "medium",
      "dependencies": ["technology-data"]
    }
  ],
  "roadmap": [
    {
      "phase": "30-days",
      "focus": ["marketing-growth", "technology-data"],
      "keyActions": [
        "Implementar tracking completo do funil",
        "Setup automation de lead scoring",
        "Otimizar landing pages"
      ]
    }
  ]
}
```

**Model:** Claude Sonnet 4.5 (deep reasoning, R$0.60 per call)

---

### Route 5: GET /api/business-quiz/session/:sessionId
**Purpose:** Resume interrupted quiz session

**Response:**
```json
{
  "session": { ... },
  "currentQuestion": { ... },
  "progress": { ... }
}
```

---

## 🤖 LLM INTEGRATION STRATEGY

### Model Selection

| Task | Model | Cost | Latency | Reason |
|------|-------|------|---------|--------|
| Expertise Detection | Sonnet 4.5 | R$0.15 | 2-3s | Complex analysis, needs accuracy |
| Risk Area Selection | Haiku 4.5 | R$0.05 | 1s | Simple routing decision |
| Diagnostic Generation | Sonnet 4.5 | R$0.60 | 3-5s | High-quality insights required |

**Total Cost per Quiz:** R$0.80

---

### Fallback Strategies

#### 1. LLM Timeout (15s)
```typescript
async function callLLMWithFallback<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  fallbackFn: () => T
): Promise<T> {
  try {
    const response = await Promise.race([
      anthropic.messages.create({ ... }),
      timeout(15000) // 15s timeout
    ]);

    return parseLLMResponse(response.content[0].text, schema);

  } catch (error) {
    console.error('[LLM] Error:', error);
    return fallbackFn(); // Use rule-based fallback
  }
}
```

#### 2. Invalid JSON Response
```typescript
function parseLLMResponse(responseText: string): any {
  // Layer 1: Direct JSON parse
  try { return JSON.parse(responseText); } catch {}

  // Layer 2: Extract from markdown
  const markdownMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (markdownMatch) {
    try { return JSON.parse(markdownMatch[1]); } catch {}
  }

  // Layer 3: Extract any JSON object
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }

  // Layer 4: Retry with stricter prompt
  throw new Error('RETRY_WITH_STRICT_PROMPT');
}
```

#### 3. Low Confidence Detection (< 60%)
```typescript
if (detectionResult.confidence < 0.6) {
  console.warn('[Quiz] Low confidence, using fallback');
  detectionResult = fallbackExpertiseDetection(expertiseAnswers);
}
```

---

## 📊 QUESTION ROUTING LOGIC

### Complete Flow

```
START
  ↓
[Block 1: Context] (7 questions, fixed)
  → Sequential routing
  ↓
[Block 2: Expertise Detection] (4 questions, open-ended)
  → After question 4: LLM Analysis (Sonnet) →
  → Expertise Detected: "Marketing & Growth" (85% confidence)
  ↓
[Block 3: Deep-Dive] (5 questions in detected area)
  → Sequential routing in marketing-growth area
  ↓
[Block 4: Risk Scan] (3 questions, selected by LLM)
  → LLM selects 3 risk areas based on relationships →
  → Risk Areas: [Sales, Financial, Technology]
  → 1 question per area
  ↓
COMPLETE: Generate Diagnostic (LLM Sonnet)
```

**Total Questions:** 19
**Estimated Time:** 8-12 minutes

---

## 🗓️ IMPLEMENTATION PHASES

### Phase 1: Core Infrastructure (Days 1-2)
**Tasks:**
- Create API route structure
- Implement session token auth (JWT upgrade)
- Build LLM wrapper with retry logic
- Create Zod validation schemas

**Files to Create:**
```
app/api/business-quiz/
├── start/route.ts
├── answer/route.ts
├── detect-expertise/route.ts
├── complete/route.ts
└── session/[sessionId]/route.ts

lib/business-quiz/
├── llm-integration.ts       (NEW)
├── llm-parser.ts            (NEW)
└── session-auth.ts          (NEW)
```

**Time:** 12-14 hours

---

### Phase 2: Expertise Detection (Days 3-4)
**Tasks:**
- Implement expertise detection prompt
- Build fallback rule-based algorithm
- Integrate with /answer endpoint
- Add block transition logic

**Files to Create:**
```
lib/business-quiz/
├── expertise-detector.ts     (NEW)
└── expertise-fallback.ts     (NEW)
```

**Time:** 12-14 hours

---

### Phase 3: Question Routing (Days 5-6)
**Tasks:**
- Implement deep-dive routing
- Build risk scan area selection (LLM + fallback)
- Integrate area relationships matrix
- Add progress tracking

**Files to Create:**
```
lib/business-quiz/
├── question-router.ts        (NEW)
└── risk-scan-selector.ts     (NEW)
```

**Time:** 12-14 hours

---

### Phase 4: Diagnostic Generation (Days 7-8)
**Tasks:**
- Build diagnostic generation prompt
- Implement health score calculation
- Pattern detection logic
- Recommendation generation
- 30-60-90 day roadmap

**Files to Create:**
```
lib/business-quiz/
├── diagnostic-generator.ts   (NEW)
├── health-scorer.ts          (NEW)
└── pattern-detector.ts       (NEW)
```

**Time:** 16-18 hours

---

### Phase 5: Error Handling & Edge Cases (Days 9-10)
**Tasks:**
- Add comprehensive error handling
- Implement graceful degradation
- Add logging/monitoring
- Handle session expiration
- Edge case testing

**Time:** 12-14 hours

---

### Timeline Summary

| Phase | Duration | Hours | Deliverables |
|-------|----------|-------|--------------|
| 1. Core Infrastructure | 2 days | 12-14h | API routes, session auth, LLM wrapper |
| 2. Expertise Detection | 2 days | 12-14h | LLM integration, fallback logic |
| 3. Question Routing | 2 days | 12-14h | All 4 blocks, risk scan selection |
| 4. Diagnostic Generation | 2 days | 16-18h | Health scores, patterns, roadmap |
| 5. Error Handling | 2 days | 12-14h | Edge cases, monitoring, docs |
| **TOTAL** | **10 days** | **64-74h** | **Production-ready Business Health Quiz** |

**With buffer:** 12-14 business days (2.5-3 weeks)

---

## ⚠️ EDGE CASES & ERROR HANDLING

### 1. User Closes Browser Mid-Quiz
**Solution:** Session persistence + resume capability
- Save session ID to localStorage
- On page load: Check for existing session
- Backend: GET /api/business-quiz/session/:id to resume

### 2. LLM Returns Unexpected Format
**Solution:** Multi-layer parsing with fallbacks
- Try direct JSON parse
- Extract from markdown code blocks
- Extract any JSON object
- Retry with stricter prompt
- Use rule-based fallback

### 3. Session Expires (2h TTL)
**Solution:** Extend TTL on each request
- Update lastActivity on every /answer call
- Show user-friendly error if expired
- Offer to restart quiz

### 4. Rate Limiting on LLM Calls
**Solution:** Rate limiting middleware
- 10 requests per minute per IP
- Use @upstash/ratelimit or in-memory Map
- Return 429 Too Many Requests

### 5. Low Confidence Expertise Detection
**Solution:** Blend LLM + rule-based
- If confidence < 60%, use fallback
- Combine LLM signals with keyword analysis
- Allow user to override detected area

---

## 💰 COST & PERFORMANCE ANALYSIS

### Cost per Quiz Completion

| Component | Model | Tokens | Cost |
|-----------|-------|--------|------|
| Expertise Detection | Sonnet | ~2000 | R$0.15 |
| Risk Area Selection | Haiku | ~500 | R$0.05 |
| Diagnostic Generation | Sonnet | ~4000 | R$0.60 |
| **Total** | | **~6500** | **R$0.80** |

### Monthly Cost Projection

| Quizzes/Month | Total Cost |
|---------------|------------|
| 100 | R$82 |
| 500 | R$410 |
| 1000 | R$820 |
| 5000 | R$4,100 |

### Expected Latency

| Endpoint | Latency |
|----------|---------|
| POST /start | 50-100ms |
| POST /answer (context) | 50-100ms |
| POST /answer (expertise) | **2-4 seconds** (LLM) |
| POST /answer (deep-dive) | 50-100ms |
| POST /answer (risk-scan) | **1-2 seconds** (LLM) |
| POST /complete | **3-5 seconds** (LLM) |

**Total LLM Time:** 10-11 seconds across entire quiz

---

## 🎯 RISK ASSESSMENT

### Risk 1: LLM Returns Low-Quality Expertise Detection
**Probability:** MEDIUM (30%)
**Impact:** HIGH
**Mitigation:**
- Prompt engineering with few-shot examples
- Confidence threshold (>60%)
- Rule-based fallback
- User override option

### Risk 2: LLM Timeout During Peak Usage
**Probability:** LOW (15%)
**Impact:** MEDIUM
**Mitigation:**
- Automatic retry with exponential backoff
- 15s timeout per LLM call
- Fallback to rule-based analysis
- Request queue for LLM calls

### Risk 3: Session Storage Memory Leak
**Probability:** MEDIUM (25%)
**Impact:** HIGH
**Mitigation:**
- Automatic cleanup every 30 min
- Max 10,000 active sessions cap
- Memory monitoring alerts
- Redis migration for production

### Risk 4: Users Don't Complete Quiz (High Drop-off)
**Probability:** MEDIUM (30%)
**Impact:** HIGH
**Mitigation:**
- Progress bar showing completion
- Save & resume functionality
- Time estimate display
- A/B test shorter version (14 questions)

---

## 📚 INTEGRATION WITH EXISTING SYSTEM

### Reuse Existing Patterns

**DO REUSE:**
1. **API Structure from /api/consult:**
   - Error handling patterns
   - Anthropic client initialization
   - Rate limit handling (429 errors)

2. **LLM Patterns from consultant-orchestrator.ts:**
   - JSON parsing logic
   - Retry mechanisms
   - Cost tracking

3. **Type Patterns from types.ts:**
   - Confidence levels
   - Conversation context structure

### Session Management Upgrade

**Current:** In-memory Map (development)
**Production:** Redis for sessions + PostgreSQL for diagnostics

```typescript
export function getSessionStorage(): SessionStorage {
  if (process.env.NODE_ENV === 'development') {
    return new MapStorage(); // Current
  }

  if (process.env.REDIS_URL) {
    return new RedisStorage(); // Production
  }

  return new PostgresStorage(); // Fallback
}
```

---

## ✅ NEXT STEPS

### Immediate Actions
1. ✅ Review this ULTRATHINK analysis
2. ⏭️ Start Phase 1: Core Infrastructure
3. ⏭️ Create API route structure
4. ⏭️ Implement LLM integration wrapper
5. ⏭️ Build expertise detection

### Environment Variables Needed
```bash
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://...           # Optional for dev
DATABASE_URL=postgresql://...   # Optional for dev
QUIZ_SESSION_SECRET=long-random-string
```

### Testing Strategy
- Unit tests for each module
- Integration tests for API routes
- E2E tests with Playwright
- Manual testing of LLM prompts

---

## 📊 SUCCESS METRICS

### Technical Metrics
- API latency < 100ms (non-LLM endpoints)
- LLM success rate > 95%
- Fallback usage < 5%
- Session cleanup working (no memory leaks)

### Product Metrics
- Quiz completion rate > 70%
- Average completion time: 8-12 minutes
- Diagnostic quality rating > 4.0/5.0
- User satisfaction > 80%

### Cost Metrics
- Cost per quiz < R$1.00
- LLM cost tracking implemented
- Monthly budget alerts set up

---

**Analysis Complete**
**Status:** ✅ Ready for Implementation
**Estimated Timeline:** 10-12 business days
**Total Cost per Quiz:** R$0.80

**Desenvolvido por:** Claude Code
**Data:** 18/11/2025
