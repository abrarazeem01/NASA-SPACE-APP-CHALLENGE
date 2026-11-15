import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  LinearRegressionResult,
  calculateZScoreAnomalies,
} from '../utils/earthStats';
import {
  NasaParameterConfig,
  LocationObservationResult,
} from '../services/nasaApi';
import {
  LineChart as LineChartIcon,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Percent,
  Info,
} from 'lucide-react';

interface TrendChartsProps {
  dataA: LocationObservationResult;
  dataB: LocationObservationResult;
  statsA: LinearRegressionResult;
  statsB: LinearRegressionResult;
  param: NasaParameterConfig;
  locAName: string;
  locBName: string;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
  dataA,
  dataB,
  statsA,
  statsB,
  param,
  locAName,
  locBName,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'anomalies' | 'decadal'>('trends');

  // Prepare combined annual data
  const years = Array.from(new Set([...dataA.years, ...dataB.years])).sort((a, b) => a - b);
  const zScoresA = calculateZScoreAnomalies(dataA.values);
  const zScoresB = calculateZScoreAnomalies(dataB.values);

  const zMapA = new Map<number, number>();
  dataA.years.forEach((yr, idx) => zMapA.set(yr, zScoresA[idx]));

  const zMapB = new Map<number, number>();
  dataB.years.forEach((yr, idx) => zMapB.set(yr, zScoresB[idx]));

  const valMapA = new Map<number, number>();
  dataA.annualSeries.forEach(d => valMapA.set(d.year, d.value));

  const valMapB = new Map<number, number>();
  dataB.annualSeries.forEach(d => valMapB.set(d.year, d.value));

  const trendMapA = new Map<number, number>();
  statsA.trendLinePoints.forEach(p => trendMapA.set(p.year, p.trend));

  const trendMapB = new Map<number, number>();
  statsB.trendLinePoints.forEach(p => trendMapB.set(p.year, p.trend));

  const chartData = years.map(yr => {
    return {
      year: yr,
      valueA: valMapA.get(yr) ?? null,
      valueB: valMapB.get(yr) ?? null,
      trendA: trendMapA.get(yr) ?? null,
      trendB: trendMapB.get(yr) ?? null,
      zScoreA: zMapA.get(yr) ?? null,
      zScoreB: zMapB.get(yr) ?? null,
    };
  });

  // Calculate Decadal Means (2005-2014 vs 2015-2024)
  const d1A = dataA.annualSeries.filter(d => d.year <= 2014).map(d => d.value);
  const d2A = dataA.annualSeries.filter(d => d.year >= 2015).map(d => d.value);
  const meanD1A = d1A.length ? d1A.reduce((a, b) => a + b, 0) / d1A.length : 0;
  const meanD2A = d2A.length ? d2A.reduce((a, b) => a + b, 0) / d2A.length : 0;

  const d1B = dataB.annualSeries.filter(d => d.year <= 2014).map(d => d.value);
  const d2B = dataB.annualSeries.filter(d => d.year >= 2015).map(d => d.value);
  const meanD1B = d1B.length ? d1B.reduce((a, b) => a + b, 0) / d1B.length : 0;
  const meanD2B = d2B.length ? d2B.reduce((a, b) => a + b, 0) / d2B.length : 0;

