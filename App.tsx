import React, { useState, useRef } from 'react';
import { Market, ViewState, MetricType } from './types';
import { MarketCard } from './components/MarketCard';
import { MarketDetail } from './components/MarketDetail';
import { BrutalistButton } from './components/BrutalistButton';
import { CreateMarketModal } from './components/CreateMarketModal';
import { BangrLogo } from './components/BangrLogo';
import { Menu, Wallet, Globe, Plus } from 'lucide-react';

// Mock Data
const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    title: "Elon Alphabet Reform",
    description: "Speculation rising after his latest cryptic post.",
    volume: "$4.2M",
    endDate: "2d 14h",
    category: 'TECH',
    isHot: true,
    featuredMetric: 'VIEWS',
    metrics: {
      VIEWS: { target: 50000000, yesPrice: 72, noPrice: 28 },
      RETWEETS: { target: 150000, yesPrice: 45, noPrice: 55 },
      LIKES: { target: 800000, yesPrice: 60, noPrice: 40 },
      COMMENTS: { target: 50000, yesPrice: 30, noPrice: 70 }
    },
    tweet: {
      authorName: "Elon Musk",
      authorHandle: "elonmusk",
      avatarUrl: "https://picsum.photos/seed/elon/100/100",
      content: "Considering removing 'W' from the alphabet. It's just two 'V's anyway. Redundant. Efficiency is key.",
      timestamp: "2h",
      imageUrl: "https://picsum.photos/seed/tech/500/300"
    }
  },
  {
    id: '2',
    title: "Bitcoin Golden Cross",
    description: "Crypto twitter is going insane over this chart.",
    volume: "$12.5M",
    endDate: "180d",
    category: 'CRYPTO',
    featuredMetric: 'RETWEETS',
    metrics: {
      VIEWS: { target: 1000000, yesPrice: 90, noPrice: 10 },
      RETWEETS: { target: 10000, yesPrice: 45, noPrice: 55 },
      LIKES: { target: 50000, yesPrice: 88, noPrice: 12 },
      COMMENTS: { target: 5000, yesPrice: 50, noPrice: 50 }
    },
    tweet: {
      authorName: "CryptoWhale",
      authorHandle: "whaletrades",
      avatarUrl: "https://picsum.photos/seed/whale/100/100",
      content: "THE PATTERN IS COMPLETE. \n\nGolden cross on the weekly. If we break 90k, we teleport to 150k. 🚀🌚",
      timestamp: "15m",
      imageUrl: "https://picsum.photos/seed/chart/500/300"
    }
  },
  {
    id: '3',
    title: "NYT Layoff Reaction",
    description: "Quote tweet reacting to NYT layoffs.",
    volume: "$890k",
    endDate: "45d",
    category: 'POLITICS',
    isHot: true,
    featuredMetric: 'COMMENTS',
    metrics: {
      VIEWS: { target: 500000, yesPrice: 20, noPrice: 80 },
      RETWEETS: { target: 2000, yesPrice: 15, noPrice: 85 },
      LIKES: { target: 10000, yesPrice: 25, noPrice: 75 },
      COMMENTS: { target: 5000, yesPrice: 65, noPrice: 35 }
    },
    tweet: {
      authorName: "TechBro420",
      authorHandle: "accelerate",
      avatarUrl: "https://picsum.photos/seed/bro/100/100",
      content: "It's over. The legacy institutions cannot compete with pure signal.",
      timestamp: "4h",
      quotedTweet: {
        authorName: "NY Times",
        authorHandle: "nytimes",
        avatarUrl: "https://picsum.photos/seed/nyt/100/100",
        content: "Breaking: We are announcing a restructuring of our digital division...",
        timestamp: "5h"
      }
    }
  },
  {
    id: '4',
    title: "Skibidi Movie Rumor",
    description: "Michael Bay rumors are circulating.",
    volume: "$1.1M",
    endDate: "14d",
    category: 'MEME',
    featuredMetric: 'LIKES',
    metrics: {
      VIEWS: { target: 25000000, yesPrice: 40, noPrice: 60 },
      RETWEETS: { target: 100000, yesPrice: 30, noPrice: 70 },
      LIKES: { target: 1000000, yesPrice: 55, noPrice: 45 },
      COMMENTS: { target: 20000, yesPrice: 40, noPrice: 60 }
    },
    tweet: {
      authorName: "Film Updates",
      authorHandle: "filmupd",
      avatarUrl: "https://picsum.photos/seed/film/100/100",
      content: "RUMOR: Michael Bay is in talks to direct a live-action adaptation of 'Skibidi Toilet'. No, really.",
      timestamp: "10m",
      imageUrl: "https://picsum.photos/seed/skibidi/500/300"
    }
  },
  {
    id: '5',
    title: "Dril Corn Cob",
    description: "Testing the text-only rendering capabilities.",
    volume: "$50k",
    endDate: "1d",
    category: 'MEME',
    featuredMetric: 'RETWEETS',
    metrics: {
      VIEWS: { target: 100000, yesPrice: 99, noPrice: 1 },
      RETWEETS: { target: 5000, yesPrice: 50, noPrice: 50 },
      LIKES: { target: 20000, yesPrice: 95, noPrice: 5 },
      COMMENTS: { target: 1000, yesPrice: 10, noPrice: 90 }
    },
    tweet: {
      authorName: "dril",
      authorHandle: "wint",
      avatarUrl: "https://picsum.photos/seed/dril/100/100",
      content: "im not owned!  im not owned!!', i continue to insist as i slowly shrink and transform into a corn cob",
      timestamp: "12y"
    }
  }
];

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [markets, setMarkets] = useState<Market[]>(MOCK_MARKETS);
  
  // Ref for scrolling to markets
  const marketsRef = useRef<HTMLDivElement>(null);

  const filteredMarkets = activeCategory === 'ALL' 
    ? markets 
    : markets.filter(m => m.category === activeCategory);

  const categories = ['ALL', 'TECH', 'MEME', 'CRYPTO', 'POLITICS'];

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market);
    setView(ViewState.MARKET);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setSelectedMarket(null);
    setView(ViewState.HOME);
    // Smooth scroll to markets after state update
    setTimeout(() => {
      marketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCreateMarket = (newMarket: Market) => {
    setMarkets([newMarket, ...markets]);
    setIsCreateModalOpen(false);
    handleMarketClick(newMarket);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black font-sans selection:bg-banger-pink selection:text-white pb-20">
      
      {/* TOP MARQUEE */}
      <div className="bg-banger-black text-banger-yellow font-mono uppercase text-sm py-2 border-b-4 border-black overflow-hidden relative z-50">
        <div className="marquee-container">
          <div className="marquee-content font-bold">
            ★ WELCOME TO BANGR ★ PREDICT THE FUTURE ★ LOSE YOUR SAVINGS ★ OR GET RICH ★ ELON IS WATCHING ★ BANGR ★ PREDICT THE FUTURE ★
            ★ WELCOME TO BANGR ★ PREDICT THE FUTURE ★ LOSE YOUR SAVINGS ★ OR GET RICH ★ ELON IS WATCHING ★ BANGR ★ PREDICT THE FUTURE ★
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-4 py-3 md:px-8 flex justify-between items-center shadow-lg h-[68px] md:h-[76px]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBackToHome}>
          <div className="bg-banger-yellow border-2 border-black p-1 group-hover:rotate-12 transition-transform">
            <BangrLogo className="w-10 h-10 md:w-12 md:h-12 text-black" />
          </div>
          <div className="font-display text-3xl md:text-5xl tracking-tighter">
            BANGR
          </div>
        </div>

        <div className="hidden md:flex gap-4">
           <BrutalistButton size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
              <div className="flex items-center gap-2">
                <Plus size={16} strokeWidth={4} />
                CREATE MARKET
              </div>
           </BrutalistButton>
           <BrutalistButton size="sm">
              <div className="flex items-center gap-2">
                <Wallet size={16} />
                CONNECT
              </div>
           </BrutalistButton>
        </div>

        <button className="md:hidden p-2 border-2 border-black shadow-hard-sm active:translate-y-1 active:shadow-none bg-banger-yellow">
          <Menu size={24} />
        </button>
      </header>

      {view === ViewState.HOME && (
        <>
          {/* HERO SECTION */}
          <section className="relative px-4 py-12 md:py-20 border-b-4 border-black bg-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-banger-cyan rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-banger-pink rounded-full blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3"></div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
              <div className="flex justify-center mb-6">
                <BangrLogo className="w-24 h-24 md:w-32 md:h-32 text-black transform -rotate-6" />
              </div>
              <h1 className="font-display text-5xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 uppercase">
                Bet On <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-banger-pink to-banger-purple">Viral</span> Metrics
              </h1>
              <p className="font-mono text-lg md:text-xl max-w-2xl mx-auto mb-10 bg-white/50 backdrop-blur-sm border-2 border-black p-4 shadow-hard-sm transform rotate-1">
                Trade the outcome of tweet metrics. Views, Retweets, Likes, Comments.
                Built on <span className="font-bold text-yellow-600">BNB Chain</span>.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <BrutalistButton size="lg" className="flex items-center justify-center gap-3" onClick={() => marketsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                  <Globe /> EXPLORE MARKETS
                </BrutalistButton>
                <BrutalistButton size="lg" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                  PASTE TWEET TO START
                </BrutalistButton>
              </div>
            </div>
          </section>

          {/* CATEGORY FILTERS - Sticky Fix */}
          <div className="sticky top-[67px] md:top-[75px] z-40 bg-[#f0f0f0] border-b-4 border-black overflow-x-auto no-scrollbar pt-1">
            <div className="flex gap-2 p-4 min-w-max max-w-7xl mx-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    font-mono font-bold text-sm px-6 py-2 border-2 border-black transition-all
                    ${activeCategory === cat 
                      ? 'bg-black text-white shadow-[4px_4px_0px_0px_#ccff00] -translate-y-1' 
                      : 'bg-white text-black hover:bg-gray-100'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* MARKET GRID - MASONRY LAYOUT */}
          <main ref={marketsRef} className="max-w-7xl mx-auto px-6 md:px-8 py-12 scroll-mt-32">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-display text-4xl uppercase">Trending Stats</h2>
              <div className="hidden md:flex gap-2 items-center font-mono text-sm border-2 border-black px-3 py-1 bg-white">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                BNB CHAIN: CONNECTED
              </div>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
              {filteredMarkets.map((market) => (
                <div key={market.id} className="break-inside-avoid mb-10">
                  <MarketCard 
                    market={market} 
                    onBet={handleMarketClick} 
                  />
                </div>
              ))}
            </div>

            {/* LOAD MORE */}
            <div className="mt-16 text-center">
              <BrutalistButton variant="outline" className="w-full md:w-auto">
                LOAD MORE BANGERS
              </BrutalistButton>
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

      {/* FOOTER */}
      <footer className="bg-black text-white border-t-4 border-banger-yellow py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <BangrLogo className="w-12 h-12 text-white mb-4" />
            <div className="font-display text-4xl mb-2">BANGR</div>
            <p className="font-mono text-gray-400 text-sm">© 2024 BANGR INC. NO REFUNDS.</p>
          </div>
          <div className="flex gap-6 font-mono text-sm">
            <a href="#" className="hover:text-banger-yellow underline decoration-2 decoration-banger-pink underline-offset-4">TERMS</a>
            <a href="#" className="hover:text-banger-yellow underline decoration-2 decoration-banger-cyan underline-offset-4">PRIVACY</a>
            <a href="#" className="hover:text-banger-yellow underline decoration-2 decoration-banger-purple underline-offset-4">TWITTER</a>
          </div>
        </div>
      </footer>

      {/* MOBILE FAB */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-banger-pink text-white p-4 rounded-none border-4 border-black shadow-hard active:shadow-none active:translate-y-1 transition-all"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <CreateMarketModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMarket={handleCreateMarket}
      />
    </div>
  );
}