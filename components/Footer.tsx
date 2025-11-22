
import React from 'react';
import { BangrLogo } from './BangrLogo';
import { Twitter, Github, Disc, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black dark:bg-black dark:border-t-4 dark:border-white text-white border-t-4 border-banger-yellow relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* BRAND */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1">
                 <BangrLogo className="w-10 h-10 text-black" />
              </div>
              <span className="font-display text-4xl uppercase">BANGR</span>
            </div>
            <p className="font-mono text-gray-400 max-w-sm">
              The world's first high-stakes prediction market for Twitter virality. 
              If it bangs, you bank. No bots, just pure signal.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white text-black p-2 hover:bg-banger-yellow transition-colors border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#ffffff]">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-white text-black p-2 hover:bg-banger-pink transition-colors border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#ffffff]">
                <Github size={20} />
              </a>
              <a href="#" className="bg-white text-black p-2 hover:bg-banger-cyan transition-colors border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#ffffff]">
                <Disc size={20} />
              </a>
            </div>
          </div>

          {/* LINKS */}
          <div className="space-y-4">
            <h4 className="font-display text-xl uppercase text-banger-green mb-4">Platform</h4>
            <ul className="space-y-2 font-mono text-sm text-gray-400">
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-yellow underline-offset-4">Spot Alpha</a></li>
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-yellow underline-offset-4">Trending Markets</a></li>
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-yellow underline-offset-4">Leaderboard</a></li>
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-yellow underline-offset-4">Connect Wallet</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-xl uppercase text-banger-pink mb-4">Legal / Info</h4>
            <ul className="space-y-2 font-mono text-sm text-gray-400">
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-pink underline-offset-4">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-pink underline-offset-4">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-pink underline-offset-4">How it Works</a></li>
              <li><a href="#" className="hover:text-white hover:underline decoration-2 decoration-banger-pink underline-offset-4">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t-2 border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="font-mono text-xs text-gray-600">
              © 2024 BANGR PROTOCOL. ALL RIGHTS RESERVED.
           </div>
           <div className="flex items-center gap-2 text-xs font-mono text-banger-yellow uppercase animate-pulse">
              <Zap size={12} fill="currentColor" />
              Powered by Gemini 2.5
           </div>
        </div>
      </div>
    </footer>
  );
};
