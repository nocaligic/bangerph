
import React, { useState, useEffect, useMemo } from 'react';
import { Market, MetricType, Position } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { TradePanel } from './TradePanel';
import { TweetDisplay } from './TweetDisplay';
import { analyzeVirality, DetailedAnalysis } from '../services/geminiService';
import { BrainCircuit, Eye, Repeat, Heart, MessageCircle, Timer, TrendingUp, Activity, ArrowLeft, Info, Sparkles } from 'lucide-react';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  userPositions?: Position[];
}

const METRICS: MetricType[] = ['VIEWS', 'RETWEETS', 'LIKES', 'COMMENTS'];

const getMetricTheme = (type: MetricType) => {
  switch (type) {
    case 'VIEWS': return { 
      name: 'VIEWS', mainColor: 'bg-blue-500', borderColor: 'border-blue-500', textColor: 'text-blue-600 dark:text-blue-400', 
      lightBg: 'bg-blue-50', jaggedClass: 'jagged-blue', icon: <Eye size={20} />
    };
    case 'RETWEETS': return { 
      name: 'RETWEETS', mainColor: 'bg-green-500', borderColor: 'border-green-500', textColor: 'text-green-600 dark:text-green-400', 
      lightBg: 'bg-green-50', jaggedClass: 'jagged-green', icon: <Repeat size={20} />
    };
    case 'LIKES': return { 
      name: 'LIKES', mainColor: 'bg-red-500', borderColor: 'border-red-500', textColor: 'text-red-600 dark:text-red-400', 
      lightBg: 'bg-red-50', jaggedClass: 'jagged-red', icon: <Heart size={20} />
    };
    case 'COMMENTS': return { 
      name: 'COMMENTS', mainColor: 'bg-orange-500', borderColor: 'border-orange-500', textColor: 'text-orange-600 dark:text-orange-400', 
      lightBg: 'bg-orange-50', jaggedClass: 'jagged-orange', icon: <MessageCircle size={20} />
    };
  }
};

