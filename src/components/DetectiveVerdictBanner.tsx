import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  DetectiveVerdict,
  LinearRegressionResult,
  PearsonCorrelationResult,
} from '../utils/earthStats';
import { NasaParameterConfig } from '../services/nasaApi';
import {
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Share2,
  FileDown,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface DetectiveVerdictBannerProps {
  verdict: DetectiveVerdict;
  statsA: LinearRegressionResult;
  statsB: LinearRegressionResult;
  correlation: PearsonCorrelationResult;
  param: NasaParameterConfig;
  locAName: string;
  locBName: string;
  onOpenPublishModal: () => void;
  onOpenExportModal: () => void;
}

export const DetectiveVerdictBanner: React.FC<DetectiveVerdictBannerProps> = ({
  verdict,
  statsA,
  statsB,
  correlation,
  param,
  locAName,
  locBName,
  onOpenPublishModal,
  onOpenExportModal,
}) => {
  // Fire confetti celebration when a Confirmed Inverse Seesaw is detected!
  useEffect(() => {
    if (verdict.verdict === 'CONFIRMED INVERSE SEESAW') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00D1FF', '#FF9F1C', '#10B981', '#38BDF8'],
        });
      } catch (e) {
        // Ignore in test or headless envs
      }
    }
  }, [verdict.verdict]);

  const getVerdictTheme = () => {
    switch (verdict.verdict) {
      case 'CONFIRMED INVERSE SEESAW':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/60 shadow-emerald-500/10',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-400" />,
          titleColor: 'text-emerald-300',
        };
      case 'DIVERGENT TREND':
        return {
          bg: 'bg-amber-950/40 border-amber-500/60 shadow-amber-500/10',
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: <AlertTriangle className="w-7 h-7 text-amber-400" />,
          titleColor: 'text-amber-300',
        };
      case 'SYNCHRONIZED TREND':
        return {
          bg: 'bg-blue-950/40 border-blue-500/60 shadow-blue-500/10',
          badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          icon: <MinusCircle className="w-7 h-7 text-blue-400" />,
          titleColor: 'text-blue-300',
        };
    }
  };

  const theme = getVerdictTheme();

  return (
    <div className={`p-6 rounded-2xl border ${theme.bg} shadow-2xl backdrop-blur-md space-y-6 transition-all`}>
      {/* Top Banner Verdict Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-space-950/80 border border-space-700 shadow-md">
            {theme.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border ${theme.badgeBg}`}>
                {verdict.verdict}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Confidence: <strong className="text-white">{verdict.confidenceScore}%</strong>
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.titleColor}`}>
              {verdict.headline}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={onOpenPublishModal}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Publish Discovery</span>
          </button>
          <button
            onClick={onOpenExportModal}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-space-900 hover:bg-space-800 text-slate-200 border border-space-600 font-semibold text-xs transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-nasa-cyan" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* Scientific Summary & Mechanism Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-space-950/70 border border-space-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-nasa-cyan" />
              Detective Scientific Brief (2005–2024 Findings)
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">
              {verdict.scientificSummary}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-950/70 border border-space-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Atmospheric & Planetary Dynamics Mechanism
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {verdict.atmosphericMechanism}
            </p>
          </div>

          {/* Key Bullet Takeaways */}
          <ul className="space-y-1.5 text-xs text-slate-300">
            {verdict.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-nasa-cyan font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Statistical Scorecard Box */}
        <div className="p-4 rounded-xl bg-space-950/90 border border-space-700/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-space-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Statistical Evidence Table
            </span>
            <span className="text-[10px] font-mono text-nasa-cyan">df = 18</span>
          </div>

          {/* Metrics Grid */}
          <div className="space-y-3 text-xs">
            {/* Decadal Slope A */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-space-900 border border-space-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-nasa-cyan"></span>
                <span className="text-slate-300 truncate max-w-[120px]">{locAName}</span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-nasa-cyan">
                  {statsA.slopePerDecade >= 0 ? '+' : ''}{statsA.slopePerDecade.toFixed(3)} {param.unit}/dec
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  p = {statsA.pValue.toFixed(4)} {statsA.isSignificant ? '(Sig p<0.05)' : '(Not sig)'}
                </div>
              </div>
            </div>

            {/* Decadal Slope B */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-space-900 border border-space-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-nasa-amber"></span>
                <span className="text-slate-300 truncate max-w-[120px]">{locBName}</span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-nasa-amber">
                  {statsB.slopePerDecade >= 0 ? '+' : ''}{statsB.slopePerDecade.toFixed(3)} {param.unit}/dec
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  p = {statsB.pValue.toFixed(4)} {statsB.isSignificant ? '(Sig p<0.05)' : '(Not sig)'}
                </div>
              </div>
            </div>

            {/* Pearson r Correlation */}
            <div className="p-2.5 rounded-lg bg-space-900 border border-space-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Pearson Correlation (r):</span>
                <span className={`font-mono font-extrabold ${correlation.r < -0.3 ? 'text-emerald-400' : correlation.r > 0.3 ? 'text-blue-400' : 'text-slate-300'}`}>
                  {correlation.r.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Significance (p-value):</span>
                <span className="font-mono text-slate-200">p = {correlation.pValue.toFixed(4)}</span>
              </div>
              <div className="text-[10px] text-emerald-400/90 font-medium pt-0.5">
                {correlation.strengthDescription}
              </div>
            </div>

            {/* R-squared summary */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-space-900/60 border border-space-800 text-center">
                <div className="text-slate-400">Node A R²</div>
                <div className="font-mono font-bold text-white">{(statsA.rSquared * 100).toFixed(1)}%</div>
              </div>
              <div className="p-2 rounded bg-space-900/60 border border-space-800 text-center">
                <div className="text-slate-400">Node B R²</div>
                <div className="font-mono font-bold text-white">{(statsB.rSquared * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
