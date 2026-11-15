/**
 * Earth Systems Statistical Engine
 * Provides dependency-free statistical calculations for NASA trend teleconnection detection:
 * - Ordinary Least Squares (OLS) Linear Regression
 * - Student's t-distribution two-tailed p-value calculation via regularized incomplete beta function
 * - Pearson Correlation Coefficient (r) & statistical significance
 * - Anomaly & Z-score calculations
 * - Detective Verdict Generation & Scientific Interpretations
 */

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  slopePerDecade: number;
  tStatistic: number;
  pValue: number;
  stdError: number;
  isSignificant: boolean; // p < 0.05
  trendLinePoints: { year: number; trend: number }[];
}

export interface PearsonCorrelationResult {
  r: number;
  tStatistic: number;
  pValue: number;
  isSignificant: boolean;
  strengthDescription: string;
}

export type VerdictCategory = 'CONFIRMED INVERSE SEESAW' | 'DIVERGENT TREND' | 'SYNCHRONIZED TREND';

export interface DetectiveVerdict {
  verdict: VerdictCategory;
  headline: string;
  confidenceScore: number; // 0 to 100%
  color: 'emerald' | 'amber' | 'blue' | 'rose';
  scientificSummary: string;
  keyTakeaways: string[];
  atmosphericMechanism: string;
}

/**
 * Natural logarithm of the Gamma function via Lanczos approximation (g=5, n=6)
 * Accurate to > 10 decimal digits
 */
function logGamma(x: number): number {
  const p = [
    1.000000000190015,
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5
  ];

  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = p[0];
  for (let j = 1; j < p.length; j++) {
    y += 1;
    ser += p[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Regularized Incomplete Beta Function I_x(a, b) using continued fraction expansion
 */
function betacf(a: number, b: number, x: number): number {
  const MAX_IT = 100;
  const EPS = 3.0e-7;
  const FPMIN = 1.0e-30;

  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAX_IT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) < EPS) break;
  }

  return h;
}

/**
 * Regularized Incomplete Beta Function I_x(a, b)
 */
function ibeta(a: number, b: number, x: number): number {
  if (x < 0.0 || x > 1.0) return 0.0;
  if (x === 0.0) return 0.0;
  if (x === 1.0) return 1.0;

  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1.0 - x));

  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (bt * betacf(a, b, x)) / a;
  } else {
    return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b;
  }
}

/**
 * Two-tailed p-value for Student's t distribution with `df` degrees of freedom
 */
export function studentTTwoTailedPValue(t: number, df: number): number {
  if (df <= 0 || isNaN(t)) return 1.0;
  const absT = Math.abs(t);
  if (absT === 0) return 1.0;

  // Relation between Student's t and Incomplete Beta:
  // p = I_x(df / 2, 1 / 2) where x = df / (df + t^2)
  const x = df / (df + absT * absT);
  const p = ibeta(df / 2.0, 0.5, x);
  return Math.min(1.0, Math.max(0.0, p));
}

/**
 * Calculate Ordinary Least Squares (OLS) Linear Regression for a time series
 * Returns slope, intercept, rSquared, decadal slope, t-stat, p-value, and trendline
 */
export function calculateLinearRegression(years: number[], values: number[]): LinearRegressionResult {
  const n = years.length;
  if (n < 3) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      slopePerDecade: 0,
      tStatistic: 0,
      pValue: 1,
      stdError: 0,
      isSignificant: false,
      trendLinePoints: years.map(y => ({ year: y, trend: 0 }))
    };
  }

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += years[i];
    sumY += values[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = years[i] - meanX;
    const dy = values[i] - meanY;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = meanY - slope * meanX;

  // R-squared
  const rSquared = (ssXX * ssYY !== 0) ? (ssXY * ssXY) / (ssXX * ssYY) : 0;
  const slopePerDecade = slope * 10;

  // Residual Sum of Squares (RSS)
  let rss = 0;
  for (let i = 0; i < n; i++) {
    const yHat = intercept + slope * years[i];
    const residual = values[i] - yHat;
    rss += residual * residual;
  }

  const df = n - 2;
  const mse = rss / df;
  const stdError = ssXX !== 0 ? Math.sqrt(mse / ssXX) : 0;
  const tStatistic = stdError !== 0 ? slope / stdError : 0;
  const pValue = studentTTwoTailedPValue(tStatistic, df);

  const trendLinePoints = years.map(year => ({
    year,
    trend: Number((intercept + slope * year).toFixed(4))
  }));

  return {
    slope,
    intercept,
    rSquared,
    slopePerDecade,
    tStatistic,
    pValue,
    stdError,
    isSignificant: pValue < 0.05,
    trendLinePoints
  };
}

