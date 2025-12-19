
import React from 'react';
import { Radar, Target, Zap } from 'lucide-react';

export const HypeRadar: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden border-l-4 border-black dark:border-white">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,255,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.2)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      
      {/* Scanner Circles */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 border-4 border-banger-green/30 rounded-full flex items-center justify-center">
        <div className="w-3/4 h-3/4 border-2 border-banger-green/20 rounded-full"></div>
        <div className="w-1/2 h-1/2 border-2 border-banger-green/10 rounded-full"></div>
        
        {/* The Sweeper */}
        <div className="absolute inset-0 rounded-full border-t-4 border-banger-green animate-[spin_4s_linear_infinite] opacity-50 shadow-[0_-10px_30px_rgba(0,255,0,0.3)]"></div>

        {/* Blips */}
        <div className="absolute top-10 right-20 w-3 h-3 bg-banger-yellow rounded-full animate-ping shadow-[0_0_10px_#ccff00]"></div>
        <div className="absolute bottom-20 left-10 w-2 h-2 bg-banger-pink rounded-full animate-pulse delay-700 shadow-[0_0_10px_#ff00ff]"></div>
        <div className="absolute top-1/2 left-20 w-4 h-4 bg-banger-cyan rounded-full animate-ping delay-300 shadow-[0_0_10px_#00ffff]"></div>
        
        {/* Center UI */}
        <div className="absolute z-10 bg-black border-2 border-banger-green p-3 flex flex-col items-center">
            <Radar className="text-banger-green mb-1 animate-pulse" size={24} />
            <div className="font-mono text-[10px] text-banger-green font-bold">SCANNING</div>
            <div className="font-display text-lg text-white">ALPHA</div>
        </div>
      </div>

      {/* Decorative Overlays */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-banger-green">
        LAT: 34.0522° N<br/>LONG: 118.2437° W
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
         <div className="bg-banger-green text-black font-mono text-[10px] font-bold px-2 py-1">SIGNAL: STRONG</div>
         <div className="bg-black border border-banger-green text-banger-green font-mono text-[10px] font-bold px-2 py-1">BPM: 142</div>
      </div>
    </div>
  );
};
