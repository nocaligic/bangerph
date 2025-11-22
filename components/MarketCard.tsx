
import React from 'react';
import { Market, MetricType } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { TweetDisplay } from './TweetDisplay';
import { Clock, Zap, Eye, Repeat, Heart, MessageCircle, Flame, Lock, TrendingUp, Ticket, Sparkles } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onBet: (market: Market) => void;
}

const getMetricConfig = (type: MetricType) => {
  switch (type) {
    case 'VIEWS': return { 
      color: 'bg-blue-500', 
      borderColor: 'border-blue-500',
      text: 'text-blue-600 dark:text-blue-400', 
      label: 'VIEWS', 
      icon: <Eye size={14} /> 
    };
    case 'RETWEETS': return { 
      color: 'bg-green-500', 
      borderColor: 'border-green-500',
      text: 'text-green-600 dark:text-green-400', 
      label: 'RETWEETS', 
      icon: <Repeat size={14} /> 
    };
    case 'LIKES': return { 
      color: 'bg-red-500', 
      borderColor: 'border-red-500',
      text: 'text-red-600 dark:text-red-400', 
      label: 'LIKES', 
      icon: <Heart size={14} /> 
    };
    case 'COMMENTS': return { 
      color: 'bg-orange-500', 
      borderColor: 'border-orange-500',
      text: 'text-orange-600 dark:text-orange-400', 
      label: 'COMMENTS', 
      icon: <MessageCircle size={14} /> 
    };
  }
};

export const MarketCard: React.FC<MarketCardProps> = ({ market, onBet }) => {
  const activeMetric = market.featuredMetric;
  const metricData = market.metrics[activeMetric] || market.metrics['VIEWS'];
  const config = getMetricConfig(activeMetric);

  const formatTarget = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  };

  const formatMoney = (num: number) => {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  return (
    <div 
      onClick={() => onBet(market)}
      className="group cursor-pointer relative w-full mb-8 break-inside-avoid"
    >
      {/* SHADOW LAYER (Stationary) - Black in light mode, White in dark mode */}
      <div className="absolute top-2 left-2 w-full h-full bg-black dark:bg-white border-4 border-black dark:border-white border-b-0 jagged-bottom jagged-black z-0"></div>

      {/* CARD CONTENT LAYER (Moves on Hover) */}
      <div className="relative bg-white dark:bg-zinc-900 border-4 border-black dark:border-white border-b-0 transition-transform duration-150 group-hover:-translate-y-2 group-hover:-translate-x-1 jagged-bottom jagged-white z-10 flex flex-col h-full">
        
        {/* METRIC HEADER STRIP */}
        <div className={`${config.color} h-9 border-b-4 border-black dark:border-white flex justify-between items-center px-3 relative overflow-hidden`}>
           {/* Strip Pattern */}
           <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')]"></div>
           
           <div className="flex items-center gap-2 font-mono font-bold text-xs text-white uppercase drop-shadow-md z-10">
              {config.icon}
              <span className="tracking-wide">Target: {formatTarget(metricData.target)}</span>
           </div>
           {market.isHot && (
              <div className="flex items-center gap-1 text-white font-mono text-[10px] font-bold animate-pulse z-10">
                  <Flame size={12} className="fill-current" /> HOT
              </div>
           )}
        </div>

        {/* TICKET BODY */}
        <div className="p-4 flex flex-col gap-3 relative flex-grow">
          
          {/* Tweet Preview - REFINED CONTAINER */}
          {/* Removed extra gray background padding to let full width media breathe */}
          <div className="border-2 border-black dark:border-white bg-white dark:bg-zinc-950 p-3 relative hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] transition-shadow">
             {/* Simulated Vibe Check Badge */}
             <div className="absolute -top-2 -right-2 z-20 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold px-2 py-1 border border-white dark:border-black shadow-sm flex items-center gap-1 transform rotate-2">
                <Sparkles size={10} className="text-banger-yellow dark:text-black" /> AI CHECKED
             </div>
            <TweetDisplay tweet={market.tweet} compact={true} hideMetrics={true} />
          </div>

          {/* Meta Info Row */}
          <div className="flex justify-between items-center mt-1">
             <div className="bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
               {market.category}
             </div>
             <div className="font-mono text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
               <Clock size={12} /> {market.endDate}
             </div>
          </div>

          {/* STATS GRID - NEW UNIVERSAL COLOR BLOCK */}
          <div className="grid grid-cols-2 gap-0 border-2 border-black dark:border-white mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-none">
              
              {/* VAULT - SOLID COLOR BLOCK */}
              <div className={`${config.color} p-3 border-r-2 border-black dark:border-white relative overflow-hidden flex flex-col justify-center min-h-[60px]`}>
                   {/* Texture overlay for detail */}
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(0,0,0,0.4)_1px,transparent_1px)] [background-size:4px_4px]"></div>
                   
                   <div className="relative z-10">
                       <div className="font-mono text-[9px] font-bold uppercase mb-0.5 text-black/70 flex items-center gap-1">
                          {config.icon} PRIZE POOL
                       </div>
                       <div className="font-display text-xl leading-none text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          {formatMoney(metricData.vaultValue)}
                       </div>
                   </div>
              </div>

              {/* PRICE BLOCK */}
              <div className="p-3 bg-white dark:bg-zinc-900 flex flex-col justify-center relative min-h-[60px]">
                   <div className="font-mono text-[9px] text-gray-500 dark:text-gray-400 uppercase mb-0.5">
                      Entry Price
                   </div>
                   <div className="font-display text-xl leading-none flex items-center gap-1 dark:text-white">
                      ${(metricData.ticketPrice / 100).toFixed(2)}
                      <TrendingUp size={14} className="text-green-600" />
                   </div>
              </div>
          </div>
        </div>

        {/* TICKET PERFORATION DIVIDER */}
        <div className="relative h-6 w-full flex items-center justify-center mt-auto">
           {/* Left Notch */}
           <div className="ticket-hole-left"></div>
           
           {/* Dotted Line */}
           <div className="w-full border-t-4 border-dashed border-gray-300 dark:border-zinc-700 mx-4"></div>
           
           {/* Right Notch */}
           <div className="ticket-hole-right"></div>
        </div>

        {/* TICKET FOOTER (ACTION) */}
        <div className="p-4 pt-2 bg-white dark:bg-zinc-900 rounded-b-sm">
           {/* Progress */}
           <div className="mb-3">
              <div className="flex justify-between text-[9px] font-mono font-bold uppercase mb-1">
                  <span className={config.text}>{metricData.progress}% Filled</span>
                  <span className="dark:text-gray-400">Cap: {formatTarget(metricData.target)}</span>
              </div>
              <div className="w-full h-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 relative">
                  <div 
                      className={`h-full ${config.color} hazard-stripes border-r-2 border-black dark:border-white`}
                      style={{ width: `${Math.min(metricData.progress, 100)}%` }}
                  ></div>
              </div>
          </div>

          <BrutalistButton 
            className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-banger-yellow hover:text-black dark:hover:bg-banger-yellow transition-colors active:translate-y-1 active:shadow-none py-3" 
            onClick={(e) => {
              e.stopPropagation();
              onBet(market);
            }}
          >
            <Ticket size={16} className="fill-current" />
            BUY PREDICTION
          </BrutalistButton>
        </div>
      </div>
    </div>
  );
};
