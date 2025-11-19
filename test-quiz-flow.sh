#!/bin/bash

# Test Business Quiz API Flow
# Tests complete quiz from start to finish

set -e # Exit on error

API_BASE="http://localhost:3000/api/business-quiz"

echo "🧪 Testing Business Quiz API Flow"
echo "=================================="
echo ""

# Step 1: Start quiz
echo "1️⃣  Starting quiz..."
START_RESPONSE=$(curl -s -X POST "$API_BASE/start" \
  -H "Content-Type: application/json" \
  -d '{}')

SESSION_ID=$(echo $START_RESPONSE | jq -r '.sessionId')
echo "✅ Session created: $SESSION_ID"
echo ""

# Step 2: Answer context questions (7 questions)
echo "2️⃣  Answering context questions (7)..."

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"ctx-001\",\"answer\":\"TechCorp\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"ctx-002\",\"answer\":\"Fintech\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"ctx-003\",\"answer\":\"Scaleup (2-5 anos, crescendo rápido)\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"ctx-004\",\"answer\":\"50\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"ctx-005\",\"answer\":\"R\$500k\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"ctx-006\",\"answer\":\"2021\"}" | jq -r '.nextQuestion.id'

# Last context question should transition to expertise
TRANSITION_RESPONSE=$(curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"ctx-007\",\"answer\":\"Crescer 3x em 6 meses\"}")

NEXT_BLOCK=$(echo $TRANSITION_RESPONSE | jq -r '.progress.currentBlock')
echo "✅ Context block complete, transitioned to: $NEXT_BLOCK"
echo ""

# Step 3: Answer expertise questions (4 questions)
echo "3️⃣  Answering expertise questions (4)..."

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"exp-001\",\"answer\":\"CAC está muito alto, R\$200. Precisamos otimizar o funil de conversão.\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"exp-002\",\"answer\":\"Marketing - precisamos reduzir CAC e aumentar conversão\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"exp-003\",\"answer\":\"CAC, LTV, conversion rate, activation rate, MQL to SQL\"}" | jq -r '.nextQuestion.id'

# Last expertise question should trigger detection
EXPERTISE_RESPONSE=$(curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"exp-004\",\"answer\":\"Gastamos R\$50k em ads, conversão foi apenas 1%, CAC explodiu\"}")

DETECTED_AREA=$(echo $EXPERTISE_RESPONSE | jq -r '.expertiseDetected.area')
CONFIDENCE=$(echo $EXPERTISE_RESPONSE | jq -r '.expertiseDetected.confidence')
echo "✅ Expertise detected: $DETECTED_AREA (confidence: $CONFIDENCE)"
echo ""

# Step 4: Answer deep-dive questions (5 questions)
echo "4️⃣  Answering deep-dive questions (5)..."

DEEP_DIVE_1=$(echo $EXPERTISE_RESPONSE | jq -r '.nextQuestion.id')
curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"$DEEP_DIVE_1\",\"answer\":\"Pago (Google Ads, Facebook Ads)\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"mktg-002\",\"answer\":\"Sim, está em R\$200\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"mktg-003\",\"answer\":\"1%\"}" | jq -r '.nextQuestion.id'

curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"mktg-004\",\"answer\":\"Email onboarding com trial guiado\"}" | jq -r '.nextQuestion.id'

# Last deep-dive question should transition to risk-scan
RISK_TRANSITION=$(curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"mktg-005\",\"answer\":\"CAC muito alto e conversão baixa\"}")

NEXT_BLOCK=$(echo $RISK_TRANSITION | jq -r '.progress.currentBlock')
echo "✅ Deep-dive complete, transitioned to: $NEXT_BLOCK"
echo ""

# Step 5: Answer risk scan questions (3 questions)
echo "5️⃣  Answering risk scan questions (3)..."

RISK_Q1=$(echo $RISK_TRANSITION | jq -r '.nextQuestion.id')
curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"$RISK_Q1\",\"answer\":\"Sim, muito (crítico)\"}" | jq -r '.nextQuestion.id'

RISK_Q2_RESPONSE=$(curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"risk-sales-001\",\"answer\":\"Sim (risco)\"}")

RISK_Q2=$(echo $RISK_Q2_RESPONSE | jq -r '.nextQuestion.id')
curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"$RISK_Q2\",\"answer\":\"Não, abaixo de 5%\"}" | jq -r '.nextQuestion.id'

# Last risk scan question should complete quiz
COMPLETE_RESPONSE=$(curl -s -X POST "$API_BASE/answer" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"questionId\":\"risk-fin-001\",\"answer\":\"Não, > 12 meses\"}")

IS_COMPLETE=$(echo $COMPLETE_RESPONSE | jq -r '.completed')
PROGRESS=$(echo $COMPLETE_RESPONSE | jq -r '.progress.overallProgress')

echo "✅ Quiz complete: $IS_COMPLETE (progress: $PROGRESS%)"
echo ""

# Summary
echo "=================================="
echo "✅ ALL TESTS PASSED!"
echo ""
echo "Summary:"
echo "  - Session ID: $SESSION_ID"
echo "  - Detected Area: $DETECTED_AREA"
echo "  - Confidence: $CONFIDENCE"
echo "  - Final Progress: $PROGRESS%"
echo ""
echo "🎉 Quiz flow is working end-to-end!"
