/**
 * NASA Data Services
 * Integrates open, zero-authentication NASA APIs:
 * 1. NASA POWER API (Prediction of Worldwide Energy Resources)
 *    Monthly point reanalysis & satellite assimilation (2005-2024)
 * 2. NASA GIBS (Global Imagery Browse Services) WMTS Tile Layers
 */

export interface NasaParameterConfig {
  id: string;
  code: 'T2M' | 'PRECTOTCORR' | 'GWETTOP' | 'ALLSKY_SFC_SW_DWN';
  name: string;
  unit: string;
  shortDescription: string;
  detailedDescription: string;
  typicalDecadalChangeUnit: string;
  chartColorA: string;
  chartColorB: string;
  badgeColor: string;
}

export const NASA_PARAMETERS: NasaParameterConfig[] = [
  {
    id: 'T2M',
    code: 'T2M',
    name: '2-Meter Surface Air Temperature',
    unit: '°C',
    shortDescription: 'Air temperature measured 2 meters above Earth surface',
    detailedDescription: 'Derived from NASA MERRA-2 modern reanalysis, capturing regional warming, cooling amplification, and sensible heat shifts.',
    typicalDecadalChangeUnit: '°C/decade',
    chartColorA: '#00F0FF',
    chartColorB: '#FF5E3A',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'PRECTOTCORR',
    code: 'PRECTOTCORR',
    name: 'Precipitation Corrected',
    unit: 'mm/day',
    shortDescription: 'Bias-corrected daily precipitation rate averaged monthly',
    detailedDescription: 'Combines satellite microwave sounding and ground gauges (GPCP/MERRA-2) to trace monsoon corridors, ITCZ migration, and drought dipoles.',
    typicalDecadalChangeUnit: 'mm/day/decade',
    chartColorA: '#00F0FF',
    chartColorB: '#FF5E3A',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'GWETTOP',
    code: 'GWETTOP',
    name: 'Surface Soil Wetness Fraction',
    unit: 'fraction (0–1)',
    shortDescription: 'Fraction of moisture content in top 5cm soil profile',
    detailedDescription: 'NASA Land Information System (LIS) assimilation measuring surface saturation, vegetative stress, and desertification boundary shifts.',
    typicalDecadalChangeUnit: 'fraction/decade',
    chartColorA: '#2DD4BF',
    chartColorB: '#FB923C',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'ALLSKY_SFC_SW_DWN',
    code: 'ALLSKY_SFC_SW_DWN',
    name: 'All-Sky Downward Solar Irradiance',
    unit: 'kW·h/m²/day',
    shortDescription: 'Total shortwave solar radiation reaching Earth surface',
    detailedDescription: 'NASA FLASHFlux and CERES satellite missions measuring solar energy flux through varying cloud covers, aerosols, and atmospheric opacity.',
    typicalDecadalChangeUnit: 'kW·h/m²/day/decade',
    chartColorA: '#818CF8',
    chartColorB: '#F43F5E',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
];

export interface AnnualDataPoint {
  year: number;
  value: number;
  validMonthsCount: number;
}

export interface LocationObservationResult {
  latitude: number;
  longitude: number;
  parameter: string;
  annualSeries: AnnualDataPoint[];
  years: number[];
  values: number[];
  rawDataSummary: {
    startYear: number;
    endYear: number;
    totalMonthsProcessed: number;
    elevationApprox?: number;
  };
}

// In-memory cache to prevent re-fetching the exact same coordinates and parameters
const apiCache = new Map<string, LocationObservationResult>();

/**
 * Fetch 2005-2024 annual time-series from NASA POWER API
 * Endpoint: https://power.larc.nasa.gov/api/temporal/monthly/point
 */
export async function fetchNasaPowerAnnualData(
  lat: number,
  lon: number,
  parameterCode: string,
  startYear: number = 2005,
  endYear: number = 2024
): Promise<LocationObservationResult> {
  // Validate coordinates
  const cleanLat = Number(Math.max(-90, Math.min(90, lat)).toFixed(4));
  const cleanLon = Number(Math.max(-180, Math.min(180, lon)).toFixed(4));

  const cacheKey = `${cleanLat}_${cleanLon}_${parameterCode}_${startYear}_${endYear}`;
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey)!;
  }

  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameterCode}&community=RE&longitude=${cleanLon}&latitude=${cleanLat}&start=${startYear}&end=${endYear}&format=JSON`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`NASA POWER API HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    const paramData = json?.properties?.parameter?.[parameterCode];
    if (!paramData || typeof paramData !== 'object') {
      throw new Error(`NASA POWER API did not return data for parameter '${parameterCode}'.`);
    }

    // Process monthly keys (YYYYMM)
    // CRITICAL: Filter out key ending in "13" (NASA POWER's annual summary)
    // and filter out -999 sentinel missing values.
    const yearMonthMap = new Map<number, number[]>();

    for (let yr = startYear; yr <= endYear; yr++) {
      yearMonthMap.set(yr, []);
    }

    let processedMonths = 0;

    for (const [key, rawVal] of Object.entries(paramData)) {
      if (key.length !== 6) continue;
      const monthStr = key.slice(4, 6);
      const year = parseInt(key.slice(0, 4), 10);

      // Rule: Ignore month 13
      if (monthStr === '13') continue;

      const numVal = Number(rawVal);
      // Rule: Filter out -999 sentinel values
      if (isNaN(numVal) || numVal === -999 || numVal < -900) continue;

      if (yearMonthMap.has(year)) {
        yearMonthMap.get(year)!.push(numVal);
        processedMonths++;
      }
    }

    const annualSeries: AnnualDataPoint[] = [];

    // Aggregate valid monthly values into annual means
    for (let yr = startYear; yr <= endYear; yr++) {
      const monthValues = yearMonthMap.get(yr) || [];
      if (monthValues.length > 0) {
        const mean = monthValues.reduce((sum, v) => sum + v, 0) / monthValues.length;
        annualSeries.push({
          year: yr,
          value: Number(mean.toFixed(4)),
          validMonthsCount: monthValues.length,
        });
      }
    }

    if (annualSeries.length === 0) {
      throw new Error(`No valid data returned by NASA POWER for lat: ${cleanLat}, lon: ${cleanLon}.`);
    }

    const result: LocationObservationResult = {
      latitude: cleanLat,
      longitude: cleanLon,
      parameter: parameterCode,
      annualSeries,
      years: annualSeries.map(d => d.year),
      values: annualSeries.map(d => d.value),
      rawDataSummary: {
        startYear,
        endYear,
        totalMonthsProcessed: processedMonths,
        elevationApprox: json?.geometry?.coordinates?.[2],
      },
    };

    apiCache.set(cacheKey, result);
    return result;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('NASA POWER API request timed out (25s). Please check your internet connection and try again.');
      }
      throw err;
    }
    throw new Error('An unknown error occurred while querying NASA POWER API.');
  }
}

/**
 * NASA GIBS WMTS Tile Configuration
 */
export interface NasaGibsLayerConfig {
  id: string;
  name: string;
  layerTag: string;
  format: string;
  tileMatrixSet: string;
  description: string;
}

export const NASA_GIBS_LAYERS: NasaGibsLayerConfig[] = [
  {
    id: 'true_color',
    name: 'MODIS Terra True Color (Corrected Reflectance)',
    layerTag: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    format: 'jpg',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    description: 'Natural visible light color view of clouds, land, ocean, and ice sheets.',
  },
  {
    id: 'aerosol',
    name: 'MODIS Terra Aerosol Optical Depth (AOD)',
    layerTag: 'MODIS_Terra_Aerosol',
    format: 'jpg',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    description: 'Optical thickness of dust plumes, wildfire smoke, and anthropogenic air pollution particles.',
  },
];

/**
 * Generate NASA GIBS Tile URL template for Leaflet
 */
export function getGibsTileUrl(layerTag: string, year: number): string {
  // Use mid-year imagery (June 15th) for clean snow/vegetation/cloud comparison across years
  const dateStr = `${year}-06-15`;
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerTag}/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
}
