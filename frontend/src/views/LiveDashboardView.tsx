import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio,
  ChevronRight,
} from 'lucide-react';
import { DemoScenario, DetectionScores, SecurityEventLog } from '../types';
import { CLONED_CXO_SCENARIO, GENUINE_CXO_SCENARIO } from '../data/mockData';

export const LiveDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScenarioId, setSelectedScenarioId] = useState<'cloned-cxo' | 'genuine-cxo' | 'custom'>('cloned-cxo');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [eventLogs, setEventLogs] = useState<SecurityEventLog[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showForensicModal, setShowForensicModal] = useState<boolean>(false);
  
  // Custom slider values for manual judge testing
  const [customRiskSlider, setCustomRiskSlider] = useState<number>(85);
  const [customSpectralSlider, setCustomSpectralSlider] = useState<number>(88);
  const [customProsodySlider, setCustomProsodySlider] = useState<number>(24);
  const [customPitchSlider, setCustomPitchSlider] = useState<number>(82);

  const scenario: DemoScenario = selectedScenarioId === 'genuine-cxo' 
    ? GENUINE_CXO_SCENARIO 
    : CLONED_CXO_SCENARIO;

  const currentStep = scenario.steps[Math.min(currentStepIndex, scenario.steps.length - 1)];

  // Derived current scores based on mode
  const currentScores: DetectionScores = selectedScenarioId === 'custom' 
    ? {
        overallRisk: customRiskSlider,
        spectralArtifacts: customSpectralSlider,
        prosodyNaturalness: customProsodySlider,
        pitchMicroVariation: customPitchSlider,
        crossSessionMatch: Math.max(0, 100 - customRiskSlider),
        glottalPulseDiscontinuity: customSpectralSlider,
        temporalJitter: customPitchSlider,
        phaseIncoherence: customSpectralSlider,
        speakerMismatchScore: customRiskSlider,
        inferenceLatencyMs: 36,
        detectionStatus: customRiskSlider >= 70 
          ? 'High Risk — Cloned Voice Detected' 
          : customRiskSlider >= 40 
          ? 'Elevated Risk — Anomaly Detected' 
          : 'Low Risk — Natural Speech',
      }
    : currentStep.scores;

  // Auto-play simulation interval
  useEffect(() => {
    let timer: any;
    if (isPlaying && selectedScenarioId !== 'custom') {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);

        setCurrentStepIndex((prevIdx) => {
          const nextIdx = prevIdx + 1;
          if (nextIdx < scenario.steps.length) {
            const nextStep = scenario.steps[nextIdx];
            if (nextStep.event) {
              setEventLogs((logs) => {
                if (!logs.some(l => l.id === nextStep.event?.id)) {
                  return [nextStep.event!, ...logs];
                }
                return logs;
              });
            }
            return nextIdx;
          } else {
            // Reached end of scenario, pause simulation
            setIsPlaying(false);
            return prevIdx;
          }
        });
      }, 2200);
    }

    return () => clearInterval(timer);
  }, [isPlaying, selectedScenarioId, scenario]);

  // Reset or Switch Scenario
  const handleSelectScenario = (id: 'cloned-cxo' | 'genuine-cxo' | 'custom') => {
    setSelectedScenarioId(id);
    setCurrentStepIndex(0);
    setCallDurationSeconds(0);
    setIsPlaying(true);
    setActionNotice(null);

    const initialScenario = id === 'genuine-cxo' ? GENUINE_CXO_SCENARIO : CLONED_CXO_SCENARIO;
    if (initialScenario.steps[0].event) {
      setEventLogs([initialScenario.steps[0].event]);
    } else {
      setEventLogs([]);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCallDurationSeconds(0);
    setIsPlaying(true);
    setActionNotice(null);
    setEventLogs(scenario.steps[0].event ? [scenario.steps[0].event] : []);
  };

  // Trigger SOC automated action
  const handleTriggerAction = (actionName: string) => {
    const newLog: SecurityEventLog = {
      id: `EVT-ACTION-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      relativeTimeSec: callDurationSeconds,
      level: 'critical',
      category: 'Action',
      message: `Enforcement Executed: ${actionName}`,
      metricDetail: `Operator triggered immediate protocol under SIH26104 policy rule #1`,
    };
    setEventLogs((prev) => [newLog, ...prev]);
    setActionNotice(`✓ Action confirmed: "${actionName}" applied to active session.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Format call duration MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const isAlertThresholdPassed = currentScores.overallRisk >= 70;

  const statCards = [
    { label: 'Total Analyses', value: '24', detail: '12 today', tone: 'cyan' },
    { label: 'AI Voices Detected', value: '14', detail: '58% of analyses', tone: 'rose' },
    { label: 'Human Voices', value: '10', detail: '42% of analyses', tone: 'emerald' },
    { label: 'High-Risk Alerts', value: '12', detail: '3 require review', tone: 'amber' },
  ] as const;

  const actionCards = [
    {
      title: 'Run Voice Inspection',
      description: 'Analyze a live call or upload an audio recording.',
      cta: 'Start analysis',
      tone: 'primary' as const,
      route: '/app/voice-analysis',
    },
    {
      title: 'Controlled Attack Simulator',
      description: 'Test edge cases and spoofing scenarios.',
      cta: 'Open simulator',
      tone: 'secondary' as const,
      route: '/app/attack-simulator',
    },
    {
      title: 'SIH Interactive Demo Tour',
      description: 'Review the live verification flow.',
      cta: 'View walkthrough',
      tone: 'secondary' as const,
      route: '/app/how-it-works',
    },
  ];

  const recentAnalyses = [
    { id: 'VA-2041', title: 'Inbound call review', source: 'Airtel SIP trunk', outcome: 'Likely AI-generated voice', time: '08:42', risk: 'High risk' },
    { id: 'VA-2038', title: 'Customer callback check', source: 'Jio VoLTE', outcome: 'Voice characteristics match a human speaker', time: '07:10', risk: 'Low risk' },
    { id: 'VA-2034', title: 'Vendor onboarding call', source: 'WhatsApp voice note', outcome: 'Needs review', time: '05:26', risk: 'Elevated risk' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="card-elevated flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#0A0E17] text-[#E2E8F0] border border-[rgba(148,163,184,0.18)]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="heading-subsection">
                Voice Security Dashboard
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wide text-[#22C55E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                Active
              </span>
            </div>
            <p className="text-body-small mt-1 text-slate-300">
              Monitor live voice risk and respond to suspicious calls.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectScenario('cloned-cxo')}
            className="px-3 py-1.5 rounded-lg border border-[rgba(148,163,184,0.18)] bg-[#0A0E17] text-xs font-medium text-slate-200 hover:border-slate-500 transition-colors"
          >
            New Voice Analysis
          </button>
          <button
            type="button"
            onClick={() => handleRestart()}
            className="px-3 py-1.5 rounded-lg border border-[rgba(148,163,184,0.18)] bg-transparent text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card-raised p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium text-slate-400">{card.label}</div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-white">{card.value}</span>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium ${
                card.tone === 'cyan' ? 'border-[#22D3EE]/20 bg-[#22D3EE]/10 text-[#22D3EE]' :
                card.tone === 'rose' ? 'border-[#F87171]/20 bg-[#F87171]/10 text-[#F87171]' :
                card.tone === 'emerald' ? 'border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]' :
                'border-[#FBBF24]/20 bg-[#FBBF24]/10 text-[#FBBF24]'
              }`}>
                {card.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {actionCards.map((card) => (
          <button
            type="button"
            key={card.title}
            onClick={() => {
              window.scrollTo({ top: 0 });
              navigate(card.route);
            }}
            className={`w-full rounded-xl border p-4 text-left transition-colors hover:shadow-md ${
              card.tone === 'primary'
                ? 'border-[#22D3EE]/30 bg-[#091D33] text-white hover:bg-[#0A2A42]'
                : 'border-[rgba(148,163,184,0.16)] bg-[#0A0E17] text-slate-200 hover:border-[rgba(148,163,184,0.28)]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-white">{card.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.description}</p>
              </div>
              {card.tone === 'primary' && (
                <span className="rounded-lg border border-[#22D3EE]/30 bg-[#22D3EE]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#22D3EE]">
                  {card.cta}
                </span>
              )}
            </div>
            {card.tone !== 'primary' && (
              <div className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-400">{card.cta}</div>
            )}
          </button>
        ))}
      </div>

      <div className="card-elevated p-5">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[rgba(148,163,184,0.12)]">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Voice Analyses</h2>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Updated 14 min ago</span>
        </div>

        <div className="mt-4 space-y-2">
          {recentAnalyses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[rgba(148,163,184,0.22)] bg-[#070E1A] p-8 text-center">
              <div className="text-lg font-semibold text-white">No voice analyses yet</div>
              <p className="mt-2 text-sm text-slate-400">Start your first analysis to see detection results here.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedScenarioId('cloned-cxo');
                  setCurrentStepIndex(0);
                  setCallDurationSeconds(0);
                  setIsPlaying(true);
                }}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#0A0E17] px-3 py-2 text-xs font-semibold text-white border border-[rgba(148,163,184,0.18)]"
              >
                Start Voice Analysis
              </button>
            </div>
          ) : (
            recentAnalyses.map((analysis) => (
              <button
                type="button"
                key={analysis.id}
                onClick={() => {
                  setSelectedScenarioId('cloned-cxo');
                  setCurrentStepIndex(0);
                  setCallDurationSeconds(0);
                  setIsPlaying(true);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#0A0E17] px-3 py-3 text-left transition-colors hover:border-[rgba(148,163,184,0.28)]"
              >
                <div>
                  <div className="text-sm font-medium text-white">{analysis.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>{analysis.id}</span>
                    <span>•</span>
                    <span>{analysis.source}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-right text-[11px] text-slate-300">{analysis.outcome}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">{analysis.time}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
