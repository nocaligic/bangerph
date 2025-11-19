
import React, { useState } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { generateMarketDetails, analyzeVirality } from '../services/geminiService';
import { Market, AnalysisResult, Tweet, MetricData, MetricType } from '../types';
import { X, Twitter, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { TweetDisplay } from './TweetDisplay';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMarket: (market: Market) => void;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onCreateMarket }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tweetLink, setTweetLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{
    title: string;
    description: string;
    category: any;
    tweet: Tweet;
    analysis: AnalysisResult;
  } | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!tweetLink.trim()) return;
    setLoading(true);
    
    // Simulate extracting text from a URL (In a real app, this would be a backend scraper)
    const simulatedTweetContent = tweetLink.includes('twitter.com') || tweetLink.includes('x.com') 
      ? `Simulated content for tweet at ${tweetLink}. Someone claims that Dogecoin is going to the moon because of a new meme.` 
      : tweetLink; // Fallback if user types text directly

    // Mock the tweet object
    const mockTweet: Tweet = {
        authorName: "Simulated User",
        authorHandle: "simulated_user",
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
        content: simulatedTweetContent,
        timestamp: "Just now",
        imageUrl: Math.random() > 0.7 ? `https://picsum.photos/seed/${Math.random()}/500/300` : undefined
    };

    // Run parallel AI tasks
    const [details, analysis] = await Promise.all([
      generateMarketDetails(simulatedTweetContent),
      analyzeVirality(simulatedTweetContent)
    ]);

    setDraft({ ...details, tweet: mockTweet, analysis });
    setStep(2);
    setLoading(false);
  };

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      
      // Actually create the market in parent
      if (draft) {
        // Generate random metric targets for the new market
        const metrics: Record<MetricType, MetricData> = {
            VIEWS: { target: Math.floor(Math.random() * 5000000) + 100000, yesPrice: 50, noPrice: 50 },
            RETWEETS: { target: Math.floor(Math.random() * 50000) + 1000, yesPrice: 50, noPrice: 50 },
            LIKES: { target: Math.floor(Math.random() * 100000) + 5000, yesPrice: 50, noPrice: 50 },
            COMMENTS: { target: Math.floor(Math.random() * 5000) + 100, yesPrice: 50, noPrice: 50 }
        };

        const newMarket: Market = {
          id: Math.random().toString(36).substr(2, 9),
          title: draft.title,
          description: draft.description,
          tweet: draft.tweet,
          volume: "0",
          endDate: "7d",
          category: draft.category,
          isHot: true,
          featuredMetric: 'VIEWS', // Default to views
          metrics: metrics
        };
        
        // Delay slightly to let user see success screen
        setTimeout(() => {
           onCreateMarket(newMarket);
           setStep(1);
           setTweetLink('');
           setDraft(null);
        }, 1500);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-lg border-4 border-black shadow-hard flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-banger-yellow p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="font-display text-2xl uppercase">Create Market</h2>
          <button onClick={onClose}>
            <X size={24} className="hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: INPUT */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 border-2 border-blue-500 border-dashed flex items-start gap-3">
                <Twitter className="text-blue-500 flex-shrink-0 mt-1" />
                <p className="font-mono text-sm text-blue-800">
                  Paste a link to a viral tweet. Our AI will scan it, vibe check it, and generate a market for you.
                </p>
              </div>

              <div>
                <label className="font-mono font-bold text-sm block mb-2 uppercase">Tweet Link</label>
                <input
                  type="text"
                  value={tweetLink}
                  onChange={(e) => setTweetLink(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full border-4 border-black p-4 font-mono text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#00ffff] transition-shadow"
                />
              </div>

              <BrutalistButton 
                onClick={handleAnalyze} 
                disabled={loading || !tweetLink}
                className="w-full flex justify-center items-center gap-2"
              >
                {loading ? "SCANNING..." : "GENERATE PREVIEW"} <Sparkles size={18} />
              </BrutalistButton>
            </div>
          )}

          {/* STEP 2: PREVIEW & PAY */}
          {step === 2 && draft && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div>
                <div className="font-mono text-xs text-gray-500 mb-1">GENERATED MARKET</div>
                <h3 className="font-display text-xl leading-tight border-l-4 border-banger-pink pl-3 mb-4">
                  {draft.title}
                </h3>
                
                <div className="border-2 border-black bg-gray-50 p-2">
                    <TweetDisplay tweet={draft.tweet} compact={true} />
                </div>
              </div>

              <div className="bg-gray-100 p-3 border-2 border-black font-mono text-xs">
                <span className="font-bold">AI VERDICT:</span> {draft.analysis.verdict} ({draft.analysis.hypeScore}/100)
                <div className="mt-1 text-gray-600">"{draft.analysis.reasoning}"</div>
              </div>

              <div className="flex justify-between items-center bg-banger-black text-white p-4 border-2 border-black">
                <div className="font-mono text-sm">COST TO MINT</div>
                <div className="font-display text-2xl text-banger-yellow">10 USDC</div>
              </div>
               
              <div className="text-center font-mono text-[10px] text-gray-500">
                Network: <span className="font-bold text-yellow-600">BNB Chain</span>
              </div>

              <BrutalistButton 
                onClick={handlePayment} 
                disabled={loading}
                className="w-full flex justify-center items-center gap-2"
                variant="secondary"
              >
                {loading ? "PROCESSING..." : "PAY & LAUNCH"} <Zap size={18} />
              </BrutalistButton>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
              <div className="inline-block p-4 bg-green-100 rounded-full border-4 border-green-500 mb-2">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h3 className="font-display text-3xl uppercase">Market Live!</h3>
              <p className="font-mono text-sm max-w-xs mx-auto">
                Your market has been deployed to the BNB Chain. Good luck!
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