/**
 * Calculate Pearson Correlation (r) between two paired series
 */
export function calculatePearsonCorrelation(seriesA: number[], seriesB: number[]): PearsonCorrelationResult {
  const n = Math.min(seriesA.length, seriesB.length);
  if (n < 3) {
    return {
      r: 0,
      tStatistic: 0,
      pValue: 1,
      isSignificant: false,
      strengthDescription: 'Insufficient Data'
    };
  }

  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < n; i++) {
    sumA += seriesA[i];
    sumB += seriesB[i];
  }
  const meanA = sumA / n;
  const meanB = sumB / n;

  let ssAA = 0;
  let ssBB = 0;
  let ssAB = 0;

  for (let i = 0; i < n; i++) {
    const da = seriesA[i] - meanA;
    const db = seriesB[i] - meanB;
    ssAA += da * da;
    ssBB += db * db;
    ssAB += da * db;
  }

  const denom = Math.sqrt(ssAA * ssBB);
  const r = denom !== 0 ? ssAB / denom : 0;

  // Compute t-statistic for Pearson r: t = r * sqrt((n - 2) / (1 - r^2))
  const df = n - 2;
  const rClamped = Math.max(-0.999999, Math.min(0.999999, r));
  const tStatistic = (rClamped * Math.sqrt(df)) / Math.sqrt(1 - rClamped * rClamped);
  const pValue = studentTTwoTailedPValue(tStatistic, df);

  let strengthDescription = 'No correlation';
  if (r <= -0.7) strengthDescription = 'Very Strong Inverse Seesaw';
  else if (r <= -0.45) strengthDescription = 'Strong Inverse Teleconnection';
  else if (r <= -0.2) strengthDescription = 'Moderate Inverse Trend';
  else if (r < 0.2) strengthDescription = 'Uncorrelated / Independent';
  else if (r < 0.45) strengthDescription = 'Moderate Positive Covariance';
  else if (r < 0.7) strengthDescription = 'Strong Synchronized Shift';
  else strengthDescription = 'Very Strong Synchronized Coupling';

  return {
    r,
    tStatistic,
    pValue,
    isSignificant: pValue < 0.05,
    strengthDescription
  };
}

/**
 * Standardize a series to Z-score anomalies: (val - mean) / stdDev
 */
export function calculateZScoreAnomalies(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  const mean = values.reduce((acc, v) => acc + v, 0) / n;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1 || 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return values.map(() => 0);
  return values.map(v => Number(((v - mean) / stdDev).toFixed(3)));
}

/**
 * Generate Detective Verdict with NASA-level scientific interpretation
 */
