/**
 * LiveMarketDetail - Market detail view for live contract markets
 * Restoring the classic layout with sticky sidebar and chart
 */

import React from 'react';
import { useLiveMarket } from '../lib/contracts/useMarkets';
import { ConnectedTradePanel } from './ConnectedTradePanel';
import { TweetDisplay } from './TweetDisplay';
import { BrutalistButton } from './BrutalistButton';
import {
    ArrowLeft, Clock, Eye, Heart, Repeat2, MessageCircle, ExternalLink, RefreshCw,
    TrendingUp, Activity, Share, Twitter, Zap
} from 'lucide-react';


interface LiveMarketDetailProps {
    marketId: number;
    onBack: () => void;
}

const METRIC_ICONS = [Eye, Heart, Repeat2, MessageCircle];
const METRIC_NAMES = ['VIEWS', 'LIKES', 'RETWEETS', 'COMMENTS'];

// Mock chart data for now (since we don't have historical data yet)
const MOCK_CHART_DATA = [
    { time: '00:00', price: 50 },
    { time: '04:00', price: 52 },
    { time: '08:00', price: 48 },
    { time: '12:00', price: 55 },
    { time: '16:00', price: 62 },
    { time: '20:00', price: 58 },
    { time: '24:00', price: current => current }, // Will be replaced by live price
];

