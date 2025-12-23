/**
 * LiveMarketDetail - Market detail view for live contract markets
 * Restoring the classic layout with sticky sidebar and chart
 */

import React from 'react';
import { useLiveMarket } from '../lib/contracts/useMarkets';
import { useMarketTrades } from '../lib/contracts/useMarketTrades';
import { ConnectedTradePanel } from './ConnectedTradePanel';
import { TweetDisplay } from './TweetDisplay';
import { BrutalistButton } from './BrutalistButton';
import { MetricBarChart } from './MetricBarChart';
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
    const { data: tradesData, refetch: refetchTrades } = useMarketTrades(marketId);

    // Combined refetch for after trades
    const handleTradeSuccess = () => {
        refetch();
        refetchTrades();
    };

    // Get all trades for activity feed (reversed to show newest first)
    const recentTrades = tradesData?.priceHistory?.slice().reverse() || [];

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
            <div className="bg-white border-b-4 border-black p-4 shadow-sm">
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

                    {/* Metric Bar Chart - uses AMM prices from contract */}
                    <MetricBarChart
                        metricName={metricName}
                        targetValue={formatValue(market.targetValue)}
                        yesPrice={market.yesPrice}
                        noPrice={market.noPrice}
                        tradeCount={tradesData?.count || 0}
                    />

                    {/* Live Activity Feed */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between p-4 border-b-2 border-black">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <h3 className="font-mono text-xs uppercase font-bold text-gray-500">Live Activity</h3>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-black border-2 border-black px-2 py-0.5 bg-gray-100">
                                {tradesData?.count || 0} TRADES
                            </span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-4">
                            <div className="space-y-3">
                                {recentTrades.length > 0 ? (
                                    recentTrades.map((trade, i) => (
                                        <div key={i} className="flex justify-between items-center font-mono text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 border border-black" />
                                                <span>
                                                    {trade.buyer.slice(0, 6)}...{trade.buyer.slice(-4)} bought{' '}
                                                    <span className={trade.isYes ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                                        {trade.isYes ? 'YES' : 'NO'}
                                                    </span>
                                                </span>
                                            </div>
                                            <span className="font-bold">${trade.amount}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 font-mono text-sm py-4">
                                        No trades yet. Be the first!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Trade Panel */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-32 space-y-4">
                        <ConnectedTradePanel
                            marketId={marketId}
                            metricType={metricName}
                            onSuccess={handleTradeSuccess}
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
