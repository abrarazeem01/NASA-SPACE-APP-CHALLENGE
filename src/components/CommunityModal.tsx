import React, { useState, useEffect } from 'react';
import {
  CommunityDiscovery,
  fetchCommunityDiscoveries,
  saveCommunityDiscovery,
  upvoteCommunityDiscovery,
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  X,
  ThumbsUp,
  Share2,
  Users,
  Sparkles,
  MapPin,
  CheckCircle2,
  Database,
  Filter,
} from 'lucide-react';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvestigation?: {
    title: string;
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
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  isOpen,
  onClose,
  currentInvestigation,
}) => {
  const [discoveries, setDiscoveries] = useState<CommunityDiscovery[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'submit'>('browse');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Submit form state
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadDiscoveries();
      if (currentInvestigation) {
        setTitle(`${currentInvestigation.locAName} vs ${currentInvestigation.locBName} Seesaw`);
      }
    }
  }, [isOpen, currentInvestigation]);

  const loadDiscoveries = async () => {
    setLoading(true);
    const data = await fetchCommunityDiscoveries();
    setDiscoveries(data);
    setLoading(false);
  };

  const handleUpvote = async (id: string) => {
    const updatedCount = await upvoteCommunityDiscovery(id);
    setDiscoveries(prev =>
      prev.map(item => (item.id === id ? { ...item, upvotes: updatedCount } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvestigation) return;

    setIsSubmitting(true);
    const newEntry = await saveCommunityDiscovery({
      title: title || `${currentInvestigation.locAName} vs ${currentInvestigation.locBName}`,
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
      notes: notes || 'Discovered using NASA Earth Trend Detective.',
      author: author || 'Anonymous Citizen Scientist',
    });

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setDiscoveries(prev => [newEntry, ...prev]);
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('browse');
    }, 1500);
  };

  if (!isOpen) return null;

  const filteredDiscoveries = discoveries.filter(d => {
    if (filterVerdict === 'all') return true;
    return d.verdict === filterVerdict;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-space-900 border border-space-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-space-700/80 flex items-center justify-between bg-space-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-nasa-blue/30 border border-nasa-cyan/40 text-nasa-cyan">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Community Discoveries</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                Citizen Science Teleconnection Log
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-space-800 border border-space-700 font-mono">
                  <Database className="w-2.5 h-2.5 text-nasa-cyan" />
                  {isSupabaseConfigured ? 'Supabase Live Sync' : 'Local Storage Mode'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-space-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 py-2.5 bg-space-950/40 border-b border-space-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'browse'
                  ? 'bg-space-800 text-nasa-cyan border border-nasa-cyan/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Browse Feed ({filteredDiscoveries.length})
            </button>
            {currentInvestigation && (
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'submit'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Publish Current Investigation</span>
              </button>
            )}
          </div>

          {activeTab === 'browse' && (
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterVerdict}
                onChange={e => setFilterVerdict(e.target.value)}
                className="bg-space-900 border border-space-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="all">All Verdicts</option>
                <option value="CONFIRMED INVERSE SEESAW">Confirmed Inverse Seesaws</option>
                <option value="DIVERGENT TREND">Divergent Trends</option>
                <option value="SYNCHRONIZED TREND">Synchronized Trends</option>
              </select>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'browse' && (
            <>
              {loading ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <div className="w-8 h-8 mx-auto border-2 border-nasa-cyan border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs">Loading community observations...</p>
                </div>
              ) : filteredDiscoveries.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm">No discoveries matching this filter yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDiscoveries.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-space-950/70 border border-space-800 hover:border-space-700 transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              item.verdict === 'CONFIRMED INVERSE SEESAW'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : item.verdict === 'DIVERGENT TREND'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            }`}
                          >
                            {item.verdict}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            r = {item.r.toFixed(3)}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm leading-snug">
                          {item.title}
                        </h4>

                        <div className="text-[11px] text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-nasa-cyan"></span>
                            <span className="text-slate-300">{item.loc_a_name}</span>
                            <span className="font-mono text-nasa-cyan">
                              ({item.slope_a_decade >= 0 ? '+' : ''}{item.slope_a_decade.toFixed(2)}/dec)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-nasa-amber"></span>
                            <span className="text-slate-300">{item.loc_b_name}</span>
                            <span className="font-mono text-nasa-amber">
                              ({item.slope_b_decade >= 0 ? '+' : ''}{item.slope_b_decade.toFixed(2)}/dec)
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 bg-space-900/60 p-2.5 rounded-lg border border-space-800 line-clamp-3">
                          {item.notes}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-space-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">By {item.author}</span>
                        <button
                          onClick={() => handleUpvote(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-space-900 hover:bg-space-800 border border-space-700 text-slate-200 hover:text-nasa-cyan transition"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-nasa-cyan" />
                          <span className="font-bold">{item.upvotes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'submit' && currentInvestigation && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-2 text-xs">
                <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Verified Teleconnection Metrics
                </div>
                <div className="font-bold text-white text-sm">
                  {currentInvestigation.locAName} vs {currentInvestigation.locBName}
                </div>
                <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
                  <span>Pearson r: {currentInvestigation.r.toFixed(3)}</span>
                  <span>Verdict: {currentInvestigation.verdict}</span>
                  <span>Confidence: {currentInvestigation.confidenceScore}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discovery Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Walker Circulation Anti-Phase Precipitation Dipole"
                  className="w-full bg-space-950 border border-space-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-nasa-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Citizen Scientist / Team Name
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="e.g. Team Trend Detectives (Space Apps 2026)"
                  className="w-full bg-space-950 border border-space-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-nasa-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scientific Notes & Hypotheses
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe what atmospheric or oceanic mechanisms you believe are causing this trend divergence..."
                  className="w-full bg-space-950 border border-space-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-nasa-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Saving Discovery...'
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Published!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Publish to Community</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
