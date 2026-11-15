import React, { useState, useEffect, useCallback } from 'react';
import { KineticCursorCanvas } from './components/KineticCursorCanvas';
import { NasaMap } from './components/NasaMap';
import { TrendAnalytics } from './components/TrendAnalytics';
import { DiscoveryBoard } from './components/DiscoveryBoard';
import { DataProvenance } from './components/DataProvenance';
import { ScienceGuideModal } from './components/ScienceGuideModal';
import { ExportReportModal } from './components/ExportReportModal';
import {
  NASA_PARAMETERS,
  NasaParameterConfig,
  fetchNasaPowerAnnualData,
  LocationObservationResult,
} from './services/nasaApi';
import {
  calculateLinearRegression,
  calculatePearsonCorrelation,
  generateDetectiveVerdict,
  LinearRegressionResult,
  PearsonCorrelationResult,
  DetectiveVerdict,
} from './utils/earthStats';
import {
  CLIMATE_DIPOLE_PRESETS,
  ClimateDipolePreset,
} from './data/presets';
import { CommunityDiscovery } from './lib/supabase';
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  BookOpen,
  FileDown,
  Sparkles,
  Layers,
} from 'lucide-react';

interface LocationPoint {
  lat: number;
  lon: number;
  name: string;
}

export const App: React.FC = () => {
  const defaultPreset = CLIMATE_DIPOLE_PRESETS[0];

  const [selectedParam, setSelectedParam] = useState<NasaParameterConfig>(
    NASA_PARAMETERS.find(p => p.code === defaultPreset.recommendedParameter) || NASA_PARAMETERS[1]
  );

  const [locA, setLocA] = useState<LocationPoint>({
    lat: defaultPreset.locA.lat,
    lon: defaultPreset.locA.lon,
    name: defaultPreset.locA.name,
  });

  const [locB, setLocB] = useState<LocationPoint>({
    lat: defaultPreset.locB.lat,
    lon: defaultPreset.locB.lon,
    name: defaultPreset.locB.name,
  });

  const [activePresetId, setActivePresetId] = useState<string | null>(defaultPreset.id);
  const [activeSelectionMode, setActiveSelectionMode] = useState<'A' | 'B'>('A');

  // Async Telemetry State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Computed Analysis Results
  const [dataA, setDataA] = useState<LocationObservationResult | null>(null);
  const [dataB, setDataB] = useState<LocationObservationResult | null>(null);
  const [statsA, setStatsA] = useState<LinearRegressionResult | null>(null);
  const [statsB, setStatsB] = useState<LinearRegressionResult | null>(null);
  const [correlation, setCorrelation] = useState<PearsonCorrelationResult | null>(null);
  const [verdict, setVerdict] = useState<DetectiveVerdict | null>(null);

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);

  // Teleconnection Analysis Engine
  const executeAnalysis = useCallback(
    async (
      targetLocA: LocationPoint,
      targetLocB: LocationPoint,
      targetParam: NasaParameterConfig
    ) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [resA, resB] = await Promise.all([
          fetchNasaPowerAnnualData(targetLocA.lat, targetLocA.lon, targetParam.code, 2005, 2024),
          fetchNasaPowerAnnualData(targetLocB.lat, targetLocB.lon, targetParam.code, 2005, 2024),
        ]);

        const regA = calculateLinearRegression(resA.years, resA.values);
        const regB = calculateLinearRegression(resB.years, resB.values);

        const commonYears = resA.years.filter(yr => resB.years.includes(yr));
        const mapA = new Map(resA.annualSeries.map(d => [d.year, d.value]));
        const mapB = new Map(resB.annualSeries.map(d => [d.year, d.value]));

        const pairedA = commonYears.map(yr => mapA.get(yr)!);
        const pairedB = commonYears.map(yr => mapB.get(yr)!);

        const pearson = calculatePearsonCorrelation(pairedA, pairedB);

        const decision = generateDetectiveVerdict(
          regA,
          regB,
          pearson,
          targetParam.name,
          targetParam.unit,
          targetLocA.name,
          targetLocB.name
        );

        setDataA(resA);
        setDataB(resB);
        setStatsA(regA);
        setStatsB(regB);
        setCorrelation(pearson);
        setVerdict(decision);
      } catch (err: unknown) {
        console.error('Teleconnection Analysis Error:', err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Error querying NASA POWER endpoint. Please verify coordinates and internet connection.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    executeAnalysis(locA, locB, selectedParam);
  }, []);

  // Preset Selection Handler
  const handleSelectPreset = (preset: ClimateDipolePreset) => {
    setActivePresetId(preset.id);
    const newLocA = {
      lat: preset.locA.lat,
      lon: preset.locA.lon,
      name: preset.locA.name,
    };
    const newLocB = {
      lat: preset.locB.lat,
      lon: preset.locB.lon,
      name: preset.locB.name,
    };
    const newParam =
      NASA_PARAMETERS.find(p => p.code === preset.recommendedParameter) || NASA_PARAMETERS[0];

    setLocA(newLocA);
    setLocB(newLocB);
    setSelectedParam(newParam);
    executeAnalysis(newLocA, newLocB, newParam);

    // Smooth scroll straight into Observatory
    const obs = document.getElementById('observatory');
    if (obs) obs.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectParam = (param: NasaParameterConfig) => {
    setSelectedParam(param);
    executeAnalysis(locA, locB, param);
  };

  const handleUpdateLocA = (lat: number, lon: number, name?: string) => {
    setActivePresetId(null);
    const updated = {
      lat,
      lon,
      name: name || `Node A (${lat}°, ${lon}°)`,
    };
    setLocA(updated);
    executeAnalysis(updated, locB, selectedParam);
  };

  const handleUpdateLocB = (lat: number, lon: number, name?: string) => {
    setActivePresetId(null);
    const updated = {
      lat,
      lon,
      name: name || `Node B (${lat}°, ${lon}°)`,
    };
    setLocB(updated);
    executeAnalysis(locA, updated, selectedParam);
  };

  const handleSwapLocations = () => {
    const tempA = { ...locA };
    const tempB = { ...locB };
    setLocA(tempB);
    setLocB(tempA);
    executeAnalysis(tempB, tempA, selectedParam);
  };

  const handleLoadCommunityDiscovery = (discovery: CommunityDiscovery) => {
    setActivePresetId(null);
    const loadedLocA = {
      lat: Number(discovery.loc_a_lat),
      lon: Number(discovery.loc_a_lon),
      name: discovery.loc_a_name,
    };
    const loadedLocB = {
      lat: Number(discovery.loc_b_lat),
      lon: Number(discovery.loc_b_lon),
      name: discovery.loc_b_name,
    };
    const loadedParam =
      NASA_PARAMETERS.find(p => p.code === discovery.variable) || selectedParam;

    setLocA(loadedLocA);
    setLocB(loadedLocB);
    setSelectedParam(loadedParam);
    executeAnalysis(loadedLocA, loadedLocB, loadedParam);

    const obs = document.getElementById('observatory');
    if (obs) obs.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F4F3EF] font-space selection:bg-[#FF3B00] selection:text-white">
      {/* 2. Interactive Kinetic Mouse Ribbon Canvas Overlay */}
      <KineticCursorCanvas />

      {/* 3. Minimal Architectural Top Bar */}
      <header className="sticky top-0 z-40 w-full px-6 sm:px-10 py-5 flex justify-between items-center mix-blend-difference text-white">
        {/* Left: Brand */}
        <div className="font-syne font-black text-sm sm:text-base tracking-tight uppercase">
          <a href="#hero">TELECONNECTION® // NASA EARTH LAB</a>
        </div>

        {/* Center: Minimal Indexed Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase">
          <a href="#overview" className="hover:text-[#FF3B00] transition">01 OVERVIEW</a>
          <a href="#observatory" className="hover:text-[#FF3B00] transition">02 OBSERVATORY</a>
          <a href="#archive" className="hover:text-[#FF3B00] transition">03 ARCHIVE</a>
          <a href="#protocol" className="hover:text-[#FF3B00] transition">04 PROTOCOL</a>
        </nav>

        {/* Right: Live Status Pill & Modals */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 border border-white font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B00] animate-ping"></span>
            <span>SYS: ONLINE • POWER + GIBS</span>
          </div>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="hidden sm:inline-flex px-3 py-1 border border-white/40 hover:border-white font-mono text-[11px] uppercase transition"
          >
            GUIDE
          </button>
          <button
            onClick={() => setIsExportOpen(true)}
            disabled={!dataA || !dataB}
            className="hidden sm:inline-flex px-3 py-1 border border-white/40 hover:border-white font-mono text-[11px] uppercase transition disabled:opacity-40"
          >
            EXPORT
          </button>
        </div>
      </header>

      {/* 4. MONUMENTAL HERO SECTION (Full-bleed #FF3B00 Electric Orange-Red) */}
      <section id="hero" className="relative w-full bg-[#FF3B00] text-black overflow-hidden pt-12 sm:pt-20 pb-0">
        <div className="max-w-[1700px] mx-auto px-6 sm:px-10 space-y-6">
          {/* Section Marker */}
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest font-bold">
            <span>NASA SPACE APPS CHALLENGE // 2026</span>
            <span>DATA TIME-SERIES: 2005 — 2024</span>
          </div>

          {/* Monumental Headline */}
          <div className="py-4">
            <h1 className="text-[14vw] sm:text-[12vw] leading-[0.84] font-syne font-extrabold tracking-[-0.04em] uppercase text-black select-none">
              EARTH<br />SEESAW
            </h1>
          </div>

          {/* Editorial Sub-Headline */}
          <div className="max-w-2xl pb-10">
            <p className="text-xl sm:text-2xl font-space font-medium text-black leading-snug">
              Uncovering statistically opposite climate trends across the planet using 20 years of NASA satellite telemetry.
            </p>
          </div>
        </div>

        {/* Infinite Horizontal Kinetic Marquee Strip */}
        <div className="w-full bg-[#0A0A0A] text-[#F4F3EF] border-t-2 border-b-2 border-black py-3.5 overflow-hidden font-mono text-xs uppercase tracking-widest font-bold select-none">
          <div className="animate-marquee-infinite flex gap-8 whitespace-nowrap">
            <span>NASA POWER MERRA-2 DATA</span>
            <span className="text-[#FF3B00]">•</span>
            <span>MODIS TERRA SATELLITE IMAGERY</span>
            <span className="text-[#FF3B00]">•</span>
            <span>OLS REGRESSION & P-VALUE PROOF</span>
            <span className="text-[#FF3B00]">•</span>
            <span>TWO-TAILED STUDENT'S T-TEST (DF = 18)</span>
            <span className="text-[#FF3B00]">•</span>
            <span>PEARSON CORRELATION R</span>
            <span className="text-[#FF3B00]">•</span>
            <span>2005–2024 POINT CLIMATOLOGY</span>
            <span className="text-[#FF3B00]">•</span>
            {/* Duplicated for smooth loop */}
            <span>NASA POWER MERRA-2 DATA</span>
            <span className="text-[#FF3B00]">•</span>
            <span>MODIS TERRA SATELLITE IMAGERY</span>
            <span className="text-[#FF3B00]">•</span>
            <span>OLS REGRESSION & P-VALUE PROOF</span>
            <span className="text-[#FF3B00]">•</span>
            <span>TWO-TAILED STUDENT'S T-TEST (DF = 18)</span>
            <span className="text-[#FF3B00]">•</span>
            <span>PEARSON CORRELATION R</span>
            <span className="text-[#FF3B00]">•</span>
            <span>2005–2024 POINT CLIMATOLOGY</span>
            <span className="text-[#FF3B00]">•</span>
          </div>
        </div>
      </section>

      {/* SECTION 01 — EDITORIAL THESIS (#F4F3EF Paper Cream) */}
      <section id="overview" className="w-full bg-[#F4F3EF] text-[#0A0A0A] py-24 px-6 sm:px-10 border-b border-[#0A0A0A]/20">
        <div className="max-w-[1700px] mx-auto space-y-20">
          {/* Big Typography Manifesto */}
          <div className="max-w-5xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B00] font-bold">
              01 // THE THESIS
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-syne font-extrabold tracking-tight leading-[0.98] uppercase">
              Most climate dashboards get looked at.{' '}
              <span className="text-[#FF3B00] italic font-serif normal-case">
                Ours proves planetary dipoles.
              </span>
            </h2>
            <p className="text-base sm:text-lg font-space text-[#0A0A0A]/80 max-w-2xl leading-relaxed pt-2">
              Earth's climate system does not operate in isolation. Mass and heat redistribution across the Hadley, Walker, and Rossby wave trains creates anti-phase climate dipoles. Select a benchmark below to load its 20-year NASA satellite telemetry:
            </p>
          </div>

          {/* 4 Oversized Architectural Preset Launch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t-2 border-l-2 border-[#0A0A0A]">
            {CLIMATE_DIPOLE_PRESETS.slice(0, 4).map((preset, index) => {
              const isSelected = activePresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`border-r-2 border-b-2 border-[#0A0A0A] p-7 transition-colors duration-300 flex flex-col justify-between space-y-8 cursor-pointer group ${
                    isSelected ? 'bg-[#0A0A0A] text-[#F4F3EF]' : 'bg-transparent text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F4F3EF]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between font-mono text-xs font-bold">
                      <span className="text-[#FF3B00]">0{index + 1}</span>
                      <span className="px-2 py-0.5 border border-current text-[10px] uppercase">
                        {preset.recommendedParameter}
                      </span>
                    </div>

                    <h3 className="text-xl font-syne font-black uppercase leading-tight tracking-tight">
                      {preset.name}
                    </h3>

                    <p className="text-xs opacity-75 font-space leading-relaxed line-clamp-3">
                      {preset.scientificDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-current/20 flex items-center justify-between font-mono text-xs">
                    <span className="truncate max-w-[150px]">{preset.locA.name.split('(')[0]} VS {preset.locB.name.split('(')[0]}</span>
                    <ArrowDownRight className="w-4 h-4 text-[#FF3B00] group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 02 — LIVE NASA OBSERVATORY (#0A0A0A Void Black, Full-bleed Split Console) */}
      <section id="observatory" className="w-full bg-[#0A0A0A] text-[#F4F3EF] py-20 px-6 sm:px-10 border-b border-white/15">
        <div className="max-w-[1700px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-white/15 pb-6 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B00] font-bold">
                02 // LIVE NASA OBSERVATORY
              </span>
              <h2 className="text-4xl sm:text-6xl font-syne font-black tracking-tight uppercase text-white mt-1">
                TELEMETRY CONSOLE
              </h2>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-white/60">
              <span>TARGET A: <strong className="text-[#FF3B00]">{locA.name.split('(')[0]}</strong></span>
              <span>/</span>
              <span>TARGET B: <strong className="text-white">{locB.name.split('(')[0]}</strong></span>
            </div>
          </div>

          {/* Full-bleed Split Console: 55% Left (Map) / 45% Right (Analytics) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 55%: NASA GIBS Satellite Map */}
            <div className="lg:col-span-7 flex flex-col">
              <NasaMap
                locA={locA}
                locB={locB}
                onUpdateLocA={handleUpdateLocA}
                onUpdateLocB={handleUpdateLocB}
                activeSelectionMode={activeSelectionMode}
                onChangeSelectionMode={setActiveSelectionMode}
                onSwapLocations={handleSwapLocations}
              />
            </div>

            {/* Right 45%: Swiss Telemetry Readout Panel */}
            <div className="lg:col-span-5 flex flex-col">
              <TrendAnalytics
                selectedParam={selectedParam}
                onSelectParam={handleSelectParam}
                locA={locA}
                locB={locB}
                dataA={dataA}
                dataB={dataB}
                statsA={statsA}
                statsB={statsB}
                correlation={correlation}
                verdict={verdict}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onOpenPublishModal={() => setIsPublishModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03 — COMMUNITY DETECTIVE ARCHIVE (#F4F3EF Paper Cream) */}
      <section id="archive" className="w-full bg-[#F4F3EF] text-[#0A0A0A] py-24 px-6 sm:px-10 border-b border-[#0A0A0A]/20">
        <div className="max-w-[1700px] mx-auto">
          <DiscoveryBoard
            currentInvestigation={
              verdict && statsA && statsB && correlation
                ? {
                    variable: selectedParam.code,
                    variableName: selectedParam.name,
                    locAName: locA.name,
                    locALat: locA.lat,
                    locALon: locA.lon,
                    locBName: locB.name,
                    locBLat: locB.lat,
                    locBLon: locB.lon,
                    slopeADecade: statsA.slopePerDecade,
                    slopeBDecade: statsB.slopePerDecade,
                    pValueA: statsA.pValue,
                    pValueB: statsB.pValue,
                    r: correlation.r,
                    verdict: verdict.verdict,
                    confidenceScore: verdict.confidenceScore,
                  }
                : undefined
            }
            onLoadDiscovery={handleLoadCommunityDiscovery}
            isPublishModalOpen={isPublishModalOpen}
            onClosePublishModal={() => setIsPublishModalOpen(false)}
          />
        </div>
      </section>

      {/* SECTION 04 — SCIENTIFIC PROTOCOL (#0A0A0A Void Black) */}
      <section id="protocol" className="w-full bg-[#0A0A0A] text-[#F4F3EF] py-20 px-6 sm:px-10 border-b border-white/15">
        <div className="max-w-[1700px] mx-auto space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B00] font-bold">
            04 // DATA PROVENANCE & METHODOLOGY
          </span>
          <DataProvenance />
        </div>
      </section>

      {/* 5. FOOTER (#FF3B00 Electric Orange-Red) */}
      <footer className="w-full bg-[#FF3B00] text-black py-16 px-6 sm:px-10 font-sans">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b-2 border-black pb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              NASA INTERNATIONAL SPACE APPS CHALLENGE
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-syne font-black uppercase tracking-tight leading-none mt-2">
              EARTH TREND<br />DETECTIVE
            </h2>
          </div>

          <div className="font-mono text-xs space-y-2 uppercase max-w-sm">
            <div>• CITATION: NASA POWER CLIMATOLOGY API (MERRA-2 REANALYSIS)</div>
            <div>• CITATION: NASA GIBS MODIS TERRA SATELLITE TILES (EPSG:3857)</div>
            <div>• STATISTICAL SUITE: OLS SLOPE PER DECADE & STUDENT'S T P-VALUE</div>
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono font-bold uppercase gap-4">
          <div>© 2026 TELECONNECTION® LAB • ALL RIGHTS RESERVED</div>
          <div className="flex items-center gap-6">
            <a href="https://power.larc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              <span>NASA POWER</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              <span>NASA GIBS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <ScienceGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {dataA && dataB && statsA && statsB && correlation && verdict && (
        <ExportReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          dataA={dataA}
          dataB={dataB}
          statsA={statsA}
          statsB={statsB}
          correlation={correlation}
          verdict={verdict}
          param={selectedParam}
          locAName={locA.name}
          locBName={locB.name}
        />
      )}
    </div>
  );
};

export default App;
