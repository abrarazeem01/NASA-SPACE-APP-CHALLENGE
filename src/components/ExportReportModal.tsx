import React, { useState } from 'react';
import {
  LinearRegressionResult,
  PearsonCorrelationResult,
  DetectiveVerdict,
} from '../utils/earthStats';
import {
  NasaParameterConfig,
  LocationObservationResult,
} from '../services/nasaApi';
import {
  X,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Download,
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataA: LocationObservationResult;
  dataB: LocationObservationResult;
  statsA: LinearRegressionResult;
  statsB: LinearRegressionResult;
  correlation: PearsonCorrelationResult;
  verdict: DetectiveVerdict;
  param: NasaParameterConfig;
  locAName: string;
  locBName: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  dataA,
  dataB,
  statsA,
  statsB,
  correlation,
  verdict,
  param,
  locAName,
  locBName,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Build CSV string
  const generateCSV = (): string => {
    const years = Array.from(new Set([...dataA.years, ...dataB.years])).sort((a, b) => a - b);
    const valMapA = new Map<number, number>();
    dataA.annualSeries.forEach(d => valMapA.set(d.year, d.value));
    const valMapB = new Map<number, number>();
    dataB.annualSeries.forEach(d => valMapB.set(d.year, d.value));

    let csv = `# NASA Space Apps Challenge: Be An Earth System Trend Detective\n`;
    csv += `# Parameter: ${param.name} (${param.code}), Unit: ${param.unit}\n`;
    csv += `# Location A: ${locAName} (Lat: ${dataA.latitude}, Lon: ${dataA.longitude})\n`;
    csv += `# Location B: ${locBName} (Lat: ${dataB.latitude}, Lon: ${dataB.longitude})\n`;
    csv += `# Decadal Slope A: ${statsA.slopePerDecade.toFixed(4)} ${param.unit}/decade (p=${statsA.pValue.toFixed(4)})\n`;
    csv += `# Decadal Slope B: ${statsB.slopePerDecade.toFixed(4)} ${param.unit}/decade (p=${statsB.pValue.toFixed(4)})\n`;
    csv += `# Pearson r: ${correlation.r.toFixed(4)}, p-value: ${correlation.pValue.toFixed(4)}\n`;
    csv += `# Verdict: ${verdict.verdict}\n\n`;
    csv += `Year,${locAName.replace(/,/g, ' ')}_${param.code},${locBName.replace(/,/g, ' ')}_${param.code}\n`;

    years.forEach(yr => {
      const vA = valMapA.get(yr) !== undefined ? valMapA.get(yr) : '';
      const vB = valMapB.get(yr) !== undefined ? valMapB.get(yr) : '';
      csv += `${yr},${vA},${vB}\n`;
    });

    return csv;
  };

  // Build Markdown Scientific Brief
  const generateMarkdownReport = (): string => {
    return `# TELECONNECTION INVESTIGATION BRIEF
**NASA Space Apps Challenge: Be An Earth System Trend Detective!**
*Generated: ${new Date().toLocaleDateString()}*

---

## 1. INVESTIGATION OVERVIEW
- **Earth Science Variable:** ${param.name} (\`${param.code}\`)
- **Measurement Unit:** ${param.unit}
- **Data Source:** NASA POWER Monthly Reanalysis (MERRA-2 assimilation, 2005–2024)
- **Node A:** ${locAName} (Latitude: ${dataA.latitude}°, Longitude: ${dataA.longitude}°)
- **Node B:** ${locBName} (Latitude: ${dataB.latitude}°, Longitude: ${dataB.longitude}°)

---

## 2. DETECTIVE VERDICT
### **${verdict.verdict}** (Confidence: ${verdict.confidenceScore}%)
**${verdict.headline}**

${verdict.scientificSummary}

### Atmospheric / Physical Mechanism
${verdict.atmosphericMechanism}

---

## 3. STATISTICAL ENGINE METRICS
- **Degrees of Freedom (df):** 18 (20 annual epochs)
- **Node A Decadal Slope:** ${statsA.slopePerDecade >= 0 ? '+' : ''}${statsA.slopePerDecade.toFixed(4)} ${param.unit}/decade (p = ${statsA.pValue.toFixed(4)}, ${statsA.isSignificant ? 'Statistically Significant at α=0.05' : 'Insignificant'})
- **Node B Decadal Slope:** ${statsB.slopePerDecade >= 0 ? '+' : ''}${statsB.slopePerDecade.toFixed(4)} ${param.unit}/decade (p = ${statsB.pValue.toFixed(4)}, ${statsB.isSignificant ? 'Statistically Significant at α=0.05' : 'Insignificant'})
- **Pearson Correlation (r):** ${correlation.r.toFixed(4)} (p = ${correlation.pValue.toFixed(4)})
- **Coupling Classification:** ${correlation.strengthDescription}
- **Variance Explained (R²):** Node A = ${(statsA.rSquared * 100).toFixed(2)}%, Node B = ${(statsB.rSquared * 100).toFixed(2)}%

---

## 4. KEY SCIENTIFIC TAKEAWAYS
${verdict.keyTakeaways.map(t => `- ${t}`).join('\n')}
`;
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `teleconnection_${param.code}_${dataA.latitude}_${dataB.latitude}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = () => {
    const mdContent = generateMarkdownReport();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NASA_SpaceApps_Investigation_${param.code}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060C]/85 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#070D1A] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#03060C]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0A1120] border border-[#00F0FF]/40 text-[#00F0FF]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-space font-bold text-white text-lg">Export Investigation Data & Brief</h3>
              <p className="text-xs text-slate-400 font-mono">
                NASA Space Apps Ready Citations, Raw CSV & Markdown Report
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

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-[#03060C]/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 transition font-mono font-bold"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
              <span>Download CSV (Time Series)</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A1120] hover:bg-[#111D36] text-slate-200 border border-white/10 transition font-mono font-bold"
            >
              <Download className="w-4 h-4 text-[#00F0FF]" />
              <span>Download Markdown Brief</span>
            </button>
          </div>

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1120] hover:bg-[#111D36] text-slate-300 hover:text-white font-mono transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Report Text</span>
              </>
            )}
          </button>
        </div>

        {/* Report Preview */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs bg-[#03060C]/90 text-slate-300 whitespace-pre-wrap leading-relaxed select-text border-t border-white/10">
          {generateMarkdownReport()}
        </div>
      </div>
    </div>
  );
};
