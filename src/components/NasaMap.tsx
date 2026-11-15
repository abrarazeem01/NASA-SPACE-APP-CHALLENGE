import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  NASA_GIBS_LAYERS,
  NasaGibsLayerConfig,
  getGibsTileUrl,
} from '../services/nasaApi';
import { calculateHaversineDistanceKm } from '../utils/earthStats';
import {
  Calendar,
  Crosshair,
  Play,
  Pause,
  Navigation2,
  ArrowRightLeft,
} from 'lucide-react';

interface LocationPoint {
  lat: number;
  lon: number;
  name: string;
}

interface NasaMapProps {
  locA: LocationPoint;
  locB: LocationPoint;
  onUpdateLocA: (lat: number, lon: number, name?: string) => void;
  onUpdateLocB: (lat: number, lon: number, name?: string) => void;
  activeSelectionMode: 'A' | 'B';
  onChangeSelectionMode: (mode: 'A' | 'B') => void;
  onSwapLocations: () => void;
}

// Swiss Neo-Brutalist SVG Marker Pin Icons
const createSwissMarker = (color: string, label: string, beaconClass: string) => {
  return L.divIcon({
    className: 'custom-swiss-marker',
    html: `
      <div style="position: relative; width: 44px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; cursor: pointer;">
        <!-- Pulsing beacon wave -->
        <div class="${beaconClass}" style="
          position: absolute;
          top: 4px;
          left: 5px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          pointer-events: none;
        "></div>
        
        <!-- High-contrast brutalist square/disc -->
        <div style="
          position: relative;
          z-index: 2;
          width: 32px;
          height: 32px;
          background: #0A0A0A;
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 800;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.9);
        ">
          ${label}
        </div>
        
        <!-- Target pointer needle -->
        <div style="
          position: relative;
          z-index: 1;
          width: 2px;
          height: 12px;
          background: ${color};
        "></div>
        
        <!-- Ground anchor -->
        <div style="
          width: 6px;
          height: 4px;
          background: ${color};
        "></div>
      </div>
    `,
    iconSize: [44, 56],
    iconAnchor: [22, 54],
    popupAnchor: [0, -52],
  });
};

const iconA = createSwissMarker('#FF3B00', 'A', 'beacon-vermilion');
const iconB = createSwissMarker('#F4F3EF', 'B', 'beacon-cream');

// Click listener to pick points on Earth
const MapClickHandler: React.FC<{
  selectionMode: 'A' | 'B';
  onUpdateLocA: (lat: number, lon: number) => void;
  onUpdateLocB: (lat: number, lon: number) => void;
}> = ({ selectionMode, onUpdateLocA, onUpdateLocB }) => {
  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(2));
      const lon = Number(e.latlng.lng.toFixed(2));
      if (selectionMode === 'A') {
        onUpdateLocA(lat, lon);
      } else {
        onUpdateLocB(lat, lon);
      }
    },
  });
  return null;
};

// Auto-pan / fit bounds when locations change
const MapBoundsController: React.FC<{ locA: LocationPoint; locB: LocationPoint }> = ({
  locA,
  locB,
}) => {
  const map = useMap();
  const prevCoords = useRef<string>('');

  useEffect(() => {
    const key = `${locA.lat},${locA.lon},${locB.lat},${locB.lon}`;
    if (prevCoords.current !== key) {
      prevCoords.current = key;
      const bounds = L.latLngBounds([
        [locA.lat, locA.lon],
        [locB.lat, locB.lon],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5, animate: true });
    }
  }, [locA, locB, map]);

  return null;
};

