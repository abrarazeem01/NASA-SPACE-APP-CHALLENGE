import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Database,
  Binary,
  Satellite,
  ExternalLink,
} from 'lucide-react';

export const DataProvenance: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="mc-panel rounded-2xl border border-space-700/80 overflow-hidden shadow-xl font-sans">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-space-900/80 hover:bg-space-850 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-space-950 border border-locA/30 text-locA">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <span>Data Provenance, Satellite Sensors & Statistical Methodology</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sig/10 text-sig border border-sig/30">
                NASA Space Apps Official Citations
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Open NASA POWER API v2.x, GIBS WMTS MODIS Terra Level 9, OLS Regression, and Student's t-Distribution (p &lt; 0.05)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-mono hidden sm:inline">
            {isOpen ? 'Collapse Technical Brief' : 'Expand Technical Brief'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Technical Details */}
      {isOpen && (
        <div className="p-6 border-t border-space-800 bg-space-950/90 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Grid of Citations & Sensors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NASA POWER Citation */}
            <div className="p-4 rounded-xl bg-space-900/70 border border-space-750 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono font-bold text-white text-xs">
                  <Database className="w-3.5 h-3.5 text-locA" />
                  <span>NASA POWER API (v2.x Point Climatology)</span>
                </div>
                <a
                  href="https://power.larc.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-locA hover:underline flex items-center gap-1 text-[11px] font-mono"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-400 text-[11px]">
                The Prediction Of Worldwide Energy Resources (POWER) project operates out of NASA Langley Research Center. Numerical time series are synthesized from satellite solar assimilation and <strong>MERRA-2</strong> (Modern-Era Retrospective analysis for Research and Applications, Version 2) at 0.5° × 0.625° global horizontal resolution.
              </p>
              <div className="pt-1 font-mono text-[10px] text-slate-300 space-y-1">
                <div>• <strong>T2M:</strong> 2m air temperature from Goddard Earth Observing System (GEOS) atmospheric model.</div>
                <div>• <strong>PRECTOTCORR:</strong> GPCP & MERRA-2 bias-corrected precipitation flux (mm/day).</div>
                <div>• <strong>GWETTOP:</strong> NASA Land Information System (LIS) top 5cm soil wetness fraction (0–1).</div>
                <div>• <strong>ALLSKY_SFC_SW_DWN:</strong> FLASHFlux and CERES satellite downward solar irradiance.</div>
              </div>
            </div>

            {/* NASA GIBS Citation */}
            <div className="p-4 rounded-xl bg-space-900/70 border border-space-750 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono font-bold text-white text-xs">
                  <Satellite className="w-3.5 h-3.5 text-locB" />
                  <span>NASA GIBS (Global Imagery Browse Services)</span>
                </div>
                <a
                  href="https://earthdata.nasa.gov/gibs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-locB hover:underline flex items-center gap-1 text-[11px] font-mono"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-400 text-[11px]">
                GIBS provides open access to full-resolution satellite imagery across the NASA Earth Observing System (EOSDIS).
              </p>
              <div className="pt-1 font-mono text-[10px] text-slate-300 space-y-1">
                <div>• <strong>MODIS Terra True Color:</strong> Corrected reflectance bands 1, 4, 3 (250m resolution) captured daily from NASA's polar-orbiting Terra spacecraft.</div>
                <div>• <strong>MODIS Aerosol Optical Depth (AOD):</strong> Aerosol particulate thickness measuring smoke plumes and airborne dust.</div>
                <div>• <strong>Tile Specification:</strong> EPSG:3857 Level 9 Google Maps Compatible WMTS tiles with mid-year June 15 benchmarks.</div>
              </div>
            </div>
          </div>

          {/* Mathematical & Statistical Engine Details */}
          <div className="p-4 rounded-xl bg-space-900/70 border border-space-750 space-y-3">
            <div className="flex items-center gap-2 font-mono font-bold text-white text-xs">
              <Binary className="w-4 h-4 text-sig" />
              <span>Statistical Engine: OLS Linear Regression & Student's t-Distribution</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
                <div className="text-locA font-bold">1. OLS Linear Slope</div>
                <div className="text-slate-300 text-[11px] bg-space-900 p-1.5 rounded border border-space-800">
                  β₁ = Σ(Δx · Δy) / Σ(Δx²)
                </div>
                <div className="text-slate-400 text-[10px]">
                  Annual slope converted to decadal rate of change: Δ = 10 × β₁.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
                <div className="text-sig font-bold">2. Student's t-Test & p-value</div>
                <div className="text-slate-300 text-[11px] bg-space-900 p-1.5 rounded border border-space-800">
                  t = β₁ / SE(slope), df = 18
                </div>
                <div className="text-slate-400 text-[10px]">
                  Two-tailed p-value calculated via Regularized Incomplete Beta function I_x(df/2, 1/2) with Lanczos log-gamma expansion against α = 0.05.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
                <div className="text-locB font-bold">3. Pearson Correlation (r)</div>
                <div className="text-slate-300 text-[11px] bg-space-900 p-1.5 rounded border border-space-800">
                  r = Σ(ΔA · ΔB) / √(ΣΔA² · ΣΔB²)
                </div>
                <div className="text-slate-400 text-[10px]">
                  Quantifies interannual teleconnection coupling. Values r &lt; -0.4 indicate coupled inverse seesaw oscillations.
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-space-950/80 border border-space-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span><strong>Parsing Pipeline:</strong> 2005–2024 (240 monthly keys). Month 13 discarded, sentinel -999 filtered, and annual arithmetic means calculated client-side in real time.</span>
              <span className="font-mono text-sig font-bold shrink-0">Zero Mock Data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
