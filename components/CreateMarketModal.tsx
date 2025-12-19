import React, { useState } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { Market, Tweet, MarketCategory } from '../types';
import { X, Twitter, Zap } from 'lucide-react';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMarket: (market: Market) => void;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onCreateMarket }) => {
  const [tweetLink, setTweetLink] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!tweetLink.trim()) return;
    setLoading(true);

    // Simulate extracting tweet content
    const simulatedTweetContent = tweetLink.includes('twitter.com') || tweetLink.includes('x.com')
      ? `Simulated content for tweet at ${tweetLink}. Someone claims that Dogecoin is going to the moon.`
      : tweetLink;

    const mockTweet: Tweet = {
      authorName: "Simulated User",
      authorHandle: "simulated_user",
      avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
      content: simulatedTweetContent,
      timestamp: "Just now",
      imageUrl: Math.random() > 0.7 ? `https://picsum.photos/seed/${Math.random()}/500/300` : undefined
    };

    // Create a new market
    const newMarket: Market = {
      id: `market-${Date.now()}`,
      title: "New Market",
      description: "A new prediction market",
      volume: "$0",
      endDate: "24h",
      category: 'ALPHA' as MarketCategory,
      featuredMetric: 'VIEWS',
      metrics: {
        VIEWS: { target: 1000000, yesPrice: 50, noPrice: 50, progress: 0, vaultValue: 0 },
        RETWEETS: { target: 50000, yesPrice: 50, noPrice: 50, progress: 0, vaultValue: 0 },
        LIKES: { target: 100000, yesPrice: 50, noPrice: 50, progress: 0, vaultValue: 0 },
        COMMENTS: { target: 10000, yesPrice: 50, noPrice: 50, progress: 0, vaultValue: 0 }
      },
      tweet: mockTweet
    };

    setLoading(false);
    onCreateMarket(newMarket);
    setTweetLink('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black shadow-hard max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-banger-pink text-white p-2 border-4 border-black shadow-hard-sm hover:bg-black transition-colors"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
          <div className="bg-banger-yellow p-2 border-2 border-black">
            <Zap size={24} />
          </div>
          <h2 className="font-display text-2xl uppercase">Spot Alpha</h2>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="font-mono text-xs font-bold uppercase text-gray-500 mb-2 block">
            Tweet URL or Paste Content
          </label>
          <div className="relative">
            <Twitter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={tweetLink}
              onChange={(e) => setTweetLink(e.target.value)}
              placeholder="https://x.com/user/status/..."
              className="w-full border-4 border-black p-3 pl-10 font-mono text-sm focus:outline-none focus:border-banger-pink transition-colors"
            />
          </div>
        </div>

        {/* Create Button */}
        <BrutalistButton
          onClick={handleCreate}
          disabled={loading || !tweetLink.trim()}
          className="w-full"
        >
          {loading ? "ANALYZING..." : "CREATE MARKET"}
        </BrutalistButton>
      </div>
    </div>
  );
};
