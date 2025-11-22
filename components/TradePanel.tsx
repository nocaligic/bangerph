
import React, { useState, useEffect } from 'react';
import { Market, MetricType, MetricData } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { ArrowRight, DollarSign, TrendingUp, Ticket, AlertTriangle, Coins, ArrowLeftRight, Wallet } from 'lucide-react';

interface TradePanelProps {
  market: Market;
  metricType: MetricType;
  metricData: MetricData;
  userTickets: number;
  themeColor?: string; // e.g. 'bg-blue-500'
}

export const TradePanel: React.FC<TradePanelProps> = ({ market, metricType, metricData, userTickets, themeColor = 'bg-black' }) => {
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState<string>(mode === 'BUY' ? '10' : userTickets.toString());
  const [isSuccess, setIsSuccess] = useState(false);
  
  const ticketPriceUsd = metricData.ticketPrice / 100;
  
  useEffect(() => {
    if (mode === 'SELL') setAmount(userTickets > 0 ? userTickets.toString() : '0');
    else setAmount('10');
  }, [mode, userTickets]);

  const handleTrade = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  // Calculations
  const val = parseFloat(amount || '0');
  let estimatedTickets = 0;
  let estimatedCost = 0;
  let estimatedPayout = 0;

  if (mode === 'BUY') {
    estimatedCost = val;
    estimatedTickets = estimatedCost > 0 ? Math.floor(estimatedCost / ticketPriceUsd) : 0;
  } else {
    estimatedTickets = val;
    const sellPrice = ticketPriceUsd * 0.98; 
    estimatedPayout = estimatedTickets * sellPrice;
  }

  return (
    <div className={`bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white flex flex-col relative h-full overflow-visible`}>
      
      {/* TICKET HEADER TAB - The "Stub" */}
      <div className={`${themeColor} p-3 border-b-4 border-black dark:border-white text-white flex justify-between items-center`}>
          <div className="font-display text-lg uppercase">TRADING: {metricType}</div>
          <Ticket className="animate-pulse" />
      </div>

      {/* NOTCHES at the top header seam */}
      <div className="ticket-hole-left" style={{top: '54px'}}></div>
      <div className="ticket-hole-right" style={{top: '54px'}}></div>

      {/* MODE TABS */}
      <div className="flex border-b-4 border-black dark:border-white">
        <button 
            onClick={() => setMode('BUY')}
            className={`flex-1 py-3 font-mono font-bold uppercase transition-colors ${mode === 'BUY' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:bg-gray-200'}`}
        >
            BUY
        </button>
        <button 
            onClick={() => setMode('SELL')}
            className={`flex-1 py-3 font-mono font-bold uppercase transition-colors ${mode === 'SELL' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:bg-gray-200'}`}
        >
            SELL
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6 flex flex-col gap-6 flex-grow">
        
        {/* PRICE DISPLAY */}
        <div className="bg-gray-50 dark:bg-zinc-800 border-2 border-black dark:border-white p-3 flex justify-between items-center">
            <div>
                <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase">PRICE / TICKET</div>
                <div className="font-display text-2xl dark:text-white">${ticketPriceUsd.toFixed(2)}</div>
            </div>
             <div className="text-right">
                <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase">YOUR {metricType} BAG</div>
                <div className="font-mono font-bold text-xl dark:text-white">{userTickets} TIX</div>
            </div>
        </div>

        {/* INPUT */}
        <div>
           <label className="font-mono font-bold text-xs uppercase mb-2 block dark:text-white">
              {mode === 'BUY' ? 'AMOUNT TO SPEND ($)' : 'TICKETS TO DUMP'}
           </label>
           <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`
                    w-full border-4 border-black dark:border-white p-3 font-mono text-2xl focus:outline-none
                    focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all
                    ${mode === 'BUY' ? 'bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 dark:text-red-400'}
                `}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400">
                 {mode === 'BUY' ? 'USD' : 'TIX'}
              </div>
           </div>
        </div>

        {/* RECEIPT PREVIEW */}
        <div className="border-t-2 border-dashed border-gray-300 dark:border-zinc-700 pt-4 space-y-2">
            <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500 dark:text-gray-400">EST. QUANTITY</span>
                <span className="font-bold dark:text-white">{mode === 'BUY' ? estimatedTickets : estimatedTickets} TICKETS</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
                 <span className="text-gray-500 dark:text-gray-400">{mode === 'BUY' ? 'MAX PAYOUT' : 'CASH VALUE'}</span>
                 <span className={`font-bold text-lg ${mode === 'BUY' ? 'text-green-600' : 'text-black dark:text-white'}`}>
                    ${(mode === 'BUY' ? estimatedTickets * 1.00 : estimatedPayout).toFixed(2)}
                 </span>
            </div>
        </div>

        {/* EXECUTE BUTTON */}
        <BrutalistButton 
            className={`
                w-full py-4 text-xl flex justify-center items-center gap-2 mt-auto
                ${mode === 'BUY' ? 'bg-banger-green hover:bg-green-400' : 'bg-banger-pink hover:bg-pink-400 text-white'}
            `}
            onClick={handleTrade}
            disabled={parseFloat(amount) <= 0}
        >
            {mode === 'BUY' ? 'CONFIRM ORDER' : 'SELL NOW'} <ArrowRight strokeWidth={3} />
        </BrutalistButton>

      </div>

      {/* SUCCESS OVERLAY */}
      {isSuccess && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white animate-in fade-in p-6 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 border-white ${mode === 'BUY' ? 'bg-green-500' : 'bg-banger-pink'}`}>
             <Ticket size={40} />
          </div>
          <h3 className="font-display text-2xl uppercase mb-2">ORDER FILLED</h3>
          <p className="font-mono text-sm text-gray-400">You are now exposed to {metricType}</p>
        </div>
      )}
    </div>
  );
};
