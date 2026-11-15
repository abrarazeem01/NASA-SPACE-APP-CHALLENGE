import React, { useState, useEffect } from 'react';
import {
  CommunityDiscovery,
  fetchCommunityDiscoveries,
  saveCommunityDiscovery,
  upvoteCommunityDiscovery,
} from '../lib/supabase';
import {
  ArrowUpRight,
  CheckCircle2,
  Plus,
  X,
  Share2,
} from 'lucide-react';

interface DiscoveryBoardProps {
  currentInvestigation?: {
    variable: string;
    variableName: string;
    locAName: string;
    locALat: number;
    locALon: number;
    locBName: string;
    locBLat: number;
    locBLon: number;
    slopeADecade: number;
    slopeBDecade: number;
    pValueA: number;
    pValueB: number;
    r: number;
    verdict: string;
    confidenceScore: number;
  };
  onLoadDiscovery: (discovery: CommunityDiscovery) => void;
  isPublishModalOpen?: boolean;
  onClosePublishModal?: () => void;
}

export const DiscoveryBoard: React.FC<DiscoveryBoardProps> = ({
  currentInvestigation,
  onLoadDiscovery,
  isPublishModalOpen,
  onClosePublishModal,
}) => {
  const [discoveries, setDiscoveries] = useState<CommunityDiscovery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState<boolean>(false);

  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  const drawerVisible = isPublishModalOpen !== undefined ? isPublishModalOpen : internalDrawerOpen;
  const closeDrawer = onClosePublishModal || (() => setInternalDrawerOpen(false));

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const loadDiscoveries = async () => {
    setLoading(true);
    const data = await fetchCommunityDiscoveries();
    setDiscoveries(data);
    setLoading(false);
  };

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCount = await upvoteCommunityDiscovery(id);
    setDiscoveries(prev =>
      prev.map(d => (d.id === id ? { ...d, upvotes: updatedCount } : d))
    );
  };

  const handleSubmitDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvestigation) return;

    setIsSubmitting(true);
    try {
      const saved = await saveCommunityDiscovery({
        title: formTitle || `${currentInvestigation.locAName} vs. ${currentInvestigation.locBName} Seesaw`,
        variable: currentInvestigation.variable,
        variable_name: currentInvestigation.variableName,
        loc_a_name: currentInvestigation.locAName,
        loc_a_lat: currentInvestigation.locALat,
        loc_a_lon: currentInvestigation.locALon,
        loc_b_name: currentInvestigation.locBName,
        loc_b_lat: currentInvestigation.locBLat,
        loc_b_lon: currentInvestigation.locBLon,
        slope_a_decade: currentInvestigation.slopeADecade,
        slope_b_decade: currentInvestigation.slopeBDecade,
        p_value_a: currentInvestigation.pValueA,
        p_value_b: currentInvestigation.pValueB,
        r: currentInvestigation.r,
        verdict: currentInvestigation.verdict,
        confidence_score: currentInvestigation.confidenceScore,
        notes: formNotes || 'Discovered using NASA Earth Trend Detective telemetry.',
        author: formAuthor || 'Citizen Scientist',
      });

      setPublishSuccess(true);
      setDiscoveries(prev => [saved, ...prev]);
      setTimeout(() => {
        setPublishSuccess(false);
        closeDrawer();
        setFormTitle('');
        setFormNotes('');
      }, 1200);
    } catch (err) {
      console.error('Failed to publish discovery:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-[#0A0A0A] font-sans">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b-2 border-[#0A0A0A] pb-6 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B00] font-bold">
            03 // TELECONNECTION ARCHIVE
          </span>
          <h2 className="text-4xl sm:text-6xl font-syne font-black tracking-tight text-[#0A0A0A] uppercase mt-1">
            COMMUNITY INDEX
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase px-3 py-1 border border-[#0A0A0A]">
            TOTAL ENTRIES: {discoveries.length.toString().padStart(2, '0')}
          </span>
          {currentInvestigation && (
            <button
              onClick={() => {
                setFormTitle(`${currentInvestigation.locAName} vs. ${currentInvestigation.locBName}`);
                if (onClosePublishModal) {
                  // External control handled by parent
                } else {
                  setInternalDrawerOpen(true);
                }
              }}
              className="px-4 py-2 bg-[#FF3B00] hover:bg-[#0A0A0A] text-white hover:text-[#F4F3EF] font-space font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>LOG ANOMALY</span>
            </button>
          )}
        </div>
      </div>

      {/* Numbered Editorial Index List */}
      <div className="mt-8 divide-y divide-[#0A0A0A]/20 border-b border-[#0A0A0A]/20">
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#0A0A0A]/50">
            LOADING COMMUNITY ARCHIVE...
          </div>
        ) : discoveries.length === 0 ? (
          <div className="py-20 text-center font-mono text-xs text-[#0A0A0A]/50">
            NO ARCHIVED DISCOVERIES YET.
          </div>
        ) : (
          discoveries.map((item, index) => {
            const isHovered = activeHoverId === item.id;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveHoverId(item.id)}
                onMouseLeave={() => setActiveHoverId(null)}
                className={`py-5 transition-colors duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-4 px-3 ${
                  isHovered ? 'bg-[#0A0A0A] text-[#F4F3EF]' : 'bg-transparent text-[#0A0A0A]'
                }`}
              >
                {/* Left: Index & Title */}
                <div className="flex items-start md:items-center gap-4">
                  <span className={`font-mono font-bold text-lg ${isHovered ? 'text-[#FF3B00]' : 'text-[#0A0A0A]/40'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-syne font-bold text-lg sm:text-xl tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 font-mono text-xs opacity-70 mt-1">
                      <span>{item.loc_a_name.split('(')[0]} VS {item.loc_b_name.split('(')[0]}</span>
                      <span>•</span>
                      <span>{item.variable}</span>
                      <span>•</span>
                      <span>BY {item.author}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Telemetry Readout & Actions */}
                <div className="flex items-center gap-4 self-end md:self-auto font-mono text-xs">
                  {/* Slopes preview */}
                  <div className="hidden lg:flex items-center gap-3">
                    <span className={isHovered ? 'text-[#FF3B00]' : 'text-[#FF3B00]'}>
                      A: {Number(item.slope_a_decade) >= 0 ? '+' : ''}{Number(item.slope_a_decade).toFixed(2)}/d
                    </span>
                    <span>/</span>
                    <span className={isHovered ? 'text-white' : 'text-black'}>
                      B: {Number(item.slope_b_decade) >= 0 ? '+' : ''}{Number(item.slope_b_decade).toFixed(2)}/d
                    </span>
                    <span>/</span>
                    <span className="font-bold">r = {Number(item.r).toFixed(2)}</span>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={(e) => handleUpvote(item.id, e)}
                    className={`px-3 py-1.5 border font-mono font-bold transition flex items-center gap-1.5 ${
                      isHovered
                        ? 'border-white/30 text-white hover:border-[#FF3B00] hover:text-[#FF3B00]'
                        : 'border-[#0A0A0A]/30 text-[#0A0A0A] hover:border-[#FF3B00] hover:text-[#FF3B00]'
                    }`}
                  >
                    <span>UPVOTE [ +{item.upvotes} ]</span>
                  </button>

                  {/* Load on Map Button */}
                  <button
                    onClick={() => onLoadDiscovery(item)}
                    className="px-3.5 py-1.5 bg-[#FF3B00] text-black font-space font-bold transition hover:bg-white flex items-center gap-1"
                  >
                    <span>LOAD ON MAP</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Finding Drawer / Modal */}
      {drawerVisible && currentInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#F4F3EF] border-2 border-[#0A0A0A] p-6 space-y-4 font-sans text-[#0A0A0A] shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#FF3B00] font-bold uppercase tracking-wider">
                  DISCOVERY SUBMISSION
                </span>
                <h4 className="font-syne font-black text-xl uppercase">
                  LOG ANOMALY TO ARCHIVE
                </h4>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1 hover:bg-[#0A0A0A] hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick telemetry summary */}
            <div className="p-3 bg-white border border-[#0A0A0A]/30 font-mono text-xs space-y-1">
              <div className="text-[#0A0A0A]/60">TARGET DIVERGENCE:</div>
              <div className="font-bold text-sm">
                {currentInvestigation.locAName} vs. {currentInvestigation.locBName}
              </div>
              <div className="flex items-center gap-4 pt-1 text-[11px] font-bold">
                <span className="text-[#FF3B00]">PARAM: {currentInvestigation.variable}</span>
                <span>PEARSON r: {currentInvestigation.r.toFixed(3)}</span>
                <span className="text-[#FF3B00]">p &lt; 0.05</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitDiscovery} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono font-bold uppercase mb-1">
                  Anomaly Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Indo-Gangetic Plain vs East African Low-Level Jet"
                  className="w-full bg-white border-2 border-[#0A0A0A] px-3 py-2 font-space text-sm focus:outline-none focus:border-[#FF3B00]"
                />
              </div>

              <div>
                <label className="block font-mono font-bold uppercase mb-1">
                  Researcher / Team Name
                </label>
                <input
                  type="text"
                  required
                  value={formAuthor}
                  onChange={e => setFormAuthor(e.target.value)}
                  placeholder="e.g. Team Teleconnection (Space Apps 2026)"
                  className="w-full bg-white border-2 border-[#0A0A0A] px-3 py-2 font-space text-sm focus:outline-none focus:border-[#FF3B00]"
                />
              </div>

              <div>
                <label className="block font-mono font-bold uppercase mb-1">
                  Physical Mechanism / Hypothesis
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Describe the planetary wave train or Hadley/Walker cell shift..."
                  className="w-full bg-white border-2 border-[#0A0A0A] px-3 py-2 font-space text-sm focus:outline-none focus:border-[#FF3B00]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-[#0A0A0A]">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-2 border-2 border-[#0A0A0A] font-mono font-bold uppercase hover:bg-black hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#FF3B00] hover:bg-black text-white font-space font-bold uppercase tracking-wider transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'COMMITTING...'
                  ) : publishSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COMMITTED!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>COMMIT TO ARCHIVE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