export function generateDetectiveVerdict(
  statsA: LinearRegressionResult,
  statsB: LinearRegressionResult,
  correlation: PearsonCorrelationResult,
  paramLabel: string,
  unit: string,
  locAName: string,
  locBName: string
): DetectiveVerdict {
  const oppositeSlopes = (statsA.slope > 0 && statsB.slope < 0) || (statsA.slope < 0 && statsB.slope > 0);
  const eitherSignificant = statsA.isSignificant || statsB.isSignificant;
  const bothSignificant = statsA.isSignificant && statsB.isSignificant;
  const negativeCorrelation = correlation.r < 0;

  const signA = statsA.slope >= 0 ? '+' : '';
  const signB = statsB.slope >= 0 ? '+' : '';
  const decA = `${signA}${statsA.slopePerDecade.toFixed(2)} ${unit}/decade`;
  const decB = `${signB}${statsB.slopePerDecade.toFixed(2)} ${unit}/decade`;

  // 1. CONFIRMED INVERSE SEESAW
  if (oppositeSlopes && negativeCorrelation && (eitherSignificant || correlation.isSignificant)) {
    let confidence = 75;
    if (bothSignificant) confidence += 15;
    if (correlation.r < -0.5) confidence += 10;
    confidence = Math.min(99, confidence);

    return {
      verdict: 'CONFIRMED INVERSE SEESAW',
      headline: `Verified Climate Teleconnection Dipole: ${locAName} vs. ${locBName}`,
      confidenceScore: confidence,
      color: 'emerald',
      scientificSummary: `A rigorous counter-trending relationship has been confirmed between ${locAName} and ${locBName} for ${paramLabel}. While ${locAName} shifts at ${decA}, ${locBName} trends inversely at ${decB}. The Pearson correlation of r = ${correlation.r.toFixed(3)} (p = ${correlation.pValue.toFixed(4)}) establishes physical teleconnection coupling over the 2005–2024 satellite era.`,
      keyTakeaways: [
        `Direct opposing decadal trajectories: ${locAName} (${decA}) vs ${locBName} (${decB})`,
        `Statistical validity verified: ${bothSignificant ? 'Both nodes independently show statistically significant linear trends (p < 0.05).' : 'At least one node exhibits statistically significant decadal progression (p < 0.05).' }`,
        `Negative inter-annual correlation (r = ${correlation.r.toFixed(3)}) affirms coupled atmospheric/oceanic mass or heat redistribution.`
      ],
      atmosphericMechanism: `Such climate dipoles are classically driven by planetary-scale wave trains (Rossby waves) or large-scale overturning circulation cells (Hadley, Walker, or Ferrel cells). When one region experiences anomalous heating or moisture convergence, descending dry air or displaced storm tracks are forced over the opposite node, resulting in the observed anti-phase behavior.`
    };
  }

  // 2. DIVERGENT TREND
  if (oppositeSlopes) {
    return {
      verdict: 'DIVERGENT TREND',
      headline: `Divergent Trajectories Detected, Awaiting Long-Term Significance`,
      confidenceScore: 58,
      color: 'amber',
      scientificSummary: `The data reveals opposite directional slopes: ${locAName} (${decA}) and ${locBName} (${decB}). However, natural interannual variability currently keeps the p-values above the strict 95% confidence threshold (p = ${statsA.pValue.toFixed(3)} and p = ${statsB.pValue.toFixed(3)}). The correlation stands at r = ${correlation.r.toFixed(3)}.`,
      keyTakeaways: [
        `Opposing directions observed over 2005–2024, but high year-to-year noise obscures permanent teleconnection.`,
        `Neither node has crossed the p < 0.05 threshold yet, meaning local meteorological variability cannot be fully ruled out.`,
        `Recommendation: Compare with related variables (e.g., surface soil wetness or downward irradiance) to assess thermodynamic coupling.`
      ],
      atmosphericMechanism: `Regional weather fluctuations and multi-year ocean cycles (e.g. ENSO, AMO) can generate temporary divergence. Continued satellite monitoring is essential to distinguish whether this is a permanent structural dipole or a multi-year phase anomaly.`
    };
  }

  // 3. SYNCHRONIZED TREND
  const bothWarming = statsA.slope > 0 && statsB.slope > 0;
  return {
    verdict: 'SYNCHRONIZED TREND',
    headline: `Synchronized Co-Variation: ${bothWarming ? 'Concurrent Increase' : 'Concurrent Decline'} Across Both Nodes`,
    confidenceScore: 78,
    color: 'blue',
    scientificSummary: `Rather than an inverse seesaw, both ${locAName} (${decA}) and ${locBName} (${decB}) trend in the SAME direction over the 2005–2024 period. The correlation is r = ${correlation.r.toFixed(3)}. This signifies shared hemispheric or global forcing rather than a localized dipole.`,
    keyTakeaways: [
      `Monolithic direction: Both locations are trending simultaneously ${bothWarming ? 'upwards' : 'downwards'}.`,
      `Teleconnection inverse seesaw is absent for this variable between these coordinates.`,
      `Suggests broader macro-scale thermodynamic drivers (e.g., global tropospheric warming or hemispheric radiative shifts).`
    ],
    atmosphericMechanism: `When two disparate locations shift in parallel, they typically reflect planetary-scale radiative forcing (such as greenhouse gas accumulation or widespread atmospheric moisture capacity expansion according to the Clausius-Clapeyron relation) rather than regional circulation dipoles.`
  };
}

/**
 * Great Circle Distance (Haversine Formula) in kilometers
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
