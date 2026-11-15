import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  NASA_PARAMETERS,
  NasaParameterConfig,
  LocationObservationResult,
} from '../services/nasaApi';
import {
  LinearRegressionResult,
  PearsonCorrelationResult,
  DetectiveVerdict,
  calculateZScoreAnomalies,
} from '../utils/earthStats';
import {
  AlertTriangle,
  Layers,
  Share2,
} from 'lucide-react';

interface LocationPoint {
  lat: number;
  lon: number;
  name: string;
}

interface TrendAnalyticsProps {
  selectedParam: NasaParameterConfig;
  onSelectParam: (param: NasaParameterConfig) => void;
  locA: LocationPoint;
  locB: LocationPoint;
  dataA: LocationObservationResult | null;
  dataB: LocationObservationResult | null;
  statsA: LinearRegressionResult | null;
  statsB: LinearRegressionResult | null;
  correlation: PearsonCorrelationResult | null;
  verdict: DetectiveVerdict | null;
  isLoading: boolean;
  errorMessage: string | null;
  onOpenPublishModal?: () => void;
}

export const TrendAnalytics: React.FC<TrendAnalyticsProps> = ({
  selectedParam,
  onSelectParam,
  locA,
  locB,
  dataA,
  dataB,
  statsA,
  statsB,
  correlation,
  verdict,
  isLoading,
  errorMessage,
  onOpenPublishModal,
}) => {
  const [chartMode, setChartMode] = useState<'dual_axis' | 'z_score'>('dual_axis');

  // Build chart dataset
  let chartData: any[] = [];
  if (dataA && dataB && statsA && statsB) {
    const years = Array.from(new Set([...dataA.years, ...dataB.years])).sort((a, b) => a - b);
    const zScoresA = calculateZScoreAnomalies(dataA.values);
    const zScoresB = calculateZScoreAnomalies(dataB.values);

    const valMapA = new Map<number, number>();
    const zMapA = new Map<number, number>();
    dataA.years.forEach((yr, i) => {
      valMapA.set(yr, dataA.values[i]);
      zMapA.set(yr, zScoresA[i]);
    });

    const valMapB = new Map<number, number>();
    const zMapB = new Map<number, number>();
    dataB.years.forEach((yr, i) => {
      valMapB.set(yr, dataB.values[i]);
      zMapB.set(yr, zScoresB[i]);
    });

    const trendMapA = new Map<number, number>();
    statsA.trendLinePoints.forEach(p => trendMapA.set(p.year, p.trend));

    const trendMapB = new Map<number, number>();
    statsB.trendLinePoints.forEach(p => trendMapB.set(p.year, p.trend));

    chartData = years.map(yr => ({
      year: yr,
      valueA: valMapA.get(yr) ?? null,
      valueB: valMapB.get(yr) ?? null,
      trendA: trendMapA.get(yr) ?? null,
      trendB: trendMapB.get(yr) ?? null,
      zScoreA: zMapA.get(yr) ?? null,
      zScoreB: zMapB.get(yr) ?? null,
    }));
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/15 p-6 flex flex-col justify-between space-y-6 font-sans">
      {/* 1. Variable Selector Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/60">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF3B00]" />
            NASA TELEMETRY PARAMETER
          </span>
          <span className="text-[#FF3B00] font-bold">[{selectedParam.unit}]</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {NASA_PARAMETERS.map(param => {
            const isSelected = selectedParam.code === param.code;
            return (
              <button
                key={param.code}
                onClick={() => onSelectParam(param)}
                className={`p-2.5 text-left transition border font-mono ${
                  isSelected
                    ? 'bg-[#FF3B00] text-black border-[#FF3B00] font-bold'
                    : 'bg-black text-white/80 border-white/15 hover:border-white/40'
                }`}
              >
                <div className="text-xs font-bold leading-none">{param.code}</div>
                <div className="text-[10px] truncate mt-1 opacity-80">{param.name.split('(')[0].replace('2-Meter Surface Air ', '')}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Loading State / Error Display */}
      {isLoading ? (
        <div className="py-20 px-4 bg-black border border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FF3B00] border-t-transparent animate-spin"></div>
          <div className="font-mono text-xs text-[#FF3B00] uppercase tracking-wider">
            QUERYING NASA POWER MERRA-2 (2005–2024)...
          </div>
          <p className="text-[11px] font-mono text-white/50 text-center max-w-xs">
            Crunching 240 monthly observations per node and generating OLS linear regression models.
          </p>
        </div>
      ) : errorMessage ? (
        <div className="p-4 bg-black border border-[#FF3B00] space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 font-bold text-[#FF3B00] uppercase">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>NASA Data Access Notice</span>
          </div>
          <p className="text-white/80 leading-relaxed text-[11px]">
            {errorMessage}
          </p>
          <p className="text-white/50 text-[10px]">
            Note: Variables like Soil Wetness (GWETTOP) require terrestrial coordinates. Please select land points on the map.
          </p>
        </div>
      ) : verdict && statsA && statsB && correlation ? (
        <div className="space-y-6">
          {/* 3. Swiss Telemetry Verdict Banner */}
          <div className="p-5 border border-white/20 bg-black space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                STATISTICAL VERDICT
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                statsA.isSignificant || statsB.isSignificant || correlation.isSignificant
                  ? 'bg-[#FF3B00] text-black'
                  : 'bg-white/10 text-white'
              }`}>
                {statsA.isSignificant || statsB.isSignificant
                  ? 'SIGNIFICANT DIPOLE // P < 0.05'
                  : 'OBSERVED VARIANCE // P ≥ 0.05'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-syne font-black text-white uppercase tracking-tight">
              {verdict.verdict}
            </h3>

            <p className="text-xs text-white/80 leading-relaxed font-space">
              {verdict.scientificSummary}
            </p>
          </div>

          {/* 4. Oversized Tabular Numbers (Decadal Slopes & Pearson r) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Metric A */}
            <div className="p-4 bg-black border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#FF3B00] font-bold">NODE A: {locA.name.split('(')[0]}</span>
                <span className="text-white/40">{statsA.isSignificant ? 'p < 0.05' : `p=${statsA.pValue.toFixed(2)}`}</span>
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-black text-[#FF3B00] tracking-tighter">
                {statsA.slopePerDecade >= 0 ? '+' : ''}{statsA.slopePerDecade.toFixed(2)}
              </div>
              <div className="text-[10px] font-mono text-white/50 uppercase">
                {selectedParam.unit}/DECADE • R²: {(statsA.rSquared * 100).toFixed(1)}%
              </div>
            </div>

            {/* Metric B */}
            <div className="p-4 bg-black border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-white font-bold">NODE B: {locB.name.split('(')[0]}</span>
                <span className="text-white/40">{statsB.isSignificant ? 'p < 0.05' : `p=${statsB.pValue.toFixed(2)}`}</span>
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tighter">
                {statsB.slopePerDecade >= 0 ? '+' : ''}{statsB.slopePerDecade.toFixed(2)}
              </div>
              <div className="text-[10px] font-mono text-white/50 uppercase">
                {selectedParam.unit}/DECADE • R²: {(statsB.rSquared * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Pearson Correlation Strip */}
          <div className="p-3 bg-black border border-white/15 flex items-center justify-between font-mono text-xs">
            <span className="text-white/60">PEARSON CORRELATION (r):</span>
            <span className={`text-sm font-bold ${correlation.r < -0.3 ? 'text-[#FF3B00]' : 'text-white'}`}>
              r = {correlation.r.toFixed(3)} (p = {correlation.pValue.toFixed(4)})
            </span>
          </div>

          {/* 5. Clean Recharts Dual Trendline Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/70 uppercase">20-YEAR OLS TRENDLINE DIVERGENCE</span>
              <div className="flex items-center border border-white/20 p-0.5 bg-black text-[10px]">
                <button
                  onClick={() => setChartMode('dual_axis')}
                  className={`px-2 py-0.5 uppercase transition ${
                    chartMode === 'dual_axis' ? 'bg-[#FF3B00] text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Dual-Axis
                </button>
                <button
                  onClick={() => setChartMode('z_score')}
                  className={`px-2 py-0.5 uppercase transition ${
                    chartMode === 'z_score' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Z-Score
                </button>
              </div>
            </div>

            <div className="h-[240px] w-full p-2 bg-black border border-white/15">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'dual_axis' ? (
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="year"
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#FF3B00"
                      tick={{ fill: '#FF3B00', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      domain={['auto', 'auto']}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#F4F3EF"
                      tick={{ fill: '#F4F3EF', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A0A0A',
                        borderColor: '#FF3B00',
                        borderRadius: '0',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                      }}
                      formatter={(val: any, name: string) => [
                        `${Number(val).toFixed(3)} ${selectedParam.unit}`,
                        name,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />

                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="valueA"
                      name={`Node A (${locA.name.split('(')[0]})`}
                      stroke="#FF3B00"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#FF3B00' }}
                    />
                    <Line
                      yAxisId="left"
                      type="linear"
                      dataKey="trendA"
                      name={`Trend A (${statsA.slopePerDecade >= 0 ? '+' : ''}${statsA.slopePerDecade.toFixed(2)}/dec)`}
                      stroke="#FF3B00"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="valueB"
                      name={`Node B (${locB.name.split('(')[0]})`}
                      stroke="#F4F3EF"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#F4F3EF' }}
                    />
                    <Line
                      yAxisId="right"
                      type="linear"
                      dataKey="trendB"
                      name={`Trend B (${statsB.slopePerDecade >= 0 ? '+' : ''}${statsB.slopePerDecade.toFixed(2)}/dec)`}
                      stroke="#F4F3EF"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </ComposedChart>
                ) : (
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="year"
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis
                      stroke="#888"
                      tick={{ fill: '#888', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      domain={[-3, 3]}
                    />
                    <ReferenceLine y={0} stroke="#444" strokeWidth={1} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A0A0A',
                        borderColor: '#FF3B00',
                        borderRadius: '0',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                      }}
                      formatter={(val: any, name: string) => [`${val} σ`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />

                    <Line
                      type="monotone"
                      dataKey="zScoreA"
                      name={`Node A Anomaly (σ)`}
                      stroke="#FF3B00"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#FF3B00' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="zScoreB"
                      name={`Node B Anomaly (σ)`}
                      stroke="#F4F3EF"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#F4F3EF' }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Button: Publish to Archive */}
          {onOpenPublishModal && (
            <button
              onClick={onOpenPublishModal}
              className="w-full py-3.5 bg-[#FF3B00] hover:bg-[#FF3B00]/90 text-black font-space font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>PUBLISH ANOMALY TO ARCHIVE →</span>
            </button>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-white/40 font-mono text-xs">
          Select coordinates to initiate real-time trend computation.
        </div>
      )}
    </div>
  );
};
