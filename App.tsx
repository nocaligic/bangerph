
import React, { useState, useRef, useEffect } from 'react';
import { useDegenMode } from './contexts/DegenContext';
import { Market, ViewState, MarketCategory } from './types';
import { MarketCard } from './components/MarketCard';
import { MarketDetail } from './components/MarketDetail';
import { LiveMarketDetail } from './components/LiveMarketDetail';
import { BrutalistButton } from './components/BrutalistButton';
import { ConnectedCreateMarketModal } from './components/ConnectedCreateMarketModal';
import { QuickTradeModal } from './components/QuickTradeModal';
import { BangrLogo } from './components/BangrLogo';
import { GlobalPulse } from './components/GlobalPulse';
import { TestnetBanner } from './components/TestnetBanner';
import { PortfolioPage } from './components/PortfolioPage';
import { LiveMarketCard } from './components/LiveMarketCard';
import { useWallet } from './lib/useWallet';
import { useMarkets } from './lib/contracts/useMarkets';
import { useUsdcBalance, useMintUsdc } from './lib/contracts/hooks';
import { Wallet, Plus, ArrowRight, Flame, LogOut, User, RefreshCw, Zap, Briefcase, ChevronDown, Coins, Check, Loader2 } from 'lucide-react';

const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    title: "Elon Alphabet Reform",
    description: "Speculation rising after his latest cryptic post.",
    volume: "$4.2M",
    endDate: "2d 14h",
    category: 'ALPHA',
    isHot: true,
    featuredMetric: 'VIEWS',
    metrics: {
      VIEWS: { target: 50000000, yesPrice: 72, noPrice: 28, progress: 82, vaultValue: 142000 },
      RETWEETS: { target: 150000, yesPrice: 45, noPrice: 55, progress: 40, vaultValue: 12000 },
      LIKES: { target: 800000, yesPrice: 60, noPrice: 40, progress: 65, vaultValue: 45000 },
      COMMENTS: { target: 50000, yesPrice: 30, noPrice: 70, progress: 25, vaultValue: 8000 }
    },
    tweet: {
      authorName: "Elon Musk",
      authorHandle: "elonmusk",
      avatarUrl: "https://picsum.photos/seed/elon/100/100",
      content: "Considering removing 'W' from the alphabet. It's just two 'V's anyway. Redundant.",
      timestamp: "2h",
      imageUrl: "https://picsum.photos/seed/tech/500/300"
    }
  },
  {
    id: '2',
    title: "Skibidi Movie Rumor",
    description: "Michael Bay rumors are circulating.",
    volume: "$1.1M",
    endDate: "14d",
    category: 'SHITPOST',
    featuredMetric: 'LIKES',
    metrics: {
      VIEWS: { target: 25000000, yesPrice: 40, noPrice: 60, progress: 15, vaultValue: 50000 },
      RETWEETS: { target: 100000, yesPrice: 30, noPrice: 70, progress: 10, vaultValue: 20000 },
      LIKES: { target: 1000000, yesPrice: 55, noPrice: 45, progress: 55, vaultValue: 800000 },
      COMMENTS: { target: 20000, yesPrice: 40, noPrice: 60, progress: 20, vaultValue: 15000 }
    },
    tweet: {
      authorName: "Film Updates",
      authorHandle: "filmupd",
      avatarUrl: "https://picsum.photos/seed/film/100/100",
      content: "RUMOR: Michael Bay is in talks to direct a live-action adaptation of 'Skibidi Toilet'.",
      timestamp: "10m",
      imageUrl: "https://picsum.photos/seed/skibidi/500/300"
    }
  }
];

