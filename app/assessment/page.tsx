"use client";

import { useState, useEffect } from "react";
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
  NonTechGoals
} from "@/lib/types";
import { generateReport, saveReport, getReport } from "@/lib/services/report-service";
import {
  isTechnicalPersona,
  mapNonTechCurrentState,
  mapNonTechGoals
} from "@/lib/utils/persona-mapping";

// Import step components
import Step0PersonaSelection from "@/components/assessment/Step0PersonaSelection";
import Step1CompanyInfo from "@/components/assessment/Step1CompanyInfo";
import Step2CurrentState from "@/components/assessment/Step2CurrentState";
import Step2CurrentStateNonTech from "@/components/assessment/Step2CurrentStateNonTech";
import Step3Goals from "@/components/assessment/Step3Goals";
import Step3GoalsNonTech from "@/components/assessment/Step3GoalsNonTech";
import Step4Review from "@/components/assessment/Step4Review";

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for persona selection
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [companyInfo, setCompanyInfo] = useState<Partial<CompanyInfo>>({});
  const [currentState, setCurrentState] = useState<Partial<CurrentState>>({});
  const [goals, setGoals] = useState<Partial<Goals>>({});
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo>>({});
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);

  // Non-technical data states
  const [nonTechCurrentState, setNonTechCurrentState] = useState<Partial<NonTechCurrentState>>({});
  const [nonTechGoals, setNonTechGoals] = useState<Partial<NonTechGoals>>({});

  const totalSteps = 5; // Added persona selection step
  const isTechPersona = persona ? isTechnicalPersona(persona) : true;

  // Load data from previous report if in duplicate mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    const fromReportId = searchParams.get('from');

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
          setNonTechCurrentState(data.nonTechData.currentState);
          setNonTechGoals(data.nonTechData.goals);
        }
      }
    }
  }, [searchParams]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

    // Generate complete report
    const report = generateReport(assessmentData);

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

      {/* Progress Bar */}
      <div className="bg-background-card/30 backdrop-blur-sm border-b border-tech-gray-800">
        <div className="container-professional py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-tech-gray-100 font-display">
              AI Readiness Assessment
            </h2>
            <span className="text-sm text-tech-gray-400">
              Etapa {currentStep} de {totalSteps}
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step labels */}
          <div className="grid grid-cols-5 gap-4 mt-4">
            {[
              "Sobre Você",
              "Company Info",
              "Estado Atual",
              "Objetivos",
              "Review & Submit",
            ].map((label, index) => (
              <div
                key={index}
                className={`text-center text-sm transition-colors ${
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

      {/* Main Content */}
      <main className="container-professional py-12">
        <div className="max-w-3xl mx-auto">
          {/* Step 0: Persona Selection */}
          {currentStep === 0 && (
            <div className="animate-slide-up">
              <Step0PersonaSelection
                selected={persona}
                onUpdate={setPersona}
                onNext={nextStep}
              />
            </div>
          )}

          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="animate-slide-up">
              <Step1CompanyInfo
                data={companyInfo}
                onUpdate={setCompanyInfo}
                onNext={nextStep}
                onBack={prevStep}
              />
            </div>
          )}

          {/* Step 2: Current State - Branching based on persona */}
          {currentStep === 2 && (
            <div className="animate-slide-up">
              {isTechPersona ? (
                <Step2CurrentState
                  data={currentState}
                  onUpdate={setCurrentState}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              ) : (
                <Step2CurrentStateNonTech
                  data={nonTechCurrentState}
                  onUpdate={setNonTechCurrentState}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
            </div>
          )}

          {/* Step 3: Goals - Branching based on persona */}
          {currentStep === 3 && (
            <div className="animate-slide-up">
              {isTechPersona ? (
                <Step3Goals
                  data={goals}
                  onUpdate={setGoals}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              ) : (
                <Step3GoalsNonTech
                  data={nonTechGoals}
                  onUpdate={setNonTechGoals}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="animate-slide-up">
              <Step4Review
                companyInfo={companyInfo}
                currentState={isTechPersona ? currentState : mapNonTechCurrentState(
                  nonTechCurrentState as NonTechCurrentState,
                  companyInfo.size as 'startup' | 'scaleup' | 'enterprise'
                )}
                goals={isTechPersona ? goals : mapNonTechGoals(nonTechGoals as NonTechGoals)}
                contactInfo={contactInfo}
                onUpdateContact={setContactInfo}
                onBack={prevStep}
                onSubmit={handleSubmit}
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
