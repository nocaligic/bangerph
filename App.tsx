
import React, { useState, useRef } from 'react';
import { Market, ViewState, Position } from './types';
import { MarketDetail } from './components/MarketDetail';
import { Portfolio } from './components/Portfolio';
import { BrutalistButton } from './components/BrutalistButton';
import { CreateMarketModal } from './components/CreateMarketModal';
import { BangrLogo } from './components/BangrLogo';
import { MarketCard } from './components/MarketCard';
import { Footer } from './components/Footer';
import { Wallet, Plus, ChevronDown, LayoutDashboard, Bell, Briefcase, DollarSign, Zap, LogOut, ArrowRight, Target, Radar, TrendingUp, Moon, Sun } from 'lucide-react';

// EXTENDED MOCK DATA TO SHOWCASE VARIATIONS
const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    title: "Video: GTA 6 Leak?",
    description: "Footage leaked. Is it real or AI? Market resolving on Rockstar confirmation.",
    volume: "$4.2M",
    endDate: "2d 14h",
    category: 'ALPHA',
    isHot: true,
    featuredMetric: 'VIEWS',
    metrics: {
      VIEWS: { target: 50000000, ticketPrice: 25, ticketsSold: 5000, vaultValue: 142069, progress: 82 },
      RETWEETS: { target: 150000, ticketPrice: 12, ticketsSold: 1000, vaultValue: 12500, progress: 40 },
      LIKES: { target: 800000, ticketPrice: 15, ticketsSold: 3000, vaultValue: 45000, progress: 65 },
      COMMENTS: { target: 50000, ticketPrice: 8, ticketsSold: 500, vaultValue: 8000, progress: 25 }
    },
    tweet: {
      authorName: "GamingLeaks",
      authorHandle: "leaks_central",
      avatarUrl: "https://picsum.photos/seed/gamer/100/100",
      content: "POSSIBLE GTA 6 GAMEPLAY LEAK?? 🚨\n\nSource sent me this. Physics look too good to be Unreal Engine 5. Thoughts?",
      timestamp: "2h",
      media: [
        { type: 'VIDEO', url: "https://picsum.photos/seed/gta/500/300" }
      ]
    }
  },
  {
    id: '2',
    title: "Chart Pattern Confirmation",
    description: "Technical analysis thread with 4 charts. Crypto twitter going wild.",
    volume: "$12.5M",
    endDate: "6h 30m",
    category: 'ALPHA',
    featuredMetric: 'RETWEETS',
    metrics: {
      VIEWS: { target: 1000000, ticketPrice: 50, ticketsSold: 1000, vaultValue: 50000, progress: 95 },
      RETWEETS: { target: 10000, ticketPrice: 45, ticketsSold: 20000, vaultValue: 890000, progress: 45 },
      LIKES: { target: 50000, ticketPrice: 30, ticketsSold: 500, vaultValue: 20000, progress: 80 },
      COMMENTS: { target: 5000, ticketPrice: 10, ticketsSold: 100, vaultValue: 1000, progress: 10 }
    },
    tweet: {
      authorName: "CryptoWhale",
      authorHandle: "whaletrades",
      avatarUrl: "https://picsum.photos/seed/whale/100/100",
      content: "THE PATTERN IS COMPLETE. 4 Timeframes confirming the breakout. \n\n1. Weekly\n2. Daily\n3. 4H\n4. Funding Rates\n\nSee attached charts 👇",
      timestamp: "15m",
      media: [
        { type: 'IMAGE', url: "https://picsum.photos/seed/chart1/400/300" },
        { type: 'IMAGE', url: "https://picsum.photos/seed/chart2/400/300" },
        { type: 'IMAGE', url: "https://picsum.photos/seed/chart3/400/300" },
        { type: 'IMAGE', url: "https://picsum.photos/seed/chart4/400/300" }
      ]
    }
  },
  {
    id: '3',
    title: "NYT Layoff Reaction (Quote)",
    description: "Classic quote tweet dunking on legacy media. Ragebait potential high.",
    volume: "$890k",
    endDate: "1d 2h",
    category: 'RAGEBAIT',
    isHot: true,
    featuredMetric: 'COMMENTS',
    metrics: {
      VIEWS: { target: 500000, ticketPrice: 5, ticketsSold: 1000, vaultValue: 5000, progress: 15 },
      RETWEETS: { target: 2000, ticketPrice: 5, ticketsSold: 400, vaultValue: 2000, progress: 10 },
      LIKES: { target: 10000, ticketPrice: 5, ticketsSold: 300, vaultValue: 1500, progress: 5 },
      COMMENTS: { target: 5000, ticketPrice: 15, ticketsSold: 1500, vaultValue: 28500, progress: 95 }
    },
    tweet: {
      authorName: "TechBro420",
      authorHandle: "accelerate",
      avatarUrl: "https://picsum.photos/seed/bro/100/100",
      content: "It's over. The legacy institutions cannot compete with pure signal. Learn to code.",
      timestamp: "4h",
      quotedTweet: {
        authorName: "NY Times",
        authorHandle: "nytimes",
        avatarUrl: "https://picsum.photos/seed/nyt/100/100",
        content: "Breaking: We are announcing a restructuring of our digital division. Approximately 15% of staff will be affected as we pivot to AI-first journalism.",
        timestamp: "5h",
        media: [
            { type: 'IMAGE', url: "https://picsum.photos/seed/nytbuilding/400/200"}
        ]
      }
    }
  },
  {
    id: '4',
    title: "Just Text / Shitpost",
    description: "One liner that might go viral purely on relatability.",
    volume: "$50k",
    endDate: "12h",
    category: 'SHITPOST',
    featuredMetric: 'LIKES',
    metrics: {
      VIEWS: { target: 100000, ticketPrice: 1, ticketsSold: 100, vaultValue: 1000, progress: 5 },
      RETWEETS: { target: 500, ticketPrice: 1, ticketsSold: 50, vaultValue: 500, progress: 2 },
      LIKES: { target: 5000, ticketPrice: 2, ticketsSold: 200, vaultValue: 2000, progress: 30 },
      COMMENTS: { target: 100, ticketPrice: 1, ticketsSold: 10, vaultValue: 100, progress: 1 }
    },
    tweet: {
      authorName: "intern",
      authorHandle: "intern",
      avatarUrl: "https://picsum.photos/seed/intern/100/100",
      content: "i am once again asking for you to deploy into production on a friday",
      timestamp: "30m"
    }
  }
];

