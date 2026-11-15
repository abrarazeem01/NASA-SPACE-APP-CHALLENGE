import React from 'react';
import {
  X,
  BookOpen,
  Binary,
  Compass,
  Satellite,
  Globe2,
  Sparkles,
} from 'lucide-react';

interface ScienceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScienceGuideModal: React.FC<ScienceGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060C]/85 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-[#070D1A] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#03060C]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0A1120] border border-[#00F0FF]/40 text-[#00F0FF]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-space font-bold text-white text-lg">
                NASA Earth System Trend Detective Guide
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Scientific Foundations, Mathematical Rigor, and Mission Context
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0A1120] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          {/* Section 1: The NASA Challenge */}
          <section className="space-y-3 p-4 rounded-xl bg-[#03060C]/70 border border-white/10">
            <h4 className="font-space font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00F0FF]" />
              1. The Challenge: "Be An Earth System Trend Detective!"
            </h4>
            <p>
              Earth's climate system is not isolated; changes in one region trigger coupled responses thousands of miles away through giant planetary atmospheric waves (Rossby waves) and ocean overturning circulations. These interconnected phenomena are known as <strong>teleconnections</strong> or <strong>climate dipoles / seesaws</strong>.
            </p>
            <p>
              NASA's challenge invites citizen scientists and researchers to explore 20 years of satellite and reanalysis records (2005–2024), uncovering paired geographical nodes where Earth system variables trend in <em>opposite directions</em> and testing whether those counter-trends are statistically significant.
            </p>
          </section>

          {/* Section 2: Mathematical Engine */}
          <section className="space-y-3 p-4 rounded-xl bg-[#03060C]/70 border border-white/10">
            <h4 className="font-space font-bold text-white text-base flex items-center gap-2">
              <Binary className="w-4 h-4 text-[#10B981]" />
              2. Mathematical & Statistical Engine
            </h4>
            <p>
              Our statistical engine runs client-side with zero external dependencies to calculate rigorous metrics for both series:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#070D1A] border border-white/10 space-y-1">
                <span className="font-bold text-[#00F0FF]">Ordinary Least Squares (OLS) Linear Regression:</span>
                <p className="text-slate-400 text-[11px] font-sans">
                  Computes best-fit slopes across 2005–2024. Multiplied by 10 to obtain the standard scientific <em>rate per decade</em>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#070D1A] border border-white/10 space-y-1">
                <span className="font-bold text-[#10B981]">Student's t-Distribution & Two-Tailed p-value:</span>
                <p className="text-slate-400 text-[11px] font-sans">
                  Computes the slope standard error and t-statistic (t = slope / SE). An exact regularized incomplete beta function evaluates p-value at df = 18. A trend is confirmed significant if p &lt; 0.05.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#070D1A] border border-white/10 space-y-1">
                <span className="font-bold text-[#FF5E3A]">Pearson Correlation (r):</span>
                <p className="text-slate-400 text-[11px] font-sans">
                  Measures interannual co-variance. An r &lt; -0.4 establishes that when one node experiences anomalous highs, the opposing node experiences anomalous lows.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#070D1A] border border-white/10 space-y-1">
                <span className="font-bold text-purple-400">Detective Classification Algorithm:</span>
                <p className="text-slate-400 text-[11px] font-sans">
                  <strong>CONFIRMED INVERSE SEESAW:</strong> Opposite slopes + (p &lt; 0.05 on either node or correlation) + negative r.
                  <br />
                  <strong>DIVERGENT TREND:</strong> Opposite slopes with interannual noise (p ≥ 0.05).
                  <br />
                  <strong>SYNCHRONIZED TREND:</strong> Same slope direction.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Open NASA Endpoints */}
          <section className="space-y-3 p-4 rounded-xl bg-[#03060C]/70 border border-white/10">
            <h4 className="font-space font-bold text-white text-base flex items-center gap-2">
              <Satellite className="w-4 h-4 text-[#00F0FF]" />
              3. Open, Zero-Authentication NASA Data Sources
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#070D1A] border border-white/10">
                <div className="font-bold font-space text-white text-sm mb-1">
                  NASA POWER API (Prediction of Worldwide Energy Resources):
                </div>
                <p className="text-slate-400 mb-2 font-sans">
                  NASA Langley Research Center's global climatology based on modern satellite assimilation and MERRA-2 (Modern-Era Retrospective analysis for Research and Applications, Version 2).
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                  <li><strong className="text-white">T2M:</strong> Temperature at 2 Meters (°C)</li>
                  <li><strong className="text-white">PRECTOTCORR:</strong> Precipitation Corrected (mm/day)</li>
                  <li><strong className="text-white">GWETTOP:</strong> Surface Soil Wetness (0 to 1 fraction)</li>
                  <li><strong className="text-white">ALLSKY_SFC_SW_DWN:</strong> All-Sky Surface Shortwave Solar Irradiance (kW·h/m²/day)</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-[#070D1A] border border-white/10">
                <div className="font-bold font-space text-white text-sm mb-1">
                  NASA GIBS (Global Imagery Browse Services) WMTS:
                </div>
                <p className="text-slate-400 font-sans">
                  Provides full-resolution satellite imagery tiles directly from the MODIS sensor aboard NASA's Terra spacecraft. Users can scrub through 20 years of annual mid-year snapshots (2005–2024) to visually verify land-use change, wildfire aerosol smoke plumes, and snow/ice dynamics.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#03060C]/90 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Developed for NASA International Space Apps Challenge</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0A1120] hover:bg-[#111D36] text-white font-space font-semibold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
