
import React, { useState, useEffect, useMemo } from 'react';
import { Market, MetricType, Position } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { TradePanel } from './TradePanel';
import { TweetDisplay } from './TweetDisplay';
import { analyzeVirality } from '../services/geminiService';
import { BrainCircuit, Eye, Repeat, Heart, MessageCircle, Timer, Lock, TrendingUp, Activity, User, ArrowLeft } from 'lucide-react';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  userPositions?: Position[];
}

const METRICS: MetricType[] = ['VIEWS', 'RETWEETS', 'LIKES', 'COMMENTS'];

// Expanded config to include Tailwind classes for borders/text/bg
const getMetricTheme = (type: MetricType) => {
  switch (type) {
    case 'VIEWS': return { 
      name: 'VIEWS',
      mainColor: 'bg-blue-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      lightBg: 'bg-blue-50',
      jaggedClass: 'jagged-blue',
      icon: <Eye size={20} />
    };
    case 'RETWEETS': return { 
      name: 'RETWEETS',
      mainColor: 'bg-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      lightBg: 'bg-green-50',
      jaggedClass: 'jagged-green',
      icon: <Repeat size={20} />
    };
    case 'LIKES': return { 
      name: 'LIKES',
      mainColor: 'bg-red-500',
      borderColor: 'border-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      lightBg: 'bg-red-50',
      jaggedClass: 'jagged-red',
      icon: <Heart size={20} />
    };
    case 'COMMENTS': return { 
      name: 'COMMENTS',
      mainColor: 'bg-orange-500',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      lightBg: 'bg-orange-50',
      jaggedClass: 'jagged-orange',
      icon: <MessageCircle size={20} />
    };
  }
};

const MOCK_TRADES = [
    { user: 'AuX9...tK21', type: 'BUY', amount: 500, price: 0.25, time: '2s ago' },
    { user: 'sol_chad69', type: 'BUY', amount: 1200, price: 0.26, time: '5s ago' },
    { user: 'paper_hands', type: 'SELL', amount: 200, price: 0.24, time: '12s ago' },
];