const MOCK_POSITIONS: Position[] = [
  {
    id: 'pos1',
    marketId: '1',
    marketTitle: "Video: GTA 6 Leak?",
    marketCategory: 'ALPHA',
    metricType: 'VIEWS',
    side: 'LONG',
    shares: 500,
    avgPrice: 20,
    currentPrice: 25, 
    invested: 300 
  }
];

const USER_BALANCE = 4206.90;

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [markets, setMarkets] = useState<Market[]>(MOCK_MARKETS);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const marketsRef = useRef<HTMLDivElement>(null);
  const portfolioValue = MOCK_POSITIONS.reduce((sum, p) => sum + (p.shares * (p.currentPrice / 100)), 0);

  const filteredMarkets = activeCategory === 'ALL' 
    ? markets 
    : markets.filter(m => m.category === activeCategory);

  const categories = ['ALL', 'SHITPOST', 'RAGEBAIT', 'ALPHA', 'DRAMA'];

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market);
    setView(ViewState.MARKET);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setSelectedMarket(null);
    setView(ViewState.HOME);
    setTimeout(() => {
      marketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleConnectWallet = () => {
    if (!isWalletConnected) {
      const btn = document.getElementById('connect-btn');
      if (btn) btn.innerText = 'CONNECTING...';
      setTimeout(() => {
        setIsWalletConnected(true);
      }, 800);
    }
  };

  const handleDisconnect = () => {
    setIsWalletConnected(false);
    setIsWalletDropdownOpen(false);
    setView(ViewState.HOME);
  };

  const handleCreateMarket = (newMarket: Market) => {
    setMarkets([newMarket, ...markets]);
    setIsCreateModalOpen(false);
    handleMarketClick(newMarket);
  };

  const handleNavigateFromPortfolio = (marketId: string) => {
     const market = markets.find(m => m.id === marketId);
     if (market) {
       handleMarketClick(market);
     }
  };

  const toggleDarkMode = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#f0f0f0] dark:bg-zinc-900 text-black dark:text-white font-sans antialiased selection:bg-banger-pink selection:text-white flex flex-col transition-colors duration-200">
        
        {/* TOP MARQUEE */}
        <div className="bg-banger-black text-banger-yellow font-mono uppercase text-sm py-2 border-b-4 border-black dark:border-white overflow-hidden relative z-50">
          <div className="marquee-container">
            <div className="marquee-content font-bold">
              ★ IF IT BANGS, YOU BANK ★ PREDICT VIRALITY ★ SPOT THE ALPHA ★ PRINT THE MONEY ★ NO BOTS, JUST VIBES ★
              ★ IF IT BANGS, YOU BANK ★ PREDICT VIRALITY ★ SPOT THE ALPHA ★ PRINT THE MONEY ★ NO BOTS, JUST VIBES ★
            </div>
          </div>
        </div>

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white dark:bg-black border-b-4 border-black dark:border-white px-4 py-3 md:px-8 flex justify-between items-center shadow-lg h-[68px] md:h-[76px] transition-colors">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div 
              className="bg-banger-yellow border-2 border-black p-1 group-hover:rotate-12 transition-transform"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
            >
              <BangrLogo className="w-10 h-10 md:w-12 md:h-12 text-black" />
            </div>
            <div 
              className="font-display text-3xl md:text-5xl tracking-tighter hidden sm:block dark:text-white"
              onClick={handleBackToHome}
            >
              BANGR
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:block">
               <BrutalistButton size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                  <div className="flex items-center gap-2">
                    <Plus size={16} strokeWidth={4} />
                    SPOT ALPHA
                  </div>
               </BrutalistButton>
             </div>
             
             {isWalletConnected ? (
               <div className="flex items-center gap-4 md:gap-6">
                 {/* Stats Group (Desktop) */}
                 <div className="hidden md:flex items-center gap-4 mr-2">
                      <div className="flex items-center border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                          <div className="bg-banger-pink text-white px-2 py-1.5 font-mono text-[10px] md:text-xs font-bold border-r-2 border-black dark:border-white uppercase flex items-center gap-1">
                              <Briefcase size={14} className="stroke-[3px]" />
                              P&L
                          </div>
                          <div className="px-3 py-1.5 font-mono font-bold text-sm md:text-base min-w-[80px] text-center text-black dark:text-white">
                              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                      </div>

                      <div className="flex items-center border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                          <div className="bg-green-600 text-white px-2 py-1.5 font-mono text-[10px] md:text-xs font-bold border-r-2 border-black dark:border-white uppercase flex items-center gap-1">
                              <DollarSign size={14} className="stroke-[3px]" />
                              CASH
                          </div>
                          <div className="px-3 py-1.5 font-mono font-bold text-sm md:text-base min-w-[80px] text-center text-black dark:text-white">
                              ${USER_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                      </div>
                 </div>

                 {/* Wallet/Profile Dropdown Trigger */}
                 <div className="relative">
                    <button 
                      onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                      className="flex items-center gap-2 focus:outline-none"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-banger-pink via-banger-purple to-banger-cyan border-2 border-black dark:border-white shadow-hard-sm dark:shadow-hard-sm-white hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all rounded-full"></div>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isWalletDropdownOpen && (
                      <div className="absolute top-full right-0 mt-4 w-72 bg-white dark:bg-black border-4 border-black dark:border-white shadow-hard dark:shadow-hard-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b-4 border-black dark:border-white bg-banger-yellow text-black">
                           <div className="font-mono text-xs font-bold uppercase opacity-70">Connected Wallet</div>
                           <div className="font-mono font-bold truncate">Hit8...xQ29</div>
                        </div>
                        <button 
                          onClick={() => {
                            setView(ViewState.PORTFOLIO);
                            setIsWalletDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 font-mono font-bold hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border-b-2 border-black dark:border-white flex items-center gap-2 transition-colors group"
                        >
                          <LayoutDashboard size={16} className="group-hover:text-banger-yellow" /> MY BAGS
                        </button>
                        <button 
                          onClick={handleDisconnect}
                          className="w-full text-left px-4 py-3 font-mono font-bold hover:bg-banger-pink hover:text-white flex items-center gap-2 text-red-600 transition-colors"
                        >
                          <LogOut size={16} /> DISCONNECT
                        </button>
                      </div>
                    )}
                 </div>
               </div>
             ) : (
               <BrutalistButton size="sm" onClick={handleConnectWallet} id="connect-btn">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} />
                    CONNECT
                  </div>
               </BrutalistButton>
             )}
          </div>
        </header>

        <div className="flex-grow">
          {view === ViewState.HOME && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-black dark:border-white bg-white dark:bg-zinc-900">
                
                <div className="lg:col-span-7 border-b-4 lg:border-b-0 lg:border-r-4 border-black dark:border-white p-6 md:p-12 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none select-none">
                      <div className="font-display text-[200px] leading-none text-black dark:text-white whitespace-nowrap -ml-20">BANGR</div>
                  </div>

                  <div className="relative z-10">
                      <div className="inline-block bg-black dark:bg-white text-white dark:text-black font-mono text-xs px-3 py-1 mb-4 transform -rotate-2 shadow-[4px_4px_0px_0px_#ccff00]">
                        THE NASDAQ FOR TWITTER
                      </div>
                      {/* FIXED HEADLINE WITH IMPROVED DARK MODE TEXT RENDERING */}
                      <h1 className="font-display text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] mb-6 dark:text-white antialiased">
                        IF IT <span className="text-banger-pink drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-none">BANGS</span> <br/>
                        YOU <span className="text-banger-green drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-none">BANK</span>
                      </h1>
                      <div className="font-mono text-lg md:text-xl max-w-xl mb-8 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white p-4 shadow-hard-sm dark:shadow-hard-sm-white space-y-2">
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                           <li><span className="font-bold">SPOT ALPHA</span> - Identify viral tweets early.</li>
                           <li><span className="font-bold">MINT TICKETS</span> - Buy positions on the outcome.</li>
                           <li><span className="font-bold">PROFIT</span> - Cash out when the hype hits.</li>
                        </ol>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <BrutalistButton size="lg" className="flex items-center gap-2 text-xl h-16 px-10">
                          ENTER MARKETS <ArrowRight strokeWidth={3} />
                        </BrutalistButton>
                      </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-gray-100 dark:bg-zinc-950 relative flex flex-col min-h-[300px]">
                   <div className="flex-grow flex items-center justify-center p-8 text-center">
                      <div>
                          <div className="font-display text-6xl mb-2 text-gray-300 dark:text-zinc-700">LIVE FEED</div>
                          <div className="font-mono text-sm text-gray-400 dark:text-zinc-600">TRACKING GLOBAL HYPE...</div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="sticky top-[67px] md:top-[75px] z-40 bg-[#f0f0f0] dark:bg-zinc-900 border-b-4 border-black dark:border-white pt-1">
                <div className="flex gap-2 px-4 py-2 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`
                        font-mono font-bold text-sm px-6 py-2 border-2 border-black dark:border-white transition-all relative
                        ${activeCategory === cat 
                          ? 'bg-black text-white dark:bg-white dark:text-black -translate-y-1 shadow-[4px_4px_0px_0px_#ccff00] z-10' 
                          : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'}
                      `}
                    >
                      {cat}
                      {activeCategory === cat && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-banger-yellow rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative border-t-4 border-black dark:border-white bg-[#ebebeb] dark:bg-black min-h-screen">
                <main ref={marketsRef} className="max-w-7xl mx-auto px-6 md:px-8 py-16 scroll-mt-32 relative z-10 xl:pl-20 pb-24">
                  
                  {/* CHANGED TO MASONRY (CSS COLUMNS) FOR PINTEREST STYLE SPACING */}
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
                    {filteredMarkets.map((market) => (
                      <div key={market.id} className="break-inside-avoid pb-4">
                        <MarketCard 
                          market={market} 
                          onBet={handleMarketClick} 
                        />
                      </div>
                    ))}
                  </div>

                </main>
              </div>
            </>
          )}

          {view === ViewState.MARKET && selectedMarket && (
            <MarketDetail 
              market={selectedMarket} 
              onBack={handleBackToHome}
              userPositions={MOCK_POSITIONS} 
            />
          )}

          {view === ViewState.PORTFOLIO && (
            <Portfolio 
              positions={MOCK_POSITIONS}
              onNavigateMarket={handleNavigateFromPortfolio}
              onBrowse={handleBackToHome}
            />
          )}
        </div>
        
        <Footer />

        <CreateMarketModal
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          onCreateMarket={handleCreateMarket}
        />
      </div>
    </div>
  );
}
