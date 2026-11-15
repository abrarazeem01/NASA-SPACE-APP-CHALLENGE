/**
 * Curated Real-World Climate Dipoles & Teleconnections
 * Built for the NASA Space Apps Challenge: "Be An Earth System Trend Detective!"
 */

export interface ClimateDipolePreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'Hydrological' | 'Terrestrial' | 'Cryospheric' | 'Radiative' | 'Oceanic' | 'Atmospheric';
  recommendedParameter: 'T2M' | 'PRECTOTCORR' | 'GWETTOP' | 'ALLSKY_SFC_SW_DWN';
  locA: {
    name: string;
    label: string;
    lat: number;
    lon: number;
    country: string;
  };
  locB: {
    name: string;
    label: string;
    lat: number;
    lon: number;
    country: string;
  };
  scientificDescription: string;
  phenomenonMechanism: string;
  expectedTeleconnection: string;
  nasaMissionContext: string;
}

export const CLIMATE_DIPOLE_PRESETS: ClimateDipolePreset[] = [
  {
    id: 'indus_horn_africa',
    name: 'Indus Basin vs. Horn of Africa',
    subtitle: 'Lahore (Indus Monsoon) vs. Mogadishu (Somali Jet & IOD)',
    category: 'Hydrological',
    recommendedParameter: 'PRECTOTCORR',
    locA: {
      name: 'Indus Basin (Lahore)',
      label: 'Indus Monsoon Basin',
      lat: 31.52,
      lon: 74.35,
      country: 'Pakistan',
    },
    locB: {
      name: 'Horn of Africa (Mogadishu)',
      label: 'Horn of Africa Node',
      lat: 2.04,
      lon: 45.31,
      country: 'Somalia',
    },
    scientificDescription: 'Monsoon depression systems traversing the Indo-Gangetic plain often balance moisture transport against equatorial East African low-level jet advection, displaying strong interannual precipitation anti-phase behavior.',
    phenomenonMechanism: 'Enhanced heating over the Tibetan Plateau intensifies South Asian summer monsoonal rainfall while inducing strong descending dry motion and wind shear across the Greater Horn of Africa.',
    expectedTeleconnection: 'Inverse precipitation anomalies: heavy monsoonal deluge and flooding in the Indus corridor contrast with prolonged severe drought across East Africa.',
    nasaMissionContext: 'NASA GPM (Global Precipitation Measurement) constellation and MERRA-2 precipitation reanalysis.',
  },
  {
    id: 'california_northeast',
    name: 'California Megadrought vs. US Northeast Wetting',
    subtitle: 'Central Valley (Fresno) vs. Hudson Valley (Albany)',
    category: 'Terrestrial',
    recommendedParameter: 'GWETTOP',
    locA: {
      name: 'California Central Valley (Fresno)',
      label: 'US Southwest Desiccation Node',
      lat: 36.73,
      lon: -119.78,
      country: 'United States',
    },
    locB: {
      name: 'US Northeast (Albany)',
      label: 'Northeast Pluvial Node',
      lat: 42.65,
      lon: -73.75,
      country: 'United States',
    },
    scientificDescription: 'The 2005–2024 North American dipole features historic aridification across the American West while the Northeast experiences heightened soil saturation and atmospheric river convergence.',
    phenomenonMechanism: 'Persistent high-pressure ridge blocking in the Northeast Pacific ("Ridiculously Resilient Ridge") deflects Pacific storm tracks northward and eastward, dumping excess precipitation over New York and New England.',
    expectedTeleconnection: 'Strong inverse slope in surface soil wetness fraction: sharp downward trajectory in California vs. steady upward moistening in New York.',
    nasaMissionContext: 'NASA SMAP (Soil Moisture Active Passive) and GRACE-FO terrestrial hydrology tracking.',
  },
  {
    id: 'arctic_central_asia',
    name: 'Arctic Amplification vs. Central Asian Cooling',
    subtitle: 'Svalbard High Arctic vs. Kazakh Steppe (Astana)',
    category: 'Cryospheric',
    recommendedParameter: 'T2M',
    locA: {
      name: 'High Arctic (Svalbard)',
      label: 'Barents Sea Amplification Node',
      lat: 78.22,
      lon: 15.62,
      country: 'Norway / Svalbard',
    },
    locB: {
      name: 'Central Asian Steppe (Astana)',
      label: 'Siberian-Eurasian Cold Node',
      lat: 51.16,
      lon: 71.47,
      country: 'Kazakhstan',
    },
    scientificDescription: 'As Arctic sea ice retreats and open water warms the lower troposphere ("Warm Arctic"), the polar vortex destabilizes, causing cold polar air to plunge deep into Central Asia ("Cold Eurasia").',
    phenomenonMechanism: 'Loss of sea ice in the Barents-Kara Sea excites stationary planetary wave trains, strengthening the Siberian High and driving severe cold anomalies across continental Eurasia.',
    expectedTeleconnection: 'Dramatic positive warming slope (+1.2°C/decade) in Svalbard vs. muted or cooling trends in Central Asia.',
    nasaMissionContext: 'NASA ICESat-2, MODIS land surface temperature, and AIRS atmospheric sounder.',
  },
  {
    id: 'atacama_amazon',
    name: 'Atacama Solar Surge vs. Amazon Cloud Cover',
    subtitle: 'Atacama Desert (Calama) vs. Central Amazon (Manaus)',
    category: 'Radiative',
    recommendedParameter: 'ALLSKY_SFC_SW_DWN',
    locA: {
      name: 'Atacama Desert (Calama)',
      label: 'Hyper-Arid Radiation Peak',
      lat: -22.45,
      lon: -68.92,
      country: 'Chile',
    },
    locB: {
      name: 'Central Amazon Basin (Manaus)',
      label: 'Deep Convective Cloud Basin',
      lat: -3.11,
      lon: -60.02,
      country: 'Brazil',
    },
    scientificDescription: 'The Andes mountain barrier separates the hyper-arid Atacama plateau from the dense convective cloud canopy of the Amazon basin, creating a solar irradiance seesaw.',
    phenomenonMechanism: 'Shifts in the South American Monsoon System modulate deep convective anvil cloud cover over the rainforest, inversely altering downward shortwave flux between the sunny desert plateau and cloudy rainforest.',
    expectedTeleconnection: 'Opposing trends in downward shortwave solar flux (kW·h/m²/day): high solar insolation surge over Atacama contrasts with cloud albedo changes over Manaus.',
    nasaMissionContext: 'NASA CERES and FLASHFlux radiative energy budget missions.',
  },
  {
    id: 'enso_pacific',
    name: 'El Niño-Southern Oscillation (ENSO) Seesaw',
    subtitle: 'Eastern Equatorial Pacific vs. Indo-Pacific Warm Pool',
    category: 'Oceanic',
    recommendedParameter: 'PRECTOTCORR',
    locA: {
      name: 'Eastern Tropical Pacific (Niño 3.4)',
      label: 'East Pacific Warm Tongue',
      lat: -0.85,
      lon: -91.0,
      country: 'Ecuador / High Seas',
    },
    locB: {
      name: 'Western Equatorial Pacific (Papua New Guinea)',
      label: 'Indo-Pacific Warm Pool',
      lat: -3.5,
      lon: 143.6,
      country: 'Papua New Guinea',
    },
    scientificDescription: 'The Walker Circulation acts as an atmospheric conveyor belt across the equatorial Pacific. During phase shifts, convective rainfall migrates eastward towards the Americas, leaving the maritime continent desiccated.',
    phenomenonMechanism: 'Trade wind relaxation displaces the warmest ocean surface water eastward, driving deep atmospheric convection over the East Pacific while subsiding dry air suppresses precipitation over Indonesia.',
    expectedTeleconnection: 'Precipitation exhibits marked anti-phase swings: positive anomalies in the East Pacific coincide with severe droughts and fires across Australasia.',
    nasaMissionContext: 'Monitored continuously by NASA TRMM, GPM, and MODIS cloud properties.',
  },
  {
    id: 'sahel_mediterranean',
    name: 'Sahel Wetting vs. Mediterranean Aridification',
    subtitle: 'Sub-Saharan Monsoonal Sahel vs. Iberian Peninsula',
    category: 'Hydrological',
    recommendedParameter: 'GWETTOP',
    locA: {
      name: 'Central Sahel (Niamey / Niger Basin)',
      label: 'Sahelian Monsoon Corridor',
      lat: 13.51,
      lon: 2.12,
      country: 'Niger',
    },
    locB: {
      name: 'Western Mediterranean (Valencia / Iberian Basin)',
      label: 'Iberian Mediterranean Coast',
      lat: 39.46,
      lon: -0.37,
      country: 'Spain',
    },
    scientificDescription: 'Northward migration of the West African Monsoon has brought a slight greening and soil moisture recovery to parts of the Sahel, while the Mediterranean basin suffers expanding subtropical desiccation.',
    phenomenonMechanism: 'Poleward expansion of the Northern Hemisphere Hadley Cell pushes dry subtropical subsidence zones directly over Southern Europe while enhancing low-level monsoonal moisture advection into the Sahel.',
    expectedTeleconnection: 'Surface soil wetness (GWETTOP) and precipitation display an inverse decadal gradient.',
    nasaMissionContext: 'NASA SMAP and GRACE-FO terrestrial water storage tracking.',
  },
];
