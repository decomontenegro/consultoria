"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CompanyInfo,
  CurrentState,
  Goals,
  ContactInfo,
  AssessmentData,
  UserPersona,
  NonTechCurrentState,
  NonTechGoals,
  AssessmentMode,
  AIRouterResult
} from "@/lib/types";
import { generateReport, saveReport, getReport } from "@/lib/services/report-service";
import {
  isTechnicalPersona,
  mapNonTechCurrentState,
  mapNonTechGoals
} from "@/lib/utils/persona-mapping";

// Import step components
import StepExpertiseDetection from "@/components/assessment/StepExpertiseDetection";
import StepAIRouter from "@/components/assessment/StepAIRouter";
import StepAIExpress from "@/components/assessment/StepAIExpress";
import StepAdaptiveAssessment from "@/components/assessment/StepAdaptiveAssessment";
import Step0PersonaSelection from "@/components/assessment/Step0PersonaSelection";
import Step1CompanyInfo from "@/components/assessment/Step1CompanyInfo";
import Step2CurrentState from "@/components/assessment/Step2CurrentState";
import Step2CurrentStateNonTech from "@/components/assessment/Step2CurrentStateNonTech";
import Step3Goals from "@/components/assessment/Step3Goals";
import Step3GoalsNonTech from "@/components/assessment/Step3GoalsNonTech";
import Step4Review from "@/components/assessment/Step4Review";
import Step5AIConsultMulti from "@/components/assessment/Step5AIConsultMulti";

function AssessmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // AI-First states
  const [useAIFirst, setUseAIFirst] = useState(true); // Start with AI router
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode | null>(null);
  const [aiRouterResult, setAIRouterResult] = useState<AIRouterResult | null>(null);

  const [currentStep, setCurrentStep] = useState(-2); // Start at -2 for Expertise Detection
  const [userExpertise, setUserExpertise] = useState<string[]>([]); // NEW: User's areas of knowledge
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [companyInfo, setCompanyInfo] = useState<Partial<CompanyInfo>>({});
  const [currentState, setCurrentState] = useState<Partial<CurrentState>>({});
  const [goals, setGoals] = useState<Partial<Goals>>({});
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo>>({});
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  // Non-technical data states
  const [nonTechCurrentState, setNonTechCurrentState] = useState<Partial<NonTechCurrentState>>({});
  const [nonTechGoals, setNonTechGoals] = useState<Partial<NonTechGoals>>({});

  const totalSteps = 8; // Expertise + AI Router + Persona + Company + State + Goals + Review + AI Consult
  const isTechPersona = persona ? isTechnicalPersona(persona) : true;

  // Load data from previous report if in duplicate mode
  // Or start directly in adaptive mode if requested
  useEffect(() => {
    const mode = searchParams.get('mode');
    const fromReportId = searchParams.get('from');

    console.log('🔧 [Page] URL params effect running:', { mode, fromReportId });

    if (mode === 'duplicate' && fromReportId) {
      const sourceReport = getReport(fromReportId);
      if (sourceReport) {
        setIsDuplicateMode(true);
        const data = sourceReport.assessmentData;

        // Pre-fill all fields
        setPersona(data.persona);
        setCompanyInfo(data.companyInfo);
        setCurrentState(data.currentState);
        setGoals(data.goals);
        // Don't pre-fill contact info for privacy

        if (data.nonTechData) {
          if (data.nonTechData.currentState) {
            setNonTechCurrentState(data.nonTechData.currentState);
          }
          if (data.nonTechData.goals) {
            setNonTechGoals(data.nonTechData.goals);
          }
        }
      }
    } else if (mode === 'adaptive') {
      // Go directly to Adaptive Assessment (conversational interview)
      console.log('🚀 [Page] Activating Adaptive Assessment mode');
      console.log('🚀 [Page] Setting assessmentMode to: adaptive');
      console.log('🚀 [Page] Setting currentStep to: 101');
      console.log('🚀 [Page] Setting useAIFirst to: false');

      setAssessmentMode('adaptive');
      setCurrentStep(101); // Step 101 = Adaptive Assessment
      setUseAIFirst(false); // Skip AI Router

      console.log('✅ [Page] Adaptive mode activated');
    }
  }, [searchParams]);

  const nextStep = () => {
    // ✅ UNIFIED FLOW: Step -2 (Expertise) → Step 101 (Adaptive)
    if (currentStep === -2) {
      setCurrentStep(101); // Go directly to Adaptive Assessment
    } else if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    if (currentStep > -2) { // Can go back to Step -2 (Expertise Detection)
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // AI Router handlers
  const handleAIRouterComplete = (result: AIRouterResult) => {
    setAIRouterResult(result);

    // Pre-fill any data collected during routing
    if (result.partialData.companyInfo) {
      setCompanyInfo(prev => ({ ...prev, ...result.partialData.companyInfo }));
    }
  };

  const handleModeSelection = (
    mode: AssessmentMode,
    detectedPersona: UserPersona | null,
    partialData: any
  ) => {
    setAssessmentMode(mode);

    // Set persona if detected
    if (detectedPersona) {
      setPersona(detectedPersona);
    }

    // Pre-fill any partial data
    if (partialData.companyInfo) {
      setCompanyInfo(prev => ({ ...prev, ...partialData.companyInfo }));
    }

    // Route based on selected mode
    if (mode === 'express') {
      // Go to Express Mode (step 100 as special marker)
      setCurrentStep(100);
    } else if (mode === 'adaptive') {
      // Go to Adaptive Assessment (step 101 as special marker)
      // Conversational interview with LLM-generated questions
      setCurrentStep(101);
    } else if (mode === 'deep') {
      // Go directly to multi-specialist (step 5 in traditional flow)
      // But first need to complete basic info
      if (detectedPersona) {
        setCurrentStep(1); // Skip persona, start with company info
      } else {
        setCurrentStep(0); // Need persona first
      }
    } else {
      // Guided mode - traditional flow
      if (detectedPersona) {
        setCurrentStep(1); // Skip persona selection
      } else {
        setCurrentStep(0); // Go to persona selection
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    // For non-technical personas, translate responses to technical structure
    let finalCurrentState = currentState as CurrentState;
    let finalGoals = goals as Goals;

    if (persona && !isTechPersona) {
      finalCurrentState = mapNonTechCurrentState(
        nonTechCurrentState as NonTechCurrentState,
        companyInfo.size as 'startup' | 'scaleup' | 'enterprise'
      );
      finalGoals = mapNonTechGoals(nonTechGoals as NonTechGoals);
    }

    // Compile complete assessment data
    const assessmentData: AssessmentData = {
      persona: persona as UserPersona,
      companyInfo: companyInfo as CompanyInfo,
      aiScope: {
        engineering: true,
        customerService: false,
        sales: false,
        marketing: false,
        operations: false,
        meetingIntelligence: false,
      },
      currentState: finalCurrentState,
      goals: finalGoals,
      contactInfo: contactInfo as ContactInfo,
      submittedAt: new Date(),
      // Store original non-tech responses for reference
      nonTechData: !isTechPersona ? {
        currentState: nonTechCurrentState as NonTechCurrentState,
        goals: nonTechGoals as NonTechGoals,
      } : undefined,
    };

    // Generate complete report (with AI insights if available)
    const report = generateReport(assessmentData, aiInsights.length > 0 ? aiInsights : undefined);

    // Save report (localStorage for now, can be API later)
    saveReport(report);

    // Navigate to report page
    router.push(`/report/${report.id}`);
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="nav-dark sticky top-0 z-50">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-gradient-neon">CulturaBuilder</span>
            </Link>
            <div className="text-sm text-tech-gray-400">
              AI Assessment Profissional
            </div>
          </div>
        </div>
      </header>

      {/* Duplicate Mode Banner */}
      {isDuplicateMode && (
        <div className="bg-neon-cyan/10 border-b border-neon-cyan/30 backdrop-blur-sm">
          <div className="container-professional py-3">
            <p className="text-sm text-neon-cyan text-center">
              ✨ <strong>Modo Variação:</strong> Você está criando uma variação do assessment "{companyInfo.name}". Modifique os campos desejados e gere um novo relatório para comparar cenários.
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar (hide during AI Router) */}
      {currentStep >= 0 && (
        <div className="bg-background-card/30 backdrop-blur-sm border-b border-tech-gray-800">
          <div className="container-professional py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-tech-gray-100 font-display">
                AI Readiness Assessment
                {assessmentMode && (
                  <span className="ml-3 text-sm font-normal text-neon-cyan">
                    • {assessmentMode === 'express' ? 'Express Mode' : 'Deep Dive'}
                  </span>
                )}
              </h2>
              <span className="text-sm text-tech-gray-400">
                Etapa {currentStep + 1} de {totalSteps - 1}
              </span>
            </div>

            {/* Progress bar */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentStep + 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>

            {/* Step labels */}
            <div className="grid grid-cols-6 gap-2 mt-4">
              {[
                "Sobre Você",
                "Company Info",
                "Estado Atual",
                "Objetivos",
                "Review",
                "Consulta AI",
              ].map((label, index) => (
                <div
                  key={index}
                  className={`text-center text-xs lg:text-sm transition-colors ${
                    currentStep === index
                      ? "text-neon-green font-semibold"
                      : currentStep > index
                      ? "text-tech-gray-400"
                      : "text-tech-gray-600"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-professional py-12">
        <div className="max-w-3xl mx-auto">
          {/* Step -2: Expertise Detection (FIRST QUESTION) */}
          {currentStep === -2 && (
            <div className="animate-slide-up">
              <StepExpertiseDetection
                selected={userExpertise}
                onUpdate={setUserExpertise}
                onNext={nextStep}
              />
            </div>
          )}

          {/* ✅ REMOVED: AI Router, Guided Forms, Express Mode */}
          {/* Unified flow: Step -2 → Step 101 only */}

          {/* Step 101: Adaptive Assessment (Conversational Interview with LLM) */}
          {currentStep === 101 && (
            <div className="animate-slide-up">
              {console.log('🔧 [Page] Rendering StepAdaptiveAssessment at step 101')}
              <StepAdaptiveAssessment
                partialData={{
                  userExpertise: userExpertise, // ✅ Pass expertise from Step -2
                  persona: persona || undefined,
                  companyInfo: companyInfo,
                  currentState: currentState,
                  goals: goals
                }}
                onPersonaDetected={(detectedPersona) => {
                  console.log('🔧 [Page] Persona detected:', detectedPersona);
                  if (detectedPersona && !persona) {
                    setPersona(detectedPersona);
                  }
                }}
              />
            </div>
          )}

          {/* Step 5: Multi-Specialist AI Consultation (Optional) */}
          {currentStep === 5 && (
            <div className="animate-slide-up">
              <Step5AIConsultMulti
                data={{
                  persona: persona as UserPersona,
                  userExpertise: userExpertise, // ✅ Pass expertise for automatic specialist routing
                  companyInfo: companyInfo as CompanyInfo,
                  currentState: isTechPersona ? currentState as CurrentState : mapNonTechCurrentState(
                    nonTechCurrentState as NonTechCurrentState,
                    companyInfo.size as 'startup' | 'scaleup' | 'enterprise'
                  ),
                  goals: isTechPersona ? goals as Goals : mapNonTechGoals(nonTechGoals as NonTechGoals),
                  contactInfo: contactInfo as ContactInfo,
                }}
                onSkip={handleSubmit}
                onComplete={(insights) => {
                  setAiInsights(insights);
                  handleSubmit();
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer note */}
      <footer className="container-professional py-8 text-center text-sm text-tech-gray-500 border-t border-tech-gray-800">
        <p>
          Todos os dados processados com segurança. Nunca compartilhamos suas informações sem consentimento.
        </p>
      </footer>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-dark flex items-center justify-center"><p className="text-white">Carregando...</p></div>}>
      <AssessmentPageContent />
    </Suspense>
  );
}
