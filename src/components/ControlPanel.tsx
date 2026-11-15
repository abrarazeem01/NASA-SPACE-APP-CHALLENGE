import React from 'react';
import {
  NASA_PARAMETERS,
  NasaParameterConfig,
} from '../services/nasaApi';
import {
  CLIMATE_DIPOLE_PRESETS,
  ClimateDipolePreset,
} from '../data/presets';
import {
  Compass,
  Thermometer,
  CloudRain,
  Droplets,
  Sun,
  Search,
  ArrowRightLeft,
  Sparkles,
  MapPin,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface LocationPoint {
  lat: number;
  lon: number;
  name: string;
}

interface ControlPanelProps {
  selectedParam: NasaParameterConfig;
  onSelectParam: (param: NasaParameterConfig) => void;
  locA: LocationPoint;
  locB: LocationPoint;
  onUpdateLocA: (lat: number, lon: number, name?: string) => void;
  onUpdateLocB: (lat: number, lon: number, name?: string) => void;
  onSelectPreset: (preset: ClimateDipolePreset) => void;
  activePresetId: string | null;
  onRunAnalysis: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedParam,
  onSelectParam,
  locA,
  locB,
  onUpdateLocA,
  onUpdateLocB,
  onSelectPreset,
  activePresetId,
  onRunAnalysis,
  isLoading,
}) => {
  const getParamIcon = (code: string) => {
    switch (code) {
      case 'T2M':
        return <Thermometer className="w-4 h-4 text-amber-400" />;
      case 'PRECTOTCORR':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'GWETTOP':
        return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'ALLSKY_SFC_SW_DWN':
        return <Sun className="w-4 h-4 text-purple-400" />;
      default:
        return <Compass className="w-4 h-4 text-nasa-cyan" />;
    }
  };

  const handleSwapLocations = () => {
    const tempA = { ...locA };
    onUpdateLocA(locB.lat, locB.lon, locB.name);
    onUpdateLocB(tempA.lat, tempA.lon, tempA.name);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-space-700/80 shadow-xl space-y-6">
      {/* 1. Presets Header & Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-nasa-cyan" />
            Curated Climate Dipole Presets
          </label>
          <span className="text-[11px] text-slate-400">
            Real NASA Teleconnections
          </span>
        </div>

        <div className="relative">
          <select
            value={activePresetId || ''}
            onChange={e => {
              const preset = CLIMATE_DIPOLE_PRESETS.find(p => p.id === e.target.value);
              if (preset) onSelectPreset(preset);
            }}
            className="w-full appearance-none bg-space-900 border border-space-600 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-nasa-cyan cursor-pointer transition pr-10 shadow-inner"
          >
            <option value="" disabled>
              Select a benchmark climate seesaw...
            </option>
            {CLIMATE_DIPOLE_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                [{preset.category}] {preset.name} ({preset.locA.name.split('(')[0]} vs {preset.locB.name.split('(')[0]})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 2. Variable Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-nasa-cyan" />
            NASA POWER Earth Science Variable
          </label>
          <span className="text-[11px] font-mono text-nasa-cyan">
            Active: {selectedParam.code} ({selectedParam.unit})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {NASA_PARAMETERS.map(param => {
            const isSelected = selectedParam.code === param.code;
            return (
              <button
                key={param.code}
                onClick={() => onSelectParam(param)}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850/90 border-nasa-cyan shadow-lg shadow-nasa-cyan/10 ring-1 ring-nasa-cyan/50'
                    : 'bg-space-900/60 border-space-700/60 hover:bg-space-850 hover:border-space-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    {getParamIcon(param.code)}
                    <span className="font-bold text-xs text-white">
                      {param.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-slate-300 border border-space-700">
                    {param.unit}
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-medium line-clamp-1">
                  {param.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {param.shortDescription}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Location Coordinate Inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-nasa-cyan" />
            Dual Node Coordinates
          </label>
          <button
            onClick={handleSwapLocations}
            className="flex items-center gap-1 text-[11px] font-semibold text-nasa-cyan hover:text-cyan-300 transition"
            title="Swap Node A and Node B"
          >
            <ArrowRightLeft className="w-3 h-3" />
            Swap Nodes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Node A Input */}
          <div className="p-3.5 rounded-xl bg-space-900/70 border border-nasa-cyan/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-nasa-cyan flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nasa-cyan"></span>
                Node A (Location 1)
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {locA.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Latitude (-90 to 90)</span>
                <input
                  type="number"
                  step="0.01"
                  min="-90"
                  max="90"
                  value={locA.lat}
                  onChange={e => onUpdateLocA(parseFloat(e.target.value) || 0, locA.lon, locA.name)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-nasa-cyan"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Longitude (-180 to 180)</span>
                <input
                  type="number"
                  step="0.01"
                  min="-180"
                  max="180"
                  value={locA.lon}
                  onChange={e => onUpdateLocA(locA.lat, parseFloat(e.target.value) || 0, locA.name)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-nasa-cyan"
                />
              </div>
            </div>
          </div>

          {/* Node B Input */}
          <div className="p-3.5 rounded-xl bg-space-900/70 border border-nasa-amber/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-nasa-amber flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nasa-amber"></span>
                Node B (Location 2)
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {locB.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Latitude (-90 to 90)</span>
                <input
                  type="number"
                  step="0.01"
                  min="-90"
                  max="90"
                  value={locB.lat}
                  onChange={e => onUpdateLocB(parseFloat(e.target.value) || 0, locB.lon, locB.name)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-nasa-amber"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Longitude (-180 to 180)</span>
                <input
                  type="number"
                  step="0.01"
                  min="-180"
                  max="180"
                  value={locB.lon}
                  onChange={e => onUpdateLocB(locB.lat, parseFloat(e.target.value) || 0, locB.name)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-nasa-amber"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Button */}
      <button
        onClick={onRunAnalysis}
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-nasa-blue via-blue-600 to-nasa-cyan hover:from-blue-700 hover:via-blue-600 hover:to-cyan-400 active:scale-[0.99] transition shadow-xl shadow-nasa-cyan/20 border border-nasa-cyan/40 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Search className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>
          {isLoading
            ? 'Querying NASA POWER & Computing Statistical Engine...'
            : 'Analyze 20-Year Teleconnection Seesaw (2005–2024)'}
        </span>
      </button>
    </div>
  );
};