export default function App() {
  const { degenMode, toggleDegenMode } = useDegenMode();
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [quickTrade, setQuickTrade] = useState<{ marketId: number; side: 'YES' | 'NO'; metricName: string } | null>(null);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const marketsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isConnected, shortAddress, connect, disconnect, address } = useWallet();

  // USDC Balance & Mint
  const { data: usdcBalanceData, refetch: refetchBalance } = useUsdcBalance(address as `0x${string}`);
  const { mint: mintUsdc, isPending: isMinting, isSuccess: mintSuccess } = useMintUsdc();
  const formattedBalance = usdcBalanceData
    ? (Number(usdcBalanceData) / 1e6).toFixed(2)
    : '0.00';

  // Fetch real markets from contract
  const { markets: liveMarkets, isLoading: isMarketsLoading, refetch: refetchMarkets } = useMarkets();

  // Keep mock markets for demo purposes if no real markets
  const [demoMarkets] = useState<Market[]>(MOCK_MARKETS);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refetch balance after mint
  useEffect(() => {
    if (mintSuccess) {
      refetchBalance();
    }
  }, [mintSuccess, refetchBalance]);

  const categories = ['ALL', 'SHITPOST', 'RAGEBAIT', 'ALPHA', 'DRAMA'];

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market);
    setSelectedMarketId(null);
    setView(ViewState.MARKET);
    window.scrollTo(0, 0);
  };

  const handleLiveMarketClick = (marketId: number) => {
    setSelectedMarketId(marketId);
    setSelectedMarket(null);
    setView(ViewState.MARKET);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setSelectedMarket(null);
    setSelectedMarketId(null);
    setView(ViewState.HOME);
    // Scroll to just above LIVE MARKETS section with some padding
    setTimeout(() => {
      if (marketsRef.current) {
        const rect = marketsRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - 20; // 20px offset above
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePortfolioClick = () => {
    setView(ViewState.PORTFOLIO);
    window.scrollTo(0, 0);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetchMarkets();
  };

  return (
    <div className={`min-h-screen transition-all duration-500 selection:bg-banger-pink selection:text-white pb-20 relative ${degenMode ? 'degen-mode' : 'bg-[#f0f0f0] text-black font-sans'}`}>

      {/* SCANLINE OVERLAY */}
      <div className="scanline"></div>

      {/* BACKGROUND SHAPES FOR DEGEN MODE */}
      <div className="degen-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* TOP MARQUEE */}
      <div className={`font-mono uppercase text-[10px] md:text-sm py-2 border-b-4 border-black overflow-hidden relative z-50 ${degenMode ? 'bg-striped-yellow text-black' : 'bg-banger-black text-banger-yellow'}`}>
        <div className="marquee-container">
          <div className="marquee-content font-bold">
            {degenMode
              ? '🔥 LIVE ACTION 🔥 MARKET UP 420% 🔥 VOLUME: $2M TRADED IN LAST HOUR 🔥 HOT: ELON TWEET AT 68% YES 🔥 NEW: DEGEN MODE ACTIVE 🔥 TRENDING: $BANGR 🔥'
              : '★ IF IT BANGS YOU BANK ★ ELON IS WATCHING ★ PREDICT THE HYPE ★ NFA BUT DEFINITELY FA ★ LOSE YOUR SAVINGS ★ OR GET RICH ★ DEGEN HOURS ONLY ★ NO BOTS JUST ALPHA ★ WAGMI OR NGMI ★ APE RESPONSIBLY ★'}
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className={`sticky top-0 z-50 border-b-4 border-black px-4 py-2 md:px-8 flex justify-between items-center shadow-lg h-[60px] md:h-[70px] transition-all duration-300 relative ${degenMode ? 'bg-banger-pink' : 'bg-white'}`}>
        <div className="flex items-center gap-3 group">
          <div className="flex items-center gap-3">
            <BangrLogo
              className="h-10 md:h-12 group-hover:rotate-12 transition-transform origin-center pointer-events-none"
            />
            <div className="font-display text-3xl md:text-5xl tracking-tighter pt-1 flex items-center">
              <span onClick={handleBackToHome} className="cursor-pointer">BANG</span>
              <span
                onClick={(e) => { e.stopPropagation(); toggleDegenMode(); }}
                className="cursor-pointer underline decoration-banger-pink decoration-4 underline-offset-4"
              >
                R
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 md:gap-4 items-center">
          {/* USDC Balance - Only when connected */}
          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 bg-white text-black font-mono text-sm px-4 py-2 border-4 border-black shadow-hard-sm">
              <span className="text-gray-400 font-bold">$</span>
              <span className="font-bold">{formattedBalance}</span>
              <span className="text-xs text-gray-500">USDC</span>
            </div>
          )}

          {/* Get Test USDC - Only when connected */}
          {isConnected && (
            <BrutalistButton
              size="sm"
              variant="secondary"
              className="hidden sm:flex items-center gap-2"
              onClick={() => mintUsdc('100')}
              disabled={isMinting}
            >
              {isMinting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  MINTING...
                </>
              ) : mintSuccess ? (
                <>
                  <Check size={14} />
                  SUCCESS!
                </>
              ) : (
                <>
                  <Coins size={14} />
                  GET 100 USDC
                </>
              )}
            </BrutalistButton>
          )}

          {/* Create Button */}
          <BrutalistButton size="sm" variant="outline" className="hidden sm:flex items-center gap-1" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={14} strokeWidth={3} /> CREATE
          </BrutalistButton>

          {isConnected ? (
            <div className="flex items-center gap-2">
              {/* Wallet Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="flex items-center gap-2 bg-banger-yellow text-black font-mono text-sm px-4 py-2 border-4 border-black shadow-hard-sm hover:bg-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <User size={16} strokeWidth={2.5} />
                  <span className="font-bold">{shortAddress}</span>
                  <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${walletDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {walletDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border-4 border-black shadow-hard overflow-hidden">
                    <button
                      onClick={() => {
                        handlePortfolioClick();
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left font-mono text-sm font-bold hover:bg-banger-yellow border-b-4 border-black transition-colors"
                    >
                      <Briefcase size={18} />
                      MY PORTFOLIO
                    </button>
                    <button
                      onClick={() => {
                        disconnect();
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left font-mono text-sm font-bold hover:bg-black hover:text-white text-red-600 transition-colors"
                    >
                      <LogOut size={18} />
                      DISCONNECT
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <BrutalistButton size="sm" className="flex items-center gap-1" onClick={connect}>
              <Wallet size={14} /> CONNECT
            </BrutalistButton>
          )}
        </div>
      </header>

      {/* TESTNET BANNER - Only shows when connected to BSC Testnet */}
      <TestnetBanner />

      {view === ViewState.HOME && (
        <>
          {/* COMPACT DASHBOARD HERO */}
          <section className={`grid grid-cols-1 lg:grid-cols-12 border-b-4 border-black transition-all duration-500 relative z-10 ${degenMode ? 'bg-transparent' : 'bg-white'}`}>
            <div className={`lg:col-span-7 p-6 md:p-12 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-black relative overflow-hidden ${degenMode ? 'bg-transparent' : 'bg-pattern-grid'}`}>
              <div className="relative z-10">
                <div className={`inline-block font-mono text-[10px] px-2 py-0.5 mb-4 transform -rotate-1 shadow-[2px_2px_0px_0px_#ecfd00] ${degenMode ? 'bg-white text-black border-2 border-black' : 'bg-black text-white'}`}>
                  TRADING PROTOCOL v1.0
                </div>
                <h1 className={`font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-[0.85] mb-6 tracking-tighter ${degenMode ? 'text-banger-yellow' : ''}`}>
                  BET ON <br />
                  <span className={degenMode ? 'text-white' : 'text-banger-pink'}>VIRAL</span> METRICS
                </h1>
                <p className={`font-mono text-xs md:text-sm max-w-md mb-8 border-l-4 pl-4 ${degenMode ? 'border-banger-yellow text-white' : 'border-banger-cyan text-gray-600'}`}>
                  The Nasdaq for Twitter. Spot viral content early, buy prediction tickets, and profit when the hype hits the target.
                </p>
                <div className="flex flex-wrap gap-4">
                  <BrutalistButton size="md" className="flex items-center gap-2" onClick={() => marketsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                    EXPLORE <ArrowRight size={18} />
                  </BrutalistButton>
                  <BrutalistButton size="md" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                    SPOT ALPHA
                  </BrutalistButton>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-black">
              <GlobalPulse />
            </div>
          </section>

          {/* STICKY FILTER BAR */}
          <div className={`sticky top-[60px] md:top-[70px] z-40 border-b-4 border-black pt-1 filter-bar-container ${degenMode ? '' : 'bg-[#f0f0f0]'}`}>
            <div className="flex gap-2 p-3 max-w-7xl mx-auto overflow-x-auto no-scrollbar relative z-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    font-mono font-bold text-[10px] md:text-xs px-4 py-1.5 border-2 border-black transition-all uppercase
                    ${activeCategory === cat
                      ? 'bg-black text-white shadow-[3px_3px_0px_0px_#ecfd00] -translate-y-0.5'
                      : 'bg-white text-black hover:bg-gray-100'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* MARKET GRID */}
          <main ref={marketsRef} className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-display text-3xl uppercase flex items-center gap-2">
                <Flame size={28} className="text-banger-pink" />
                {liveMarkets.length > 0 ? 'LIVE MARKETS' : 'DEMO MARKETS'}
              </h2>
              <button
                onClick={() => refetchMarkets()}
                className="flex items-center gap-1 text-sm font-mono text-gray-500 hover:text-black"
              >
                <RefreshCw size={14} className={isMarketsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {isMarketsLoading ? (
              <div className="text-center py-20">
                <RefreshCw className="mx-auto mb-4 animate-spin text-gray-400" size={48} />
                <p className="font-mono text-gray-500">Loading markets from contract...</p>
              </div>
            ) : liveMarkets.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0">
                {liveMarkets.map((market) => {
                  const METRIC_NAMES = ['VIEWS', 'LIKES', 'RETWEETS', 'COMMENTS'];
                  const metricName = METRIC_NAMES[market.metric] || 'VIEWS';
                  return (
                    <div key={market.id} className="break-inside-avoid mb-6">
                      <LiveMarketCard
                        market={market}
                        onClick={() => handleLiveMarketClick(market.id)}
                        onBuyYes={() => setQuickTrade({ marketId: market.id, side: 'YES', metricName })}
                        onBuyNo={() => setQuickTrade({ marketId: market.id, side: 'NO', metricName })}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-4 border-dashed border-gray-300 rounded-lg">
                <Zap className="mx-auto mb-4 text-gray-300" size={64} />
                <h3 className="font-display text-2xl text-gray-400 mb-2">NO LIVE MARKETS YET</h3>
                <p className="font-mono text-gray-500 mb-4">Be the first to create a market!</p>
                <BrutalistButton onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={16} /> CREATE FIRST MARKET
                </BrutalistButton>
              </div>
            )}
          </main>
        </>
      )}

      {view === ViewState.MARKET && selectedMarket && (
        <MarketDetail
          market={selectedMarket}
          onBack={handleBackToHome}
        />
      )}

      {view === ViewState.MARKET && selectedMarketId !== null && (
        <LiveMarketDetail
          marketId={selectedMarketId}
          onBack={handleBackToHome}
        />
      )}

      {view === ViewState.PORTFOLIO && (
        <PortfolioPage
          onBack={handleBackToHome}
          onNavigateToMarket={handleLiveMarketClick}
        />
      )}

      <ConnectedCreateMarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {quickTrade && (
        <QuickTradeModal
          isOpen={true}
          onClose={() => setQuickTrade(null)}
          marketId={quickTrade.marketId}
          initialSide={quickTrade.side}
          metricName={quickTrade.metricName}
        />
      )}
    </div>
  );
}