export const MarketDetail: React.FC<MarketDetailProps> = ({ market, onBack, userPositions = [] }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(market.featuredMetric);
  const [aiAnalysis, setAiAnalysis] = useState<{loading: boolean, result: DetailedAnalysis | null}>({ loading: false, result: null });
  const [trades, setTrades] = useState([
    { user: 'AuX9...tK21', type: 'BUY', amount: 500, price: 0.25, time: '2s ago' },
    { user: 'sol_chad69', type: 'BUY', amount: 1200, price: 0.26, time: '5s ago' },
  ]);
  
  const theme = getMetricTheme(selectedMetric);
  const activeMetricData = market.metrics[selectedMetric] || market.metrics['VIEWS'];

  const userTickets = useMemo(() => {
    const pos = userPositions.find(p => p.marketId === market.id && p.metricType === selectedMetric);
    return pos ? pos.shares : 0;
  }, [userPositions, market.id, selectedMetric]);

  useEffect(() => {
    runAiAnalysis();
  }, [market.id]);

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
      <div className="mb-6 flex items-center gap-4">
        <BrutalistButton size="sm" variant="outline" onClick={onBack} className="flex items-center gap-2 px-3">
             <ArrowLeft size={16} /> BACK
        </BrutalistButton>
        <div className="font-mono text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-2 border-2 border-black dark:border-white">
             ALPHA ID: {market.id.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Market Info */}
          <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white p-6">
            <div className="flex justify-between items-start border-b-4 border-black dark:border-white pb-4 mb-4">
                <h1 className="font-display text-3xl uppercase leading-none dark:text-white">{market.title}</h1>
                <div className="bg-banger-yellow px-2 py-1 border-2 border-black font-mono font-bold text-xs text-black flex items-center gap-1">
                    <Timer size={14} /> {market.endDate}
                </div>
            </div>
            <TweetDisplay tweet={market.tweet} hideMetrics={true} />
          </div>

          {/* AI NARRATIVE ANALYST */}
          <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white overflow-hidden">
             <div className="bg-banger-purple p-3 border-b-4 border-black dark:border-white flex items-center gap-2 text-white">
                <BrainCircuit size={20} />
                <span className="font-display text-lg uppercase">AI Narrative Context</span>
             </div>
             <div className="p-6">
                {aiAnalysis.loading ? (
                    <div className="flex flex-col items-center py-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 border-2 border-black dark:border-white rounded-full mb-2"></div>
                        <div className="font-mono text-xs uppercase dark:text-gray-400">Decoding cultural markers...</div>
                    </div>
                ) : aiAnalysis.result ? (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="bg-black dark:bg-white text-white dark:text-black p-4 border-2 border-black dark:border-white flex flex-col items-center justify-center min-w-[100px]">
                                <div className="font-mono text-[10px] uppercase opacity-60">HYPE</div>
                                <div className="font-display text-4xl text-banger-yellow dark:text-black">{aiAnalysis.result.hypeScore}</div>
                            </div>
                            <div className="flex-grow bg-gray-50 dark:bg-zinc-800 border-2 border-black dark:border-white p-4">
                                <div className="flex items-center gap-1 font-mono text-xs font-bold text-banger-purple mb-1">
                                    <Sparkles size={12} /> THE NARRATIVE
                                </div>
                                <p className="font-sans text-sm italic dark:text-white leading-relaxed">
                                    "{aiAnalysis.result.narrative}"
                                </p>
                            </div>
                        </div>
                        <div className="font-mono text-xs p-3 border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 dark:text-gray-400">
                           <span className="font-bold text-black dark:text-white uppercase mr-2">Traders Note:</span> 
                           {aiAnalysis.result.reasoning}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <BrutalistButton size="sm" onClick={runAiAnalysis} variant="secondary">RE-RUN AI SCAN</BrutalistButton>
                    </div>
                )}
             </div>
          </div>

          {/* Metric Selector */}
          <div className="space-y-2">
            <div className="font-display text-xl uppercase flex items-center gap-2 dark:text-white">
                Select Order Book
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {METRICS.map((metric) => {
                    const mTheme = getMetricTheme(metric);
                    const data = market.metrics[metric];
                    const isSelected = selectedMetric === metric;
                    return (
                        <button key={metric} onClick={() => setSelectedMetric(metric)}
                            className={`relative border-4 transition-all text-left p-3 h-28 flex flex-col justify-between
                                ${isSelected ? `border-black dark:border-white bg-white dark:bg-zinc-900 shadow-hard dark:shadow-hard-white -translate-y-2 z-10` 
                                : `border-transparent bg-gray-200 dark:bg-zinc-800 opacity-60 hover:opacity-100`}`}>
                            {isSelected && <div className={`absolute top-0 left-0 w-full h-2 ${mTheme.mainColor}`}></div>}
                            <div className={isSelected ? mTheme.textColor : 'text-gray-400'}>{mTheme.icon}</div>
                            <div>
                                <div className="font-mono text-[10px] font-bold uppercase mb-1 dark:text-gray-400">{mTheme.name}</div>
                                <div className={`font-display text-xl leading-none ${isSelected ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                                    {formatTarget(data.target)}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative">
                <div className="absolute top-2 left-2 w-full h-full bg-black dark:bg-white border-4 border-black dark:border-white border-b-0 jagged-bottom jagged-black z-0"></div>
                <div className={`relative ${theme.mainColor} border-4 border-black dark:border-white border-b-0 jagged-bottom ${theme.jaggedClass} z-10`}>
                    <div className="ticket-hole-left"></div>
                    <div className="ticket-hole-right"></div>
                    <div className="p-6 text-white text-center">
                        <div className="font-mono text-sm font-bold uppercase mb-2 border-b-2 border-white/30 pb-2 inline-block px-4">
                            {theme.name} PRIZE VAULT
                        </div>
                        <div className="font-display text-6xl drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            ${activeMetricData.vaultValue.toLocaleString()}
                        </div>
                    </div>
                    <div className="border-t-4 border-dashed border-black dark:border-white bg-white dark:bg-zinc-900 h-2"></div>
                    <div className="bg-white dark:bg-zinc-900 p-2 flex justify-between items-center font-mono text-xs font-bold px-6 pb-4 dark:text-white">
                        <span className="text-gray-500 dark:text-gray-400">FILL PROGRESS</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-3 border-2 border-black dark:border-white bg-gray-200 dark:bg-zinc-800">
                                <div className={`h-full ${theme.mainColor} border-r-2 border-black dark:border-white`} style={{width: `${activeMetricData.progress}%`}}></div>
                            </div>
                            <span>{activeMetricData.progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <TradePanel market={market} metricType={selectedMetric} metricData={activeMetricData} userTickets={userTickets} themeColor={theme.mainColor} />
        </div>
      </div>
    </div>
  );
};