export const NasaMap: React.FC<NasaMapProps> = ({
  locA,
  locB,
  onUpdateLocA,
  onUpdateLocB,
  activeSelectionMode,
  onChangeSelectionMode,
  onSwapLocations,
}) => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);
  const [imageryYear, setImageryYear] = useState<number>(2024);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showOsmBase, setShowOsmBase] = useState<boolean>(false);

  const activeGibsConfig: NasaGibsLayerConfig = NASA_GIBS_LAYERS[selectedLayerIndex];
  const tileUrl = getGibsTileUrl(activeGibsConfig.layerTag, imageryYear);
  const distanceKm = calculateHaversineDistanceKm(locA.lat, locA.lon, locB.lat, locB.lon);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setImageryYear(prev => (prev >= 2024 ? 2005 : prev + 1));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-[580px] lg:h-[680px] bg-[#0A0A0A] border border-white/15 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Map Header Controls */}
      <div className="z-10 bg-[#0A0A0A] px-5 py-3 border-b border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Map Click Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-[#FF3B00]" />
            Target Reticle:
          </span>
          <div className="inline-flex border border-white/20 p-0.5 bg-black">
            <button
              onClick={() => onChangeSelectionMode('A')}
              className={`px-3 py-1 font-mono font-bold uppercase transition flex items-center gap-1.5 ${
                activeSelectionMode === 'A'
                  ? 'bg-[#FF3B00] text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF3B00]"></span>
              Node A
            </button>
            <button
              onClick={() => onChangeSelectionMode('B')}
              className={`px-3 py-1 font-mono font-bold uppercase transition flex items-center gap-1.5 ${
                activeSelectionMode === 'B'
                  ? 'bg-[#F4F3EF] text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F4F3EF]"></span>
              Node B
            </button>
          </div>
        </div>

        {/* Teleconnection Distance */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black border border-white/15 text-white/80 font-mono text-[11px]">
          <Navigation2 className="w-3.5 h-3.5 text-[#FF3B00] rotate-45" />
          <span>GEODESIC ARC:</span>
          <strong className="text-white font-bold">{distanceKm.toLocaleString()} KM</strong>
        </div>

        {/* NASA GIBS Layer Switcher */}
        <div className="flex items-center gap-1 border border-white/15 p-0.5 bg-black">
          {NASA_GIBS_LAYERS.map((layer, idx) => (
            <button
              key={layer.id}
              onClick={() => {
                setSelectedLayerIndex(idx);
                setShowOsmBase(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase transition ${
                selectedLayerIndex === idx && !showOsmBase
                  ? 'bg-[#FF3B00] text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {layer.id === 'true_color' ? 'MODIS TrueColor' : 'MODIS Aerosol'}
            </button>
          ))}
          <button
            onClick={() => setShowOsmBase(!showOsmBase)}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase transition ${
              showOsmBase
                ? 'bg-white text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            OSM Grid
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative flex-1 w-full bg-[#0A0A0A]">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={16}
          worldCopyJump={true}
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          {/* CartoDB Dark Base */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            opacity={showOsmBase ? 1 : 0.35}
            maxZoom={16}
          />

          {/* NASA GIBS WMTS Satellite Tiles */}
          {!showOsmBase && (
            <TileLayer
              key={`${activeGibsConfig.layerTag}-${imageryYear}`}
              url={tileUrl}
              attribution='&copy; <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>'
              tileSize={256}
              maxNativeZoom={9}
              maxZoom={16}
              opacity={0.92}
            />
          )}

          {/* Animated Connecting Geodesic Polyline */}
          <Polyline
            positions={[
              [locA.lat, locA.lon],
              [locB.lat, locB.lon],
            ]}
            className="swiss-teleconnection-dash"
            pathOptions={{
              color: '#FF3B00',
              dashArray: '10, 8',
              weight: 2.5,
              opacity: 0.95,
            }}
          />

          {/* Location A Marker */}
          <Marker position={[locA.lat, locA.lon]} icon={iconA}>
            <Popup>
              <div className="p-1 space-y-1 font-mono text-xs text-white">
                <div className="text-[#FF3B00] font-bold uppercase tracking-wider">
                  NODE A (COORDINATE 1)
                </div>
                <div className="font-bold text-sm font-space">{locA.name}</div>
                <div className="text-white/70">
                  LAT {locA.lat}° // LON {locA.lon}°
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Location B Marker */}
          <Marker position={[locB.lat, locB.lon]} icon={iconB}>
            <Popup>
              <div className="p-1 space-y-1 font-mono text-xs text-white">
                <div className="text-white font-bold uppercase tracking-wider">
                  NODE B (COORDINATE 2)
                </div>
                <div className="font-bold text-sm font-space">{locB.name}</div>
                <div className="text-white/70">
                  LAT {locB.lat}° // LON {locB.lon}°
                </div>
              </div>
            </Popup>
          </Marker>

          <MapClickHandler
            selectionMode={activeSelectionMode}
            onUpdateLocA={onUpdateLocA}
            onUpdateLocB={onUpdateLocB}
          />
          <MapBoundsController locA={locA} locB={locB} />
        </MapContainer>

        {/* Floating Telemetry Badge */}
        <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
          <div className="bg-[#0A0A0A]/95 text-white border border-white/20 px-3.5 py-1.5 font-mono text-[11px] tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3B00] animate-pulse"></span>
            <span>GIBS TILE: {activeGibsConfig.name.split('(')[0]}</span>
          </div>
        </div>
      </div>

      {/* Brutalist Bottom Timeline Year Slider */}
      <div className="z-10 bg-[#0A0A0A] px-5 py-3 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Readouts & Swap Button */}
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          <div className="px-2.5 py-1 bg-black border border-[#FF3B00] text-[#FF3B00] flex items-center gap-1.5">
            <span className="font-bold">A:</span>
            <span>{locA.lat}°, {locA.lon}°</span>
          </div>
          <button
            onClick={onSwapLocations}
            className="p-1.5 bg-black border border-white/20 hover:border-[#FF3B00] text-white transition"
            title="Swap Node A & Node B"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
          <div className="px-2.5 py-1 bg-black border border-white text-white flex items-center gap-1.5">
            <span className="font-bold">B:</span>
            <span>{locB.lat}°, {locB.lon}°</span>
          </div>
        </div>

        {/* Year Slider */}
        <div className="flex items-center gap-3 w-full md:w-1/2 justify-end">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white">
            <Calendar className="w-3.5 h-3.5 text-[#FF3B00]" />
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 bg-black border border-white/20 text-[#FF3B00] hover:bg-[#FF3B00] hover:text-black transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
            <span className="px-2 py-0.5 bg-black border border-white/20 font-bold text-[#FF3B00]">
              {imageryYear}-06-15
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-mono text-white/40">2005</span>
            <input
              type="range"
              min={2005}
              max={2024}
              step={1}
              value={imageryYear}
              onChange={e => {
                setIsPlaying(false);
                setImageryYear(parseInt(e.target.value, 10));
              }}
              className="w-full h-1.5 bg-white/10 rounded-none appearance-none cursor-pointer accent-[#FF3B00] focus:outline-none"
            />
            <span className="text-[10px] font-mono text-white/40">2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};
