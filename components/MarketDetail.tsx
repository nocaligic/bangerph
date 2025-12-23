
import React, { useState } from 'react';
import { Market, MetricType } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { TradePanel } from './TradePanel';
import { ConnectedTradePanel } from './ConnectedTradePanel';
import { TweetDisplay } from './TweetDisplay';
import { analyzeVirality } from '../services/geminiService';
import { useDegenMode } from '../contexts/DegenContext';
import { BrainCircuit, Users, Activity, Copy, Twitter, Eye, Repeat, Heart, MessageCircle, Clock, Trophy, Sparkles } from 'lucide-react';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
}


const getMetricConfig = (type: MetricType) => {
  switch (type) {
    case 'VIEWS': return { color: 'bg-blue-500', borderColor: 'border-blue-500', hover: 'hover:bg-blue-500', text: 'text-blue-600', label: 'VIEWS', icon: <Eye size={18} /> };
    case 'RETWEETS': return { color: 'bg-green-500', borderColor: 'border-green-500', hover: 'hover:bg-green-500', text: 'text-green-600', label: 'RETWEETS', icon: <Repeat size={18} /> };
    case 'LIKES': return { color: 'bg-red-500', borderColor: 'border-red-500', hover: 'hover:bg-red-500', text: 'text-red-600', label: 'LIKES', icon: <Heart size={18} /> };
    case 'COMMENTS': return { color: 'bg-orange-500', borderColor: 'border-orange-500', hover: 'hover:bg-orange-500', text: 'text-orange-600', label: 'COMMENTS', icon: <MessageCircle size={18} /> };
  }
};