  const decadalBarData = [
    {
      period: '2005–2014 (Baseline Decade)',
      locA: Number(meanD1A.toFixed(3)),
      locB: Number(meanD1B.toFixed(3)),
    },
    {
      period: '2015–2024 (Recent Decade)',
      locA: Number(meanD2A.toFixed(3)),
      locB: Number(meanD2B.toFixed(3)),
    },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-space-700/80 shadow-xl space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-space-700/60 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-nasa-cyan" />
            20-Year NASA Earth Trend Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparing <strong className="text-nasa-cyan">{locAName}</strong> vs{' '}
            <strong className="text-nasa-amber">{locBName}</strong> ({param.name})
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-space-950 p-1 border border-space-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'bg-space-800 text-nasa-cyan shadow border border-nasa-cyan/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Dual Trends & OLS</span>
          </button>

          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'anomalies'
                ? 'bg-space-800 text-emerald-400 shadow border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Z-Score Seesaw</span>
          </button>

          <button
            onClick={() => setActiveTab('decadal')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'decadal'
                ? 'bg-space-800 text-amber-400 shadow border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Decadal Shift</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-[360px] sm:h-[400px] w-full pt-2">
        {activeTab === 'trends' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2e63" opacity={0.6} />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                yAxisId="left"
                stroke="#00D1FF"
                tick={{ fill: '#00D1FF', fontSize: 11 }}
                domain={['auto', 'auto']}
                label={{
                  value: `${locAName} (${param.unit})`,
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#00D1FF',
                  fontSize: 10,
                  offset: 0,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#FF9F1C"
                tick={{ fill: '#FF9F1C', fontSize: 11 }}
                domain={['auto', 'auto']}
                label={{
                  value: `${locBName} (${param.unit})`,
                  angle: 90,
                  position: 'insideRight',
                  fill: '#FF9F1C',
                  fontSize: 10,
                  offset: 0,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b132b',
                  borderColor: '#1c2e63',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.8)',
                }}
                formatter={(val: any, name: string) => {
                  if (typeof val !== 'number') return [val, name];
                  return [`${val.toFixed(3)} ${param.unit}`, name];
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
              />

              {/* Observed Node A */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="valueA"
                name={`Observed: ${locAName}`}
                stroke="#00D1FF"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#00D1FF' }}
                activeDot={{ r: 6 }}
              />

              {/* OLS Trendline Node A */}
              <Line
                yAxisId="left"
                type="linear"
                dataKey="trendA"
                name={`Trend A (${statsA.slopePerDecade >= 0 ? '+' : ''}${statsA.slopePerDecade.toFixed(2)}/dec)`}
                stroke="#38BDF8"
                strokeWidth={1.75}
                strokeDasharray="5 5"
                dot={false}
              />

              {/* Observed Node B */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="valueB"
                name={`Observed: ${locBName}`}
                stroke="#FF9F1C"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#FF9F1C' }}
                activeDot={{ r: 6 }}
              />

              {/* OLS Trendline Node B */}
              <Line
                yAxisId="right"
                type="linear"
                dataKey="trendB"
                name={`Trend B (${statsB.slopePerDecade >= 0 ? '+' : ''}${statsB.slopePerDecade.toFixed(2)}/dec)`}
                stroke="#F97316"
                strokeWidth={1.75}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'anomalies' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2e63" opacity={0.6} />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[-3, 3]}
                label={{
                  value: 'Standardized Z-Score (σ)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 10,
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b132b',
                  borderColor: '#1c2e63',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: string) => [`${val} σ`, name]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
              />

              {/* Node A Z-Scores */}
              <Line
                type="monotone"
                dataKey="zScoreA"
                name={`${locAName} Anomaly (Z-Score)`}
                stroke="#00D1FF"
                strokeWidth={3}
                dot={{ r: 4, fill: '#00D1FF' }}
              />

              {/* Node B Z-Scores */}
              <Line
                type="monotone"
                dataKey="zScoreB"
                name={`${locBName} Anomaly (Z-Score)`}
                stroke="#FF9F1C"
                strokeWidth={3}
                dot={{ r: 4, fill: '#FF9F1C' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'decadal' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={decadalBarData}
              margin={{ top: 20, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2e63" opacity={0.6} />
              <XAxis
                dataKey="period"
                stroke="#64748b"
                tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={['auto', 'auto']}
                label={{
                  value: `${param.name} (${param.unit})`,
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b132b',
                  borderColor: '#1c2e63',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: string) => [`${val} ${param.unit}`, name]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
              />

              <Bar
                dataKey="locA"
                name={locAName}
                fill="#00D1FF"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="locB"
                name={locBName}
                fill="#FF9F1C"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Explanatory Chart Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-space-700/60 pt-3">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-nasa-cyan" />
          <span>
            {activeTab === 'trends' && 'Dashed lines represent Ordinary Least Squares (OLS) linear trendlines.'}
            {activeTab === 'anomalies' && 'Normalized Z-Scores: Mirrored lines across 0 confirm anti-phase seesaw dynamics.'}
            {activeTab === 'decadal' && 'Compares 2005–2014 climatological baseline with the 2015–2024 warming decade.'}
          </span>
        </div>
        <div className="font-mono text-slate-400">
          Sample size: n = {dataA.values.length} annual means (2005–2024)
        </div>
      </div>
    </div>
  );
};
