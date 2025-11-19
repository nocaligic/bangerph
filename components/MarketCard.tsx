import React, { useMemo } from 'react';
import { Market, MetricType } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { TweetDisplay } from './TweetDisplay';
import { TrendingUp, Clock, Zap, Eye, Repeat, Heart, MessageCircle, ThumbsUp, ThumbsDown, Flame } from 'lucide-react';

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
  const activeMetric = market.featuredMetric;
  const metricData = market.metrics[activeMetric];
  const config = getMetricConfig(activeMetric);

  // Randomize hover border color on mount
  const hoverBorderColor = useMemo(() => {
    const colors = [
      'hover:border-banger-pink',
      'hover:border-banger-cyan',
      'hover:border-banger-yellow',
      'hover:border-banger-purple',
      'hover:border-green-500',
      'hover:border-blue-500', 
      'hover:border-red-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

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
        group cursor-pointer relative bg-white border-4 border-black shadow-hard 
        transition-colors duration-150 flex flex-col w-full
        ${hoverBorderColor}
      `}
    >
      {/* Content Container */}
      <div className="p-4 flex flex-col gap-3">
        
        {/* Header Row: Category | HOT | Date */}
        <div className="flex justify-between items-start mb-1">
           <div className="flex items-center gap-2 flex-wrap">
             <span className="bg-banger-yellow text-black font-mono text-[10px] px-2 py-1 border-2 border-black uppercase font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               {market.category}
             </span>
             
             {/* INLINE HOT BADGE - NO CLIPPING */}
             {market.isHot && (
               <div className="bg-banger-pink text-white font-mono text-[10px] px-2 py-1 border-2 border-black uppercase font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 transform -rotate-3 animate-pulse">
                  <Flame size={12} className="fill-current" /> HOT
               </div>
             )}
           </div>

           <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 border border-black whitespace-nowrap ml-2">
             <Clock size={12} /> {market.endDate}
           </span>
        </div>
        
        {/* Tweet Embed Preview */}
        <div className="border-2 border-black bg-gray-50 p-2 hover:bg-white transition-colors relative overflow-hidden group-hover:border-current">
          <TweetDisplay tweet={market.tweet} compact={true} />
        </div>

        {/* ARCADE STYLE "WILL THIS HIT" BANNER */}
        <div className={`relative border-4 border-black ${config.color} p-4 mt-2 overflow-hidden group-hover:brightness-110 transition-all`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 pattern-dots pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="absolute -top-3 -left-3 bg-black text-white font-mono text-[10px] font-bold px-2 py-1 uppercase transform -rotate-3 border-2 border-white shadow-sm">
                Will it hit?
            </div>
            
            <div className="font-display text-4xl md:text-5xl leading-none uppercase text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black mt-1">
              {formatTarget(metricData.target)}
            </div>
            <div className="font-display text-lg text-black bg-white px-2 border-2 border-black transform rotate-1 -mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               {config.label}
            </div>
          </div>
        </div>

        {/* YES/NO ARCADE BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="relative bg-white border-2 border-black p-1 group/btn">
            <div className="bg-green-100 h-full border-2 border-black p-2 flex flex-col items-center justify-center hover:bg-green-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/btn:translate-x-[1px] group-hover/btn:translate-y-[1px] group-hover/btn:shadow-none">
              <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-green-800 mb-1">
                <ThumbsUp size={12} /> YES
              </div>
              <div className="font-display text-2xl text-green-600 leading-none">{metricData.yesPrice}¢</div>
            </div>
          </div>

          <div className="relative bg-white border-2 border-black p-1 group/btn">
             <div className="bg-red-100 h-full border-2 border-black p-2 flex flex-col items-center justify-center hover:bg-red-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/btn:translate-x-[1px] group-hover/btn:translate-y-[1px] group-hover/btn:shadow-none">
              <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-red-800 mb-1">
                <ThumbsDown size={12} /> NO
              </div>
              <div className="font-display text-2xl text-red-600 leading-none">{metricData.noPrice}¢</div>
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