export const MarketDetail: React.FC<MarketDetailProps> = ({ market, onBack, userPositions = [] }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(market.featuredMetric);
  const [aiAnalysis, setAiAnalysis] = useState<{loading: boolean, result: any | null}>({ loading: false, result: null });
  const [trades, setTrades] = useState(MOCK_TRADES);
  
  const theme = getMetricTheme(selectedMetric);
  const activeMetricData = market.metrics[selectedMetric] || market.metrics['VIEWS'];

  const userTickets = useMemo(() => {
    const pos = userPositions.find(p => p.marketId === market.id && p.metricType === selectedMetric);
    return pos ? pos.shares : 0;
  }, [userPositions, market.id, selectedMetric]);

  // Live Feed Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        if (Math.random() > 0.6) {
            const types: ('BUY' | 'SELL')[] = ['BUY', 'BUY', 'SELL'];
            const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            const randomAddr = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            
            const newTrade = {
                user: `${randomAddr}...${randomAddr}`, 
                type: types[Math.floor(Math.random() * types.length)],
                amount: Math.floor(Math.random() * 1000) + 10,
                price: activeMetricData.ticketPrice / 100,
                time: 'Just now'
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 6)]);
        }
    }, 1500);
    return () => clearInterval(interval);
  }, [activeMetricData.ticketPrice]);

  const runAiAnalysis = async () => {
    setAiAnalysis({ loading: true, result: null });
    const data = await analyzeVirality(market.tweet.content);
    setAiAnalysis({ loading: false, result: data });
  };

  const formatTarget = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* TOP NAV */}
      <div className="mb-6 flex items-center gap-4">
        <BrutalistButton size="sm" variant="outline" onClick={onBack} className="flex items-center gap-2 px-3">
             <ArrowLeft size={16} /> BACK
        </BrutalistButton>
        <div className="font-mono text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-2 border-2 border-black dark:border-white">
             ID: {market.id}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: CONTENT & TABS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Market Info */}
          <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white p-6">
            <div className="flex justify-between items-start border-b-4 border-black dark:border-white pb-4 mb-4">
                <h1 className="font-display text-3xl uppercase leading-none dark:text-white">{market.title}</h1>
                <div className="flex flex-col items-end">
                     <div className="flex items-center gap-2 bg-banger-yellow px-2 py-1 border-2 border-black dark:border-white font-mono font-bold text-xs text-black">
                        <Timer size={14} /> {market.endDate}
                     </div>
                </div>
            </div>
            <TweetDisplay tweet={market.tweet} hideMetrics={true} />
          </div>

          {/* METRIC SELECTOR TABS */}
          <div className="space-y-2">
            <div className="font-display text-xl uppercase flex items-center gap-2 dark:text-white">
                Choose Your Fighter
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {METRICS.map((metric) => {
                    const mTheme = getMetricTheme(metric);
                    const data = market.metrics[metric];
                    const isSelected = selectedMetric === metric;
                    
                    return (
                        <button
                            key={metric}
                            onClick={() => setSelectedMetric(metric)}
                            className={`
                                relative border-4 transition-all duration-200 text-left p-3 h-28 flex flex-col justify-between group
                                ${isSelected 
                                    ? `border-black dark:border-white bg-white dark:bg-zinc-900 shadow-hard dark:shadow-hard-white -translate-y-2 z-10` 
                                    : `border-transparent bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100`
                                }
                            `}
                        >
                            {/* Top Bar if Selected */}
                            {isSelected && <div className={`absolute top-0 left-0 w-full h-2 ${mTheme.mainColor}`}></div>}
                            
                            <div className="flex items-center justify-between">
                                <div className={`${isSelected ? mTheme.textColor : ''}`}>
                                    {mTheme.icon}
                                </div>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></div>}
                            </div>

                            <div>
                                <div className="font-mono text-[10px] font-bold uppercase mb-1 dark:text-gray-300">{mTheme.name}</div>
                                <div className={`font-display text-xl leading-none ${isSelected ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                                    {formatTarget(data.target)}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
          </div>

          {/* BONDING CURVE (Themed) */}
          <div className={`border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white p-6 ${theme.lightBg} dark:bg-zinc-900`}>
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-xl uppercase flex items-center gap-2 dark:text-white">
                    <TrendingUp size={20} /> Bonding Curve
                </h3>
                <div className={`font-mono text-xs ${theme.mainColor} text-white px-2 py-1 border-2 border-black dark:border-white`}>
                    {selectedMetric} ONLY
                </div>
             </div>
             
             <div className="relative h-40 w-full border-l-2 border-b-2 border-black dark:border-white bg-white dark:bg-black overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(black_1px,transparent_1px)] dark:bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                <svg className="absolute bottom-0 left-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path d="M 0 160 Q 150 140 300 80 T 600 0" fill="none" stroke="currentColor" className="text-black dark:text-white" strokeWidth="4" vectorEffect="non-scaling-stroke" />
                    <circle cx="40%" cy="50%" r="6" className={`${theme.textColor} fill-current animate-ping`} />
                    <circle cx="40%" cy="50%" r="6" className="fill-black dark:fill-white" />
                </svg>
             </div>
          </div>
        </div>

        {/* RIGHT: TRADE TERMINAL */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* COLOR-CODED VAULT TICKET */}
            {/* Shadow layer for jagged effect */}
            <div className="relative">
                <div className="absolute top-2 left-2 w-full h-full bg-black dark:bg-white border-4 border-black dark:border-white border-b-0 jagged-bottom jagged-black z-0"></div>
                
                <div className={`relative ${theme.mainColor} border-4 border-black dark:border-white border-b-0 jagged-bottom ${theme.jaggedClass} z-10`}>
                    {/* Ticket Notches */}
                    <div className="ticket-hole-left"></div>
                    <div className="ticket-hole-right"></div>
                    
                    <div className="p-6 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pattern-dots"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-2 font-mono text-sm font-bold uppercase mb-2 border-b-2 border-white/30 pb-2 inline-block px-4">
                                {theme.icon} {theme.name} VAULT
                            </div>
                            {/* FORCE BLACK DROP SHADOW IN BOTH LIGHT AND DARK MODES FOR WHITE TEXT ON COLOR */}
                            <div className="font-display text-6xl drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                ${activeMetricData.vaultValue.toLocaleString()}
                            </div>
                            <div className="mt-2 font-mono text-xs bg-black/20 inline-block px-2 rounded">
                                PAYOUT IF TARGET HIT
                            </div>
                        </div>
                    </div>
                    
                    {/* Dashed Divider */}
                    <div className="border-t-4 border-dashed border-black dark:border-white bg-white dark:bg-zinc-900 h-2"></div>
                    
                    <div className="bg-white dark:bg-zinc-900 p-2 flex justify-between items-center font-mono text-xs font-bold px-6 pb-4 dark:text-white">
                        <span className="text-gray-500 dark:text-gray-400">PROGRESS</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-3 border-2 border-black dark:border-white bg-gray-200 dark:bg-zinc-800">
                                <div className={`h-full ${theme.mainColor} border-r-2 border-black dark:border-white`} style={{width: `${activeMetricData.progress}%`}}></div>
                            </div>
                            <span>{activeMetricData.progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE FEED */}
            <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white">
                <div className="bg-black dark:bg-white text-white dark:text-black p-2 flex justify-between items-center font-mono text-xs font-bold px-4">
                    <span className="flex items-center gap-2"><Activity size={14} /> LIVE {selectedMetric} TRADES</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="h-32 overflow-hidden relative">
                    {trades.map((trade, i) => (
                        <div key={i} className="flex justify-between items-center px-4 py-1.5 border-b border-gray-100 dark:border-zinc-800 font-mono text-[10px] dark:text-gray-300">
                            <span className="font-bold">{trade.user}</span>
                            <span className={trade.type === 'BUY' ? 'text-green-600' : 'text-red-600'}>
                                {trade.type} {trade.amount}
                            </span>
                        </div>
                    ))}
                    <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent"></div>
                </div>
            </div>

            {/* THEMED TRADE PANEL */}
            <div className="flex-grow">
                <TradePanel 
                    market={market} 
                    metricType={selectedMetric} 
                    metricData={activeMetricData} 
                    userTickets={userTickets}
                    themeColor={theme.mainColor}
                />
            </div>

        </div>
      </div>
    </div>
  );
};
