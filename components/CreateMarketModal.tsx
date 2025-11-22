
import React, { useState } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { generateMarketDetails, analyzeVirality } from '../services/geminiService';
import { Market, AnalysisResult, Tweet, MetricData, MetricType } from '../types';
import { X, Twitter, Sparkles, Zap, CheckCircle, AlertCircle, Users, TrendingUp, Rocket, Skull, Target, BarChart3 } from 'lucide-react';
import { TweetDisplay } from './TweetDisplay';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMarket: (market: Market) => void;
}

type PredictionTier = 'NORMAL' | 'VIRAL' | 'MEGA' | 'GLOBAL';

interface TierConfig {
  id: PredictionTier;
  label: string;
  multiplier: number;
  color: string;
  icon: React.ReactNode;
  desc: string;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onCreateMarket }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tweetLink, setTweetLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PredictionTier>('VIRAL');
  
  // Mock Account Stats
  const [authorStats, setAuthorStats] = useState<{ handle: string; followers: number; avatar: string } | null>(null);

  const [draft, setDraft] = useState<{
    title: string;
    description: string;
    category: any;
    tweet: Tweet;
    analysis: AnalysisResult;
  } | null>(null);

  if (!isOpen) return null;

  const extractTweetInfo = (url: string) => {
    const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/);
    return match ? { handle: match[1], id: match[2] } : null;
  };

  // Simulate fetching user stats based on handle
  const fetchMockUserStats = (handle: string) => {
    const isElon = handle.toLowerCase().includes('elon');
    const isWhale = handle.toLowerCase().includes('whale') || handle.toLowerCase().includes('crypto');
    
    if (isElon) return { handle, followers: 180000000, avatar: "https://picsum.photos/seed/elon/100/100" };
    if (isWhale) return { handle, followers: 250000, avatar: "https://picsum.photos/seed/whale/100/100" };
    
    // Random normie to micro-influencer
    return { 
        handle, 
        followers: Math.floor(Math.random() * 5000) + 200,
        avatar: `https://picsum.photos/seed/${handle}/100/100`
    };
  };

  const handleAnalyze = async () => {
    if (!tweetLink.trim()) return;
    setError(null);
    setLoading(true);

    const info = extractTweetInfo(tweetLink);
    if (!info) {
        // Fallback for testing if url isn't perfect
        const fallbackHandle = "unknown_user";
        const stats = fetchMockUserStats(fallbackHandle);
        setAuthorStats(stats);
    } else {
        const stats = fetchMockUserStats(info.handle);
        setAuthorStats(stats);
    }

    // Simulate extracting text
    const simulatedTweetContent = tweetLink.length > 20 
      ? `Simulated content for ${tweetLink}. This is a test tweet content that the AI will analyze.` 
      : tweetLink;

    // Mock the tweet object
    const mockTweet: Tweet = {
        authorName: info ? info.handle : "Unknown",
        authorHandle: info ? info.handle : "unknown",
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
        content: simulatedTweetContent,
        timestamp: "Just now",
        tweetId: info ? info.id : '12345',
    };

    try {
        const [details, analysis] = await Promise.all([
            generateMarketDetails(simulatedTweetContent),
            analyzeVirality(simulatedTweetContent) // Note: In real app, pass follower count to AI context
        ]);
        setDraft({ ...details, tweet: mockTweet, analysis });
        setStep(2);
    } catch (e) {
        setError("AI FAILED. TRY AGAIN.");
    } finally {
        setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const getTierOptions = (followers: number): TierConfig[] => {
    // Logic: Smaller accounts have higher multiplier potential
    const isWhale = followers > 100000;

    if (isWhale) {
        return [
            { id: 'NORMAL', label: '1.5x TREND', multiplier: 1.5, color: 'bg-green-200', icon: <TrendingUp size={16}/>, desc: "Slightly above avg" },
            { id: 'VIRAL', label: '3x HOT', multiplier: 3, color: 'bg-banger-yellow', icon: <Zap size={16}/>, desc: "Solid viral hit" },
            { id: 'MEGA', label: '5x MOON', multiplier: 5, color: 'bg-banger-pink', icon: <Rocket size={16}/>, desc: "Main character energy" },
            { id: 'GLOBAL', label: '10x GOD', multiplier: 10, color: 'bg-red-500 text-white', icon: <Skull size={16}/>, desc: "Internet breaking" },
        ];
    }
    
    return [
        { id: 'NORMAL', label: '5x GEM', multiplier: 5, color: 'bg-green-200', icon: <TrendingUp size={16}/>, desc: "Good engagement" },
        { id: 'VIRAL', label: '20x PUMP', multiplier: 20, color: 'bg-banger-yellow', icon: <Zap size={16}/>, desc: "Viral breakout" },
        { id: 'MEGA', label: '100x MOON', multiplier: 100, color: 'bg-banger-pink', icon: <Rocket size={16}/>, desc: "Career changing" },
        { id: 'GLOBAL', label: '500x GOD', multiplier: 500, color: 'bg-red-500 text-white', icon: <Skull size={16}/>, desc: "Legendary status" },
    ];
  };

  const handlePayment = () => {
    if (!draft || !authorStats) return;
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      
      const tiers = getTierOptions(authorStats.followers);
      const selectedConfig = tiers.find(t => t.id === selectedTier) || tiers[1];
      const multiplier = selectedConfig.multiplier;

      // BASELINE CALCULATION (Simple Heuristic)
      const viewTarget = Math.floor(authorStats.followers * 0.5 * multiplier);
      const rtTarget = Math.floor(authorStats.followers * 0.01 * multiplier);
      const likeTarget = Math.floor(authorStats.followers * 0.05 * multiplier);
      const commentTarget = Math.floor(authorStats.followers * 0.005 * multiplier);

      const metrics: Record<MetricType, MetricData> = {
          VIEWS: { target: Math.max(1000, viewTarget), ticketPrice: 10, ticketsSold: 0, vaultValue: 0, progress: 0 },
          RETWEETS: { target: Math.max(10, rtTarget), ticketPrice: 10, ticketsSold: 0, vaultValue: 0, progress: 0 },
          LIKES: { target: Math.max(50, likeTarget), ticketPrice: 10, ticketsSold: 0, vaultValue: 0, progress: 0 },
          COMMENTS: { target: Math.max(5, commentTarget), ticketPrice: 10, ticketsSold: 0, vaultValue: 0, progress: 0 }
      };

      const newMarket: Market = {
        id: Math.random().toString(36).substr(2, 9),
        title: draft.title,
        description: draft.description,
        tweet: {
            ...draft.tweet,
            authorHandle: authorStats.handle, // Ensure handle is sync
            avatarUrl: authorStats.avatar
        },
        volume: "0",
        endDate: "24h",
        category: draft.category,
        isHot: true,
        featuredMetric: 'VIEWS',
        metrics: metrics
      };
      
      setTimeout(() => {
         onCreateMarket(newMarket);
         // Reset
         setStep(1);
         setTweetLink('');
         setDraft(null);
         setAuthorStats(null);
         setError(null);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-banger-yellow p-4 border-b-4 border-black dark:border-white flex justify-between items-center text-black">
          <h2 className="font-display text-2xl uppercase">Spot Alpha</h2>
          <button onClick={onClose}>
            <X size={24} className="hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* STEP 1: INPUT */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-100 dark:bg-zinc-800 p-4 border-2 border-black dark:border-white flex items-start gap-3">
                <BarChart3 className="text-black dark:text-white flex-shrink-0 mt-1" />
                <div className="text-sm text-black dark:text-white space-y-1">
                    <p className="font-mono font-bold uppercase">Predict The Future</p>
                    <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        Paste a tweet. We calculate the baseline. You set the prediction target.
                        If the tweet hits your target, the market resolves to yes.
                    </p>
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-sm block mb-2 uppercase dark:text-white">Paste Tweet Link</label>
                <div className="relative">
                    <input
                    type="text"
                    value={tweetLink}
                    onChange={(e) => setTweetLink(e.target.value)}
                    placeholder="https://x.com/..."
                    className="w-full border-4 border-black dark:border-white p-4 font-mono text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccff00] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-shadow dark:bg-zinc-950 dark:text-white"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Twitter size={20} />
                    </div>
                </div>
              </div>

              <BrutalistButton 
                onClick={handleAnalyze} 
                disabled={loading || !tweetLink}
                className="w-full flex justify-center items-center gap-2"
              >
                {loading ? "ANALYZING DATA..." : "SCAN TWEET"} <Sparkles size={18} />
              </BrutalistButton>
            </div>
          )}

          {/* STEP 2: PREVIEW & CONFIG */}
          {step === 2 && draft && authorStats && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              
              {/* Account Stats Banner */}
              <div className="flex items-center justify-between bg-black dark:bg-white text-white dark:text-black p-3 border-2 border-black dark:border-white">
                 <div className="flex items-center gap-2">
                    <img src={authorStats.avatar} className="w-8 h-8 rounded-full border border-white dark:border-black" alt="avatar"/>
                    <div className="leading-none">
                        <div className="font-bold font-mono text-sm">@{authorStats.handle}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-600 uppercase">Analyzed</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="font-display text-xl text-banger-yellow dark:text-black">{formatNumber(authorStats.followers)}</div>
                    <div className="text-[9px] text-gray-400 dark:text-gray-600 uppercase font-mono">Followers</div>
                 </div>
              </div>

              <div className="border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-900 p-2 opacity-80 scale-95 origin-top">
                  <TweetDisplay tweet={draft.tweet} compact={true} />
              </div>

              {/* Multiplier Selection */}
              <div>
                 <label className="font-mono font-bold text-sm block mb-2 uppercase dark:text-white">Set Prediction Target</label>
                 <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mb-3">
                    Higher targets = Higher difficulty = Higher potential payouts.
                 </p>
                 <div className="grid grid-cols-2 gap-3">
                    {getTierOptions(authorStats.followers).map(tier => (
                        <button
                            key={tier.id}
                            onClick={() => setSelectedTier(tier.id)}
                            className={`
                                relative p-3 border-2 border-black dark:border-white text-left transition-all
                                ${selectedTier === tier.id 
                                    ? `${tier.color} shadow-hard-sm dark:shadow-hard-sm-white -translate-y-1 text-black` 
                                    : 'bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-display text-lg uppercase">{tier.label}</span>
                                {tier.icon}
                            </div>
                            <div className="font-mono text-[10px] uppercase font-bold mb-1 opacity-70">Target Views:</div>
                            <div className="font-display text-2xl leading-none">
                                {formatNumber(Math.floor(authorStats.followers * 0.5 * tier.multiplier))}
                            </div>
                        </button>
                    ))}
                 </div>
              </div>

              <div className="bg-gray-100 dark:bg-zinc-800 p-3 border-2 border-black dark:border-white text-center">
                <div className="font-mono text-xs text-gray-500 dark:text-gray-400 uppercase">Market Creation Fee</div>
                <div className="font-display text-xl text-banger-purple">0.05 SOL</div>
              </div>

              <BrutalistButton 
                onClick={handlePayment} 
                disabled={loading}
                className="w-full flex justify-center items-center gap-2"
                variant="secondary"
              >
                {loading ? "MINTING..." : "OPEN MARKET"} <Target size={18} />
              </BrutalistButton>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300 dark:text-white">
              <div className="inline-block p-4 bg-banger-yellow rounded-full border-4 border-black dark:border-white mb-2 shadow-hard dark:shadow-hard-white">
                <CheckCircle size={48} className="text-black" />
              </div>
              <h3 className="font-display text-3xl uppercase">Market Live!</h3>
              <p className="font-mono text-sm max-w-xs mx-auto mb-4">
                Prediction contract deployed. Share the link to let others bet on the outcome.
              </p>
              <div className="bg-gray-100 dark:bg-zinc-800 p-2 font-mono text-xs border border-gray-300 dark:border-zinc-600 break-all">
                bangr.fun/m/{Math.floor(Math.random() * 10000)}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
