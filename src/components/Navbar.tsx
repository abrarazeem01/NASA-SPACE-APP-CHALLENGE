import React from 'react';
import { Satellite, Globe2, BookOpen, Users, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenGuide: () => void;
  onOpenCommunity: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenGuide,
  onOpenCommunity,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-space-700/60 bg-space-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-nasa-blue via-blue-600 to-nasa-cyan p-0.5 shadow-lg shadow-nasa-cyan/20">
            <div className="w-full h-full bg-space-950 rounded-[10px] flex items-center justify-center">
              <Satellite className="w-5 h-5 text-nasa-cyan animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white sm:text-lg text-sm bg-gradient-to-r from-white via-slate-100 to-nasa-cyan bg-clip-text text-transparent">
                TeleConnection
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-nasa-blue/40 text-nasa-cyan border border-nasa-cyan/30">
                NASA Space Apps
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Earth System Trend Detective • 20-Year Satellite & Reanalysis Analysis (2005–2024)
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900 border border-space-700/60 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px]">NASA POWER API</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900 border border-space-700/60 text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-nasa-cyan" />
            <span className="font-mono text-[11px]">NASA GIBS WMTS</span>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nasa-blue/20 border border-nasa-cyan/40 text-nasa-cyan animate-pulse">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[11px] font-medium">Crunching 20-Year Data...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-space-900 hover:bg-space-800 text-slate-200 hover:text-white border border-space-700 transition text-xs font-medium"
            title="NASA Earth Science Guide & Statistical Engine"
          >
            <BookOpen className="w-4 h-4 text-nasa-cyan" />
            <span className="hidden sm:inline">Science Guide</span>
          </button>

          <button
            onClick={onOpenCommunity}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-gradient-to-r from-nasa-blue/60 to-space-800 hover:from-nasa-blue hover:to-space-700 text-white border border-nasa-cyan/30 transition text-xs font-medium shadow-md shadow-nasa-cyan/10"
            title="Browse and submit community discoveries"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Community Discoveries</span>
          </button>
        </div>
      </div>
    </header>
  );
};
