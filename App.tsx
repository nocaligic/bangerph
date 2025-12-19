
import React, { useState, useRef } from 'react';
import { Market, ViewState, MarketCategory } from './types';
import { MarketCard } from './components/MarketCard';
import { MarketDetail } from './components/MarketDetail';
import { BrutalistButton } from './components/BrutalistButton';
import { CreateMarketModal } from './components/CreateMarketModal';
import { BangrLogo } from './components/BangrLogo';
import { GlobalPulse } from './components/GlobalPulse';
import { useWallet } from './lib/useWallet';
import { Wallet, Plus, ArrowRight, Flame, LogOut } from 'lucide-react';

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
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [markets, setMarkets] = useState<Market[]>(MOCK_MARKETS);
  const marketsRef = useRef<HTMLDivElement>(null);
  const { isConnected, shortAddress, connect, disconnect } = useWallet();

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
  };

  const handleCreateMarket = (newMarket: Market) => {
    setMarkets([newMarket, ...markets]);
    setIsCreateModalOpen(false);
    handleMarketClick(newMarket);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black font-sans selection:bg-banger-pink selection:text-white pb-20">

      {/* TOP MARQUEE */}
      <div className="bg-banger-black text-banger-yellow font-mono uppercase text-[10px] md:text-sm py-2 border-b-4 border-black overflow-hidden relative z-50">
        <div className="marquee-container">
          <div className="marquee-content font-bold">
            ★ IF IT BANGS YOU BANK ★ PREDICT THE HYPE ★ LOSE YOUR SAVINGS ★ OR GET RICH ★ NO BOTS JUST ALPHA ★ PREDICT THE HYPE ★
            ★ IF IT BANGS YOU BANK ★ PREDICT THE HYPE ★ LOSE YOUR SAVINGS ★ OR GET RICH ★ NO BOTS JUST ALPHA ★ PREDICT THE HYPE ★
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-4 py-2 md:px-8 flex justify-between items-center shadow-lg h-[60px] md:h-[70px]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBackToHome}>
          <div className="bg-banger-yellow border-2 border-black p-1 group-hover:rotate-12 transition-transform">
            <BangrLogo className="w-8 h-8 md:w-10 md:h-10 text-black" />
          </div>
          <div className="font-display text-2xl md:text-4xl tracking-tighter">
            BANGR
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <BrutalistButton size="sm" variant="outline" className="hidden sm:flex items-center gap-1" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={14} strokeWidth={3} /> CREATE
          </BrutalistButton>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="bg-banger-yellow text-black font-mono text-xs px-3 py-2 border-2 border-black">
                {shortAddress}
              </div>
              <BrutalistButton size="sm" variant="outline" className="flex items-center gap-1" onClick={disconnect}>
                <LogOut size={14} />
              </BrutalistButton>
            </div>
          ) : (
            <BrutalistButton size="sm" className="flex items-center gap-1" onClick={connect}>
              <Wallet size={14} /> CONNECT
            </BrutalistButton>
          )}
        </div>
      </header>

      {view === ViewState.HOME && (
        <>
          {/* COMPACT DASHBOARD HERO */}
          <section className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-black bg-white">
            <div className="lg:col-span-7 p-6 md:p-12 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-black relative overflow-hidden bg-pattern-grid">
              <div className="relative z-10">
                <div className="inline-block bg-black text-white font-mono text-[10px] px-2 py-0.5 mb-4 transform -rotate-1 shadow-[2px_2px_0px_0px_#ccff00]">
                  TRADING PROTOCOL v1.0
                </div>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-[0.85] mb-6 tracking-tighter">
                  BET ON <br />
                  <span className="text-banger-pink">VIRAL</span> METRICS
                </h1>
                <p className="font-mono text-xs md:text-sm max-w-md mb-8 border-l-4 border-banger-cyan pl-4 text-gray-600">
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
          <div className="sticky top-[60px] md:top-[70px] z-40 bg-[#f0f0f0] border-b-4 border-black pt-1">
            <div className="flex gap-2 p-3 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    font-mono font-bold text-[10px] md:text-xs px-4 py-1.5 border-2 border-black transition-all uppercase
                    ${activeCategory === cat
                      ? 'bg-black text-white shadow-[3px_3px_0px_0px_#ccff00] -translate-y-0.5'
                      : 'bg-white text-black hover:bg-gray-100'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* MARKET GRID - MASONRY */}
          <main ref={marketsRef} className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-display text-3xl uppercase flex items-center gap-2">
                <Flame size={28} className="text-banger-pink" /> Trending Alpha
              </h2>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {filteredMarkets.map((market) => (
                <div key={market.id} className="break-inside-avoid mb-6">
                  <MarketCard
                    market={market}
                    onBet={handleMarketClick}
                  />
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {view === ViewState.MARKET && selectedMarket && (
        <MarketDetail
          market={selectedMarket}
          onBack={handleBackToHome}
        />
      )}

      <CreateMarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMarket={handleCreateMarket}
      />
    </div>
  );
}