export const LiveMarketDetail: React.FC<LiveMarketDetailProps> = ({ marketId, onBack }) => {
    const { market, quotedTweet, isLoading, refetch } = useLiveMarket(marketId);

    // V2: Tweet data comes from contract, no need to fetch from API

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="mx-auto mb-4 animate-spin text-gray-400" size={48} />
                    <p className="font-mono text-gray-500">Loading market...</p>
                </div>
            </div>
        );
    }

    if (!market) {
        return (
            <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
                <div className="text-center">
                    <p className="font-mono text-gray-500 mb-4">Market not found</p>
                    <BrutalistButton onClick={onBack}>Go Back</BrutalistButton>
                </div>
            </div>
        );
    }

    const metricName = METRIC_NAMES[market.metric];

    const formatValue = (value: bigint) => {
        const num = Number(value);
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${Math.floor(num / 1000)}K`;
        return num.toString();
    };

    const isActive = market.status === 0;

    // V2: Tweet data comes from contract, not API
    const tweetForDisplay = {
        authorName: market.authorName,
        authorHandle: market.authorHandle,
        avatarUrl: market.avatarUrl || '',
        content: market.tweetText,
        timestamp: '',
        imageUrl: market.media.length > 0 && market.media[0].type === 'image'
            ? market.media[0].url
            : undefined,
    };



    return (
        <div className="min-h-screen bg-[#f0f0f0]">
            {/* Header */}
            <div className="bg-white border-b-4 border-black p-4 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BrutalistButton size="sm" variant="outline" onClick={onBack}>
                            <ArrowLeft size={16} />
                        </BrutalistButton>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-banger-yellow text-black font-mono text-[10px] px-2 py-0.5 border border-black uppercase font-bold">
                                    @{market.authorHandle}
                                </span>
                                {isActive && (
                                    <span className="flex items-center gap-1 text-[10px] font-mono text-red-500 font-bold animate-pulse">
                                        <div className="w-2 h-2 bg-red-500 rounded-full" /> LIVE
                                    </span>
                                )}
                            </div>
                            <h1 className="font-display text-xl md:text-2xl">
                                Predicting: Will it hit {formatValue(market.targetValue)} {metricName}?
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <BrutalistButton size="sm" variant="outline" className="hidden md:flex gap-2">
                            <Share size={14} /> SHARE
                        </BrutalistButton>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">

                {/* Left Column: Chart & Info (Scrollable) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Price Chart Card */}
                    <div className="bg-black border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                        <div className="bg-gray-900 border-2 border-gray-700 p-4 h-[300px] md:h-[400px] relative overflow-hidden">
                            {/* Chart Header */}
                            <div className="absolute top-4 left-4 z-10">
                                <div className="font-mono text-gray-400 text-xs uppercase mb-1">Predicting</div>
                                <div className="font-display text-2xl text-white uppercase text-shadow-neon">
                                    Will it hit {formatValue(market.targetValue)} {metricName}?
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 z-10 bg-green-500/10 border border-green-500 px-3 py-1 rounded">
                                <div className="font-mono text-green-400 text-sm font-bold flex items-center gap-2">
                                    <TrendingUp size={14} /> +12.4% (24H)
                                </div>
                            </div>

                            {/* Chart */}
                            {/* Custom SVG Chart (Replaces Recharts to avoid crash) */}
                            <div className="flex-1 w-full h-full pt-16 relative">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300" preserveAspectRatio="none">
                                    {/* Gradients */}
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ff0055" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ff0055" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid Lines */}
                                    <line x1="0" y1="75" x2="800" y2="75" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
                                    <line x1="0" y1="150" x2="800" y2="150" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
                                    <line x1="0" y1="225" x2="800" y2="225" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />

                                    {/* The Line & Area */}
                                    <path
                                        d="M0,250 C100,200 200,280 300,180 S500,80 800,50"
                                        fill="none"
                                        stroke="#ff0055"
                                        strokeWidth="3"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    <path
                                        d="M0,250 C100,200 200,280 300,180 S500,80 800,50 V300 H0 Z"
                                        fill="url(#chartGradient)"
                                        stroke="none"
                                    />

                                    {/* Live Dot at end */}
                                    <circle cx="800" cy="50" r="4" fill="#fffc00" className="animate-pulse" />
                                    <circle cx="800" cy="50" r="10" fill="#fffc00" fillOpacity="0.3" className="animate-ping" />
                                </svg>

                                {/* Time Labels */}
                                <div className="absolute bottom-0 left-0 right-0 flex justify-between font-mono text-[10px] text-gray-500 px-2">
                                    <span>00:00</span>
                                    <span>04:00</span>
                                    <span>08:00</span>
                                    <span>12:00</span>
                                    <span>16:00</span>
                                    <span>20:00</span>
                                    <span>NOW</span>
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-mono text-banger-yellow animate-pulse">
                                <div className="w-1.5 h-1.5 bg-banger-yellow rounded-full"></div> LIVE FEED
                            </div>
                        </div>
                    </div>

                    {/* AI Vibe Check Banner */}
                    <div className="bg-[#a855f7] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden text-white">
                        <div className="relative z-10">
                            <h3 className="font-display text-xl uppercase mb-2 flex items-center gap-2 text-banger-yellow">
                                <Zap size={20} className="fill-current" /> AI Vibe Check
                            </h3>
                            <p className="font-mono text-sm opacity-90 mb-4 max-w-xl">
                                Not sure where to put your chips? Our Gemini-powered oracle analyzes the timeline sentiment, meme velocity, and cultural impact.
                            </p>
                            <BrutalistButton
                                size="sm"
                                className="bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]"
                            >
                                RUN ANALYSIS
                            </BrutalistButton>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
                            <Zap size={200} />
                        </div>
                    </div>

                    {/* Tweet Content */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="bg-white border-b-4 border-black p-3 flex justify-between items-center">
                            <div className="font-mono text-sm font-bold flex items-center gap-2">
                                <Twitter size={14} className="fill-current" /> THE TWEET
                            </div>
                            <a href={market.tweetUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black">
                                <ExternalLink size={14} />
                            </a>
                        </div>
                        <div className="p-4 md:p-6">
                            <TweetDisplay tweet={tweetForDisplay} compact={false} />
                        </div>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <h3 className="font-mono text-xs uppercase font-bold text-gray-500">Live Activity</h3>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex justify-between items-center font-mono text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 border border-black" />
                                        <span>anon{Math.floor(Math.random() * 900) + 100} bought <span className={i % 2 === 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{i % 2 === 0 ? 'YES' : 'NO'}</span></span>
                                    </div>
                                    <span className="font-bold">${Math.floor(Math.random() * 500) + 10}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Trade Panel */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-24 space-y-4">
                        <ConnectedTradePanel
                            marketId={marketId}
                            metricType={metricName}
                            onSuccess={refetch}
                        />

                        {/* Spread the Hype Box */}
                        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4">
                            <h3 className="font-display text-lg uppercase mb-3">Spread the Hype</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="bg-[#1DA1F2] text-white border-2 border-black font-mono text-xs font-bold py-2 flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-0.5 transition-all">
                                    <Twitter size={14} fill="currentColor" /> TWEET
                                </button>
                                <button className="bg-white text-black border-2 border-black font-mono text-xs font-bold py-2 flex items-center justify-center gap-2 hover:bg-gray-50 active:translate-y-0.5 transition-all">
                                    <Share size={14} /> LINK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