export const MarketDetail: React.FC<MarketDetailProps> = ({ market, onBack }) => {
  const { degenMode } = useDegenMode();
  const selectedMetric = market.featuredMetric;
  const [aiAnalysis, setAiAnalysis] = useState<{ loading: boolean, result: any | null }>({ loading: false, result: null });
  const [copied, setCopied] = useState(false);

  const activeMetricData = market.metrics[selectedMetric];
  const activeConfig = getMetricConfig(selectedMetric);

  const runAiAnalysis = async () => {
    setAiAnalysis({ loading: true, result: null });
    const data = await analyzeVirality(market.tweet.content);
    setAiAnalysis({ loading: false, result: data });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulated Chart Data (SVG Polyline)
  const generateChartPoints = () => {
    let points = "0,100 ";
    let y = 100;
    // Add randomness based on metric to make them look different
    const seed = selectedMetric.length;
    for (let i = 1; i <= 100; i += 5) {
      y = Math.max(10, Math.min(140, y + (Math.random() * 40 - 20) + (seed % 2 === 0 ? 5 : -5)));
      points += `${i * 8},${y} `;
    }
    return points;
  };

  const chartPoints = React.useMemo(() => generateChartPoints(), [market.id, selectedMetric]);

  const formatTarget = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500 relative z-10 ${degenMode ? 'degen-mode' : ''}`}>
      {/* Breadcrumb Nav */}
      <nav className={`flex items-center gap-2 mb-8 font-mono text-sm px-4 py-2 border-2 border-black inline-flex transition-colors ${degenMode ? 'bg-[#ff00ff] text-black shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-gray-500 shadow-hard-sm'}`}>
        <button onClick={onBack} className={`hover:underline underline-offset-4 decoration-2 ${degenMode ? 'text-black decoration-white' : 'hover:text-black decoration-banger-pink'}`}>HOME</button>
        <span className={degenMode ? 'text-white' : ''}>/</span>
        <span className={`font-bold truncate max-w-[200px] ${degenMode ? 'text-black' : 'text-black'}`}>{market.category}</span>
        <span className={degenMode ? 'text-white' : ''}>/</span>
        <span className={`truncate max-w-[200px] ${degenMode ? 'text-white' : ''}`}>{market.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Info & Chart (8 cols) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Header Block */}
          <div className={`border-4 border-black p-6 md:p-8 relative transition-all ${degenMode ? 'bg-white shadow-[12px_12px_0px_0px_#000] text-black' : 'bg-white shadow-hard'}`}>
            {degenMode && (
              <>
                <div className="absolute top-[-30px] right-20 animate-bounce text-[#ecfd00] opacity-80"><Trophy size={64} /></div>
                <div className="absolute top-10 left-[-20px] animate-pulse text-[#00ffff] opacity-60"><Sparkles size={48} /></div>
              </>
            )}
            <div className={`absolute -top-4 -right-4 border-4 border-black px-4 py-2 font-mono font-bold text-sm shadow-hard-sm transform rotate-2 z-10 transition-colors ${degenMode ? 'bg-[#ff00ff] text-white' : 'bg-banger-yellow text-black'}`}>
              ENDS {market.endDate}
            </div>

            <h1 className={`font-display text-3xl md:text-4xl lg:text-5xl uppercase leading-[0.9] mb-6 border-b-4 border-black pb-4 ${degenMode ? 'text-black' : 'text-black'}`}>
              {market.title}
            </h1>

            {/* The Tweet */}
            <div className={`border-4 border-black p-4 transition-colors ${degenMode ? 'bg-[#f0f0f0]' : 'bg-gray-50'}`}>
              <div className={`font-mono text-xs font-bold mb-2 uppercase ${degenMode ? 'text-[#ff00ff]' : 'text-gray-400'}`}>Market Source</div>
              <TweetDisplay tweet={market.tweet} hideMetrics={true} />
            </div>

            <div className="flex gap-4 pt-4 mt-4">
              <div className={`flex items-center gap-2 font-mono text-sm font-bold ${degenMode ? 'text-black' : ''}`}>
                <Users size={16} className={degenMode ? 'text-[#ff00ff]' : ''} /> <span className={degenMode ? 'text-gray-600' : 'text-gray-600'}>Vol:</span> {market.volume}
              </div>
            </div>
          </div>

          {/* CHART SECTION */}
          <div className={`border-4 border-black relative z-0 transition-all ${degenMode ? 'bg-[#2d1b54] shadow-[12px_12px_0px_0px_#000]' : 'bg-white shadow-hard'}`}>
            <div className={`p-4 border-b-4 border-black flex justify-between items-center transition-colors ${degenMode ? 'bg-[#00ffaa]' : 'bg-gray-50'}`}>
              <div className="flex flex-col">
                <span className={`font-mono text-xs uppercase ${degenMode ? 'text-black font-bold' : 'text-gray-500'}`}>Predicting</span>
                <h3 className={`font-display text-xl uppercase ${degenMode ? 'text-black drop-shadow-[1px_1px_0px_#fff]' : activeConfig.text}`}>
                  Will it hit {formatTarget(activeMetricData.target)} {activeConfig.label}?
                </h3>
              </div>
              <div className={`font-mono text-xs px-2 py-1 flex items-center gap-1 border-2 border-black transition-colors ${degenMode ? 'bg-[#ff00ff] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-green-100 text-green-800 border-green-800'}`}>
                <Activity size={12} /> +12.4% (24H)
              </div>
            </div>

            <div className="h-80 w-full bg-banger-black relative overflow-hidden p-0">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-6 gap-0 pointer-events-none opacity-10">
                <div className="border-r border-white h-full"></div>
                <div className="border-r border-white h-full"></div>
                <div className="border-r border-white h-full"></div>
                <div className="border-r border-white h-full"></div>
                <div className="border-r border-white h-full"></div>
                <div className="border-r border-white h-full"></div>
              </div>

              <svg className="w-full h-full" viewBox="0 0 800 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={selectedMetric === 'VIEWS' ? '#3b82f6' : selectedMetric === 'RETWEETS' ? '#22c55e' : selectedMetric === 'LIKES' ? '#ef4444' : '#f97316'} stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="url(#chartGradient)"
                  stroke={selectedMetric === 'VIEWS' ? '#3b82f6' : selectedMetric === 'RETWEETS' ? '#22c55e' : selectedMetric === 'LIKES' ? '#ef4444' : '#f97316'}
                  strokeWidth="4"
                  points={`${chartPoints} 800,150 0,150`}
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  fill="none"
                  stroke={selectedMetric === 'VIEWS' ? '#3b82f6' : selectedMetric === 'RETWEETS' ? '#22c55e' : selectedMetric === 'LIKES' ? '#ef4444' : '#f97316'}
                  strokeWidth="4"
                  points={chartPoints}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="absolute bottom-4 right-4 font-mono text-xs text-banger-yellow animate-pulse">
                ● LIVE FEED
              </div>
            </div>
          </div>

          {/* AI ORACLE SECTION */}
          <div className={`border-4 border-black shadow-hard p-6 md:p-8 text-white relative overflow-hidden group transition-all ${degenMode ? 'bg-[#2d1b54]' : 'bg-banger-purple'}`}>
            <div className={`absolute -right-10 -bottom-10 opacity-20 transform group-hover:scale-110 transition-transform duration-700 ${degenMode ? 'text-[#ff00ff]' : ''}`}>
              <BrainCircuit size={200} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 border-2 border-black ${degenMode ? 'bg-[#ecfd00] text-black' : 'bg-white text-banger-purple'}`}>
                  <BrainCircuit size={24} />
                </div>
                <h3 className={`font-display text-3xl uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] ${degenMode ? 'text-[#00ffff]' : 'text-banger-yellow'}`}>
                  AI Vibe Check
                </h3>
              </div>

              <p className={`font-mono text-sm mb-6 max-w-lg leading-relaxed ${degenMode ? 'text-white' : ''}`}>
                Not sure where to put your chips? Our Gemini-powered oracle analyzes the timeline sentiment, meme velocity, and cultural impact.
              </p>

              {!aiAnalysis.result && (
                <BrutalistButton
                  onClick={runAiAnalysis}
                  disabled={aiAnalysis.loading}
                  className="bg-white text-black hover:bg-banger-cyan border-white"
                >
                  {aiAnalysis.loading ? "COMMUNING WITH THE MACHINE..." : "RUN ANALYSIS"}
                </BrutalistButton>
              )}

              {aiAnalysis.result && (
                <div className="bg-white text-black border-4 border-black p-5 animate-[pop_0.3s_ease-out] shadow-hard">
                  <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-3">
                    <span className="font-mono font-bold uppercase text-sm text-gray-500">Verdict</span>
                    <span className={`font-display text-3xl ${aiAnalysis.result.verdict === 'BANG' ? 'text-green-600' : 'text-red-600'
                      }`}>{aiAnalysis.result.verdict}</span>
                  </div>
                  <div className="font-mono text-sm mb-4 italic bg-gray-100 p-2 border-l-4 border-black">
                    "{aiAnalysis.result.reasoning}"
                  </div>
                  <div className="w-full bg-gray-300 h-6 border-2 border-black relative">
                    <div
                      className="h-full bg-gradient-to-r from-banger-pink to-banger-purple border-r-2 border-black transition-all duration-1000"
                      style={{ width: `${aiAnalysis.result.hypeScore}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-white mix-blend-difference">
                      HYPE SCORE: {aiAnalysis.result.hypeScore}/100
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Trading Panel & Social (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">

            {/* 
              If this is a contract market (numeric ID), use ConnectedTradePanel
              Otherwise fall back to mock TradePanel for demo markets
            */}
            {!isNaN(Number(market.id)) ? (
              <ConnectedTradePanel
                marketId={Number(market.id)}
                metricType={selectedMetric}
              />
            ) : (
              <TradePanel
                market={market}
                metricType={selectedMetric}
                metricData={activeMetricData}
              />
            )}

            {/* Share Section */}
            <div className={`bg-white border-4 border-black shadow-hard p-4 ${degenMode ? 'text-black' : ''}`}>
              <div className="font-display text-lg mb-3 uppercase">Spread the Hype</div>
              <div className="grid grid-cols-2 gap-3">
                <BrutalistButton
                  size="sm"
                  variant="outline"
                  className="w-full flex justify-center gap-2 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 border-black"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=Betting on ${market.title} on BANGR`, '_blank')}
                >
                  <Twitter size={18} fill="currentColor" /> TWEET
                </BrutalistButton>
                <BrutalistButton
                  size="sm"
                  variant="outline"
                  className="w-full flex justify-center gap-2"
                  onClick={handleCopyLink}
                >
                  {copied ? <span className="font-bold text-green-600">COPIED</span> : <><Copy size={18} /> LINK</>}
                </BrutalistButton>
              </div>
            </div>

            {/* Activity Feed */}
            <div className={`bg-white border-4 border-black shadow-hard p-4 max-h-60 overflow-y-auto ${degenMode ? 'text-black font-bold' : ''}`}>
              <h4 className={`font-mono font-bold text-xs mb-3 uppercase flex items-center gap-2 ${degenMode ? 'text-black' : 'text-gray-500'}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Activity
              </h4>
              <div className="space-y-3 font-mono text-xs">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 border-b border-gray-200 pb-2 last:border-0">
                    <div className="w-6 h-6 bg-gray-200 border border-black rounded-full"></div>
                    <div className="flex-grow">
                      <span className={`font-bold ${degenMode ? 'text-black' : ''}`}>anon{Math.floor(Math.random() * 1000)}</span>
                      <span className={`mx-1 ${degenMode ? 'text-gray-700 font-bold' : 'text-gray-500'}`}>bought</span>
                      <span className={`font-bold ${Math.random() > 0.5 ? "text-green-600" : "text-red-500"}`}>
                        {Math.random() > 0.5 ? "YES" : "NO"}
                      </span>
                    </div>
                    <span className={`font-bold ${degenMode ? 'text-black font-mono bg-[#ecfd00] px-1' : ''}`}>${Math.floor(Math.random() * 500)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
