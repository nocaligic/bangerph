import React from 'react';
import { Market, MetricType } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { TweetDisplay } from './TweetDisplay';
import { TrendingUp, Clock, Zap, Eye, Repeat, Heart, MessageCircle, ThumbsUp, ThumbsDown, Flame, Trophy, Sparkles } from 'lucide-react';
import { useDegenMode } from '../contexts/DegenContext';

interface MarketCardProps {
  market: Market;
  onBet: (market: Market) => void;
}

const getMetricConfig = (type: MetricType) => {
  switch (type) {
    case 'VIEWS': return { color: 'bg-blue-500', text: 'text-blue-600', label: 'VIEWS', icon: <Eye size={16} /> };
    case 'RETWEETS': return { color: 'bg-green-500', text: 'text-green-600', label: 'RETWEETS', icon: <Repeat size={16} /> };
    case 'LIKES': return { color: 'bg-red-500', text: 'text-red-600', label: 'LIKES', icon: <Heart size={16} /> };
    case 'COMMENTS': return { color: 'bg-orange-500', text: 'text-orange-600', label: 'COMMENTS', icon: <MessageCircle size={16} /> };
  }
};

export const MarketCard: React.FC<MarketCardProps> = ({ market, onBet }) => {
  const { degenMode } = useDegenMode();
  const activeMetric = market.featuredMetric;
  const metricData = market.metrics[activeMetric];
  const config = getMetricConfig(activeMetric);

  // Format numbers (e.g. 1,000,000 -> 1M)
  const formatTarget = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  };

  return (
    <div
      onClick={() => onBet(market)}
      className={`
        market-card group cursor-pointer relative transition-all duration-300 flex flex-col w-full border-4 border-black
        ${degenMode ? 'bg-white shadow-[12px_12px_0px_0px_#000]' : `bg-white shadow-hard ${market.isHot ? 'hover:border-banger-pink' : 'hover:border-banger-cyan'}`}
      `}
    >
      {degenMode && (
        <>
          <div className="absolute top-[-15px] right-2 animate-bounce text-[#ecfd00] z-20"><Trophy size={32} /></div>
          <div className="absolute bottom-[-10px] left-[-10px] animate-pulse text-[#00ffff] z-20"><Sparkles size={24} /></div>
        </>
      )}
      {/* Content Container */}
      <div className="p-4 flex flex-col gap-3">

        {/* Header Row: Category | HOT | Date */}
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-[10px] px-2 py-1 border-2 border-black uppercase font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${degenMode ? 'bg-[#ff00ff] text-white' : 'bg-banger-yellow text-black'}`}>
              {market.category}
            </span>

            {/* INLINE HOT BADGE - NO CLIPPING */}
            {market.isHot && (
              <div className={`font-mono text-[10px] px-2 py-1 border-2 border-black uppercase font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 transform -rotate-3 animate-pulse ${degenMode ? 'bg-black text-[#ecfd00]' : 'bg-banger-pink text-white'}`}>
                <Flame size={12} className="fill-current" /> HOT
              </div>
            )}
          </div>

          <span className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 border border-black whitespace-nowrap ml-2 ${degenMode ? 'bg-[#00ffff] text-black shadow-[2px_2px_0px_0px_#000]' : 'text-gray-500 bg-gray-100'}`}>
            <Clock size={12} /> {market.endDate}
          </span>
        </div>

        {/* Tweet Embed Preview */}
        <div className={`border-2 border-black p-2 hover:bg-white transition-colors relative overflow-hidden group-hover:border-current ${degenMode ? 'bg-[#f0f0f0]' : 'bg-gray-50'}`}>
          <TweetDisplay tweet={market.tweet} compact={true} />
        </div>

        {/* ARCADE STYLE "WILL THIS HIT" BANNER */}
        <div className={`arcade-banner relative border-4 border-black p-4 mt-2 overflow-hidden group-hover:brightness-110 transition-all ${degenMode ? 'bg-striped-yellow' : config.color}`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 pattern-dots pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className={`absolute -top-3 -left-3 font-mono text-[10px] font-bold px-2 py-1 uppercase transform -rotate-3 border-2 border-white shadow-sm ${degenMode ? 'bg-[#ff00ff] text-white' : 'bg-black text-white'}`}>
              Will it hit?
            </div>

            <div className={`font-display text-4xl md:text-5xl leading-none uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black mt-1 ${degenMode ? 'text-black' : 'text-white'}`}>
              {formatTarget(metricData.target)}
            </div>
            <div className={`font-display text-lg px-2 border-2 border-black transform rotate-1 -mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${degenMode ? 'bg-black text-[#00ffff]' : 'text-black bg-white'}`}>
              {config.label}
            </div>
          </div>
        </div>

        {/* YES/NO ARCADE BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="relative bg-white border-2 border-black p-1 group/btn">
            <div className={`h-full border-2 border-black p-2 flex flex-col items-center justify-center hover:bg-green-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/btn:translate-x-[1px] group-hover/btn:translate-y-[1px] group-hover/btn:shadow-none ${degenMode ? 'bg-[#00ffaa]' : 'bg-green-100'}`}>
              <div className={`flex items-center gap-1 font-mono text-[10px] font-bold mb-1 ${degenMode ? 'text-black' : 'text-green-800'}`}>
                <ThumbsUp size={12} /> YES
              </div>
              <div className={`font-display text-2xl leading-none ${degenMode ? 'text-black font-bold' : 'text-green-600'}`}>{metricData.yesPrice}¢</div>
            </div>
          </div>

          <div className="relative bg-white border-2 border-black p-1 group/btn">
            <div className={`h-full border-2 border-black p-2 flex flex-col items-center justify-center hover:bg-red-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/btn:translate-x-[1px] group-hover/btn:translate-y-[1px] group-hover/btn:shadow-none ${degenMode ? 'bg-[#ff00ff]' : 'bg-red-100'}`}>
              <div className={`flex items-center gap-1 font-mono text-[10px] font-bold mb-1 ${degenMode ? 'text-white' : 'text-red-800'}`}>
                <ThumbsDown size={12} /> NO
              </div>
              <div className={`font-display text-2xl leading-none ${degenMode ? 'text-white' : 'text-red-600'}`}>{metricData.noPrice}¢</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs font-mono font-bold mt-1 px-1">
          <span className="flex items-center gap-1 bg-black text-white px-1">
            <TrendingUp size={12} /> {market.volume}
          </span>
        </div>
      </div>

      {/* ACTION BUTTON - Stays at bottom but flows with content */}
      <div className="p-4 pt-0 mt-auto">
        <BrutalistButton
          className="w-full flex items-center justify-center gap-2 group-hover:bg-banger-cyan group-hover:text-black transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onBet(market);
          }}
        >
          <Zap size={18} className="fill-current" />
          TRADE NOW
        </BrutalistButton>
      </div>
    </div>
  );
};