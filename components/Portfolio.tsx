
import React from 'react';
import { Position, Market } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Activity, DollarSign, Lock, ArrowLeft, Globe } from 'lucide-react';

interface PortfolioProps {
  positions: Position[];
  onNavigateMarket: (marketId: string) => void;
  onBrowse: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ positions, onNavigateMarket, onBrowse }) => {
  // Calculate Totals
  const totalInvested = positions.reduce((sum, p) => sum + p.invested, 0);
  const totalValue = positions.reduce((sum, p) => sum + (p.shares * (p.currentPrice / 100)), 0);
  const totalPnL = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER DASHBOARD */}
      <div className="bg-black text-white border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white mb-10 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'linear-gradient(#9945FF 1px, transparent 1px), linear-gradient(90deg, #14F195 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-banger-yellow mb-2 font-mono text-sm uppercase tracking-widest">
              <Wallet size={16} /> Connected Wallet
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase leading-none">
              Your Bags
            </h1>
            <div className="font-mono text-gray-400 mt-2 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"></span>
              Hit8...xQ29 • SOLANA
            </div>
          </div>

          <div className="flex flex-col items-end w-full md:w-auto gap-4">
             <BrutalistButton size="sm" onClick={onBrowse} className="self-end bg-banger-cyan hover:bg-white">
               <div className="flex items-center gap-2">
                 <Globe size={16} /> BACK TO MARKETS
               </div>
             </BrutalistButton>

             <div className="text-right">
               <div className="font-mono text-xs text-gray-400 uppercase">Total Portfolio Value</div>
               <div className="font-display text-5xl md:text-6xl text-white tracking-tighter">
                 ${totalValue.toFixed(2)}
               </div>
             </div>
             
             <div className={`
               flex items-center gap-2 px-3 py-1 border-2 
               ${totalPnL >= 0 ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}
             `}>
                {totalPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="font-mono font-bold text-lg">
                  {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toFixed(2)} ({pnlPercent.toFixed(1)}%)
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* POSITIONS GRID */}
      {positions.length === 0 ? (
        <div className="text-center py-20 border-4 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
           <div className="mb-4 text-gray-300 dark:text-zinc-700">
             <Lock size={64} className="mx-auto" />
           </div>
           <h2 className="font-display text-3xl text-gray-400 uppercase mb-4">No Active Positions</h2>
           <p className="font-mono text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
             You haven't aped into anything yet. The markets are waiting.
           </p>
           <BrutalistButton onClick={onBrowse}>
             START TRADING
           </BrutalistButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {positions.map((pos) => {
            const currentValue = pos.shares * (pos.currentPrice / 100);
            const profit = currentValue - pos.invested;
            const isProfitable = profit >= 0;
            const percentChange = ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;

            return (
              <div 
                key={pos.id}
                className={`
                  group relative bg-white dark:bg-zinc-900 border-4 shadow-hard dark:shadow-hard-white hover:-translate-y-1 transition-transform
                  ${isProfitable 
                    ? 'border-green-600 shadow-[8px_8px_0px_0px_#22c55e] hover:shadow-[12px_12px_0px_0px_#16a34a]' 
                    : 'border-red-600 shadow-[8px_8px_0px_0px_#ef4444] hover:shadow-[12px_12px_0px_0px_#dc2626]'}
                `}
              >
                {/* TICKET HEADER */}
                <div className={`
                  p-3 border-b-4 flex justify-between items-center
                  ${isProfitable ? 'bg-green-100 dark:bg-green-900/30 border-green-600' : 'bg-red-100 dark:bg-red-900/30 border-red-600'}
                `}>
                  <span className="font-mono font-bold text-xs uppercase flex items-center gap-1 dark:text-white">
                    <Activity size={12} /> {pos.side} POSITION
                  </span>
                  <span className={`
                    font-mono text-xs font-bold px-2 py-0.5 border-2
                    ${isProfitable ? 'bg-green-500 text-white border-green-700' : 'bg-red-500 text-white border-red-700'}
                  `}>
                    {isProfitable ? 'WINNING' : 'LOSING'}
                  </span>
                </div>

                {/* MAIN CONTENT */}
                <div className="p-5">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-display text-xl uppercase leading-tight line-clamp-2 h-12 dark:text-white">
                        {pos.marketTitle}
                      </h3>
                      <div className="bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] px-1 py-0.5">
                        {pos.metricType}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-zinc-800 p-2 border-2 border-gray-200 dark:border-zinc-700">
                        <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase">Entry</div>
                        <div className="font-mono font-bold dark:text-white">{pos.avgPrice}¢</div>
                      </div>
                      <div className={`p-2 border-2 ${isProfitable ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                        <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase">Current</div>
                        <div className="font-mono font-bold flex items-center gap-1 dark:text-white">
                          {pos.currentPrice}¢ 
                          <span className={`text-[10px] ${isProfitable ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                   </div>

                   <div className="flex justify-between items-end border-t-2 border-dashed border-gray-300 dark:border-zinc-700 pt-3">
                      <div>
                         <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase">Shares</div>
                         <div className="font-display text-lg dark:text-white">{pos.shares}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase">Value</div>
                         <div className="font-display text-2xl dark:text-white">${currentValue.toFixed(2)}</div>
                      </div>
                   </div>
                </div>

                {/* ACTION FOOTER */}
                <div className="p-3 pt-0">
                  <BrutalistButton 
                    size="sm" 
                    className={`w-full flex justify-center items-center gap-2 ${isProfitable ? 'group-hover:bg-green-400' : 'group-hover:bg-red-400'}`}
                    onClick={() => onNavigateMarket(pos.marketId)}
                  >
                     MANAGE <ArrowRight size={16} />
                  </BrutalistButton>
                </div>

                {/* DECORATIVE PERFORATIONS */}
                <div className={`absolute -left-[6px] top-1/2 w-3 h-3 bg-[#f0f0f0] dark:bg-zinc-900 rounded-full border-r-2 ${isProfitable ? 'border-green-600' : 'border-red-600'}`}></div>
                <div className={`absolute -right-[6px] top-1/2 w-3 h-3 bg-[#f0f0f0] dark:bg-zinc-900 rounded-full border-l-2 ${isProfitable ? 'border-green-600' : 'border-red-600'}`}></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
