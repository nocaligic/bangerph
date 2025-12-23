/**
 * MetricBarChart - Simple bar chart comparing YES vs NO
 * Features:
 * - Two vertical bars side by side
 * - YES bar uses metric-specific color
 * - NO bar is black
 * - White background matching brutalist UI
 * - BANGR logo watermark
 */

import React from 'react';
import { Eye, Heart, Repeat2, MessageCircle } from 'lucide-react';

interface MetricBarChartProps {
    metricName: string;
    targetValue: string;
    yesPrice: number;  // AMM price from contract (in cents, e.g. 42 = 42¢ = 42%)
    noPrice: number;   // AMM price from contract (in cents, e.g. 57 = 57¢ = 57%)
    tradeCount?: number; // Optional trade count for volume display
}

// Metric colors mapping (Tailwind-equivalent hex for consistent branding)
const METRIC_COLORS: Record<string, string> = {
    VIEWS: '#3b82f6',      // Blue-500
    LIKES: '#ef4444',      // Red-500 (Hearts)
    RETWEETS: '#22c55e',   // Green-500
    COMMENTS: '#f97316',   // Orange-500
};

const METRIC_ICONS: Record<string, React.ReactNode> = {
    VIEWS: <Eye size={16} />,
    LIKES: <Heart size={16} />,
    RETWEETS: <Repeat2 size={16} />,
    COMMENTS: <MessageCircle size={16} />,
};

export const MetricBarChart: React.FC<MetricBarChartProps> = ({
    metricName,
    targetValue,
    yesPrice,
    noPrice,
    tradeCount = 0
}) => {
    // These are AMM prices from the contract, already in cents (which equals %)
    // e.g., 42¢ = 42% probability
    const currentYesPrice = yesPrice;
    const currentNoPrice = noPrice;
    const metricColor = METRIC_COLORS[metricName.toUpperCase()] || '#3b82f6';
    const metricIcon = METRIC_ICONS[metricName.toUpperCase()] || <Eye size={16} />;

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            {/* Header */}
            <div className="bg-white border-b-4 border-black p-4 flex justify-between items-center">
                <div>
                    <div className="font-mono text-gray-400 text-[10px] uppercase mb-0.5 tracking-wider">Market Sentiment</div>
                    <div className="font-display text-xl md:text-2xl text-black uppercase leading-tight">
                        Will it hit {targetValue} {metricName}?
                    </div>
                </div>
                {/* BANGR Logo */}
                <div className="bg-banger-yellow border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <img
                        src="/square-image.png"
                        alt="BANGR"
                        className="w-8 h-8 object-contain"
                    />
                </div>
            </div>

            {/* Chart Area */}
            <div className="p-6 md:p-10 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:20px_20px] relative overflow-hidden">
                {/* Background Text Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
                    <span className="text-[120px] font-black font-display uppercase -rotate-12 whitespace-nowrap">
                        {metricName} {metricName} {metricName}
                    </span>
                </div>

                {/* Always show chart since prices come from props */}
                {(
                    <div className="h-[300px] w-full flex relative z-10">
                        {/* Y-Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono font-bold text-black -translate-x-2 py-1">
                            <span>100</span>
                            <span>75</span>
                            <span className="text-banger-yellow bg-black px-1">50</span>
                            <span>25</span>
                            <span>0</span>
                        </div>

                        {/* Chart Grid & Content Container */}
                        <div className="flex-1 ml-10 border-l-4 border-b-4 border-black relative bg-white/40 backdrop-blur-[1px]">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div className="border-t border-gray-300 w-full" />
                                <div className="border-t border-gray-200 border-dashed w-full" />
                                <div className="border-t-2 border-black/20 w-full relative">
                                    <span className="absolute -right-16 top-1/2 -translate-y-1/2 font-mono text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Equilibrium</span>
                                </div>
                                <div className="border-t border-gray-200 border-dashed w-full" />
                                <div className="h-0 w-full" />
                            </div>

                            {/* Bars Container */}
                            <div className="absolute inset-0 flex items-end justify-around px-2 md:px-8">
                                {/* YES Bar */}
                                <div className="flex flex-col items-center group relative h-full justify-end pb-0">
                                    {/* Bar "Track" Background */}
                                    <div className="absolute bottom-0 w-16 md:w-24 h-full bg-gray-50 border-x border-gray-100 pointer-events-none -z-10" />

                                    <div
                                        className="w-16 md:w-24 border-4 border-black transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-x-1 group-hover:-translate-y-1"
                                        style={{
                                            height: `${Math.max(currentYesPrice, 2)}%`,
                                            backgroundColor: metricColor,
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                                        }}
                                    >
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-black/20 to-transparent" />

                                        {/* Value Label */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black border-2 border-black text-white px-3 py-1 text-xs font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 scale-90 group-hover:scale-100">
                                            {currentYesPrice}% YES
                                        </div>

                                        {currentYesPrice > 20 && (
                                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                                <span className="font-mono font-black text-xl md:text-3xl text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                    {currentYesPrice}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Labels */}
                                    <div className="absolute -bottom-14 flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-none border-2 border-black flex items-center justify-center mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: metricColor }}>
                                            <span className="text-white">{metricIcon}</span>
                                        </div>
                                        <span className="font-display text-[10px] font-black uppercase tracking-widest" style={{ color: metricColor }}>YES SIDE</span>
                                    </div>
                                </div>

                                {/* NO Bar */}
                                <div className="flex flex-col items-center group relative h-full justify-end pb-0">
                                    {/* Bar "Track" Background */}
                                    <div className="absolute bottom-0 w-16 md:w-24 h-full bg-gray-50 border-x border-gray-100 pointer-events-none -z-10" />

                                    <div
                                        className="w-16 md:w-24 bg-black border-4 border-black transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-x-1 group-hover:-translate-y-1"
                                        style={{
                                            height: `${Math.max(currentNoPrice, 2)}%`,
                                            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
                                        }}
                                    >
                                        {/* Value Label */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black border-2 border-black text-white px-3 py-1 text-xs font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 scale-90 group-hover:scale-100">
                                            {currentNoPrice}% NO
                                        </div>

                                        {currentNoPrice > 20 && (
                                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                                <span className="font-mono font-black text-xl md:text-3xl text-white">
                                                    {currentNoPrice}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Labels */}
                                    <div className="absolute -bottom-14 flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-none bg-black border-2 border-black flex items-center justify-center mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <span className="text-white text-xs font-bold">✕</span>
                                        </div>
                                        <span className="font-display text-[10px] font-black uppercase tracking-widest text-black/40">NO SIDE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Labels Padding */}
            <div className="h-16" />

            {/* Footer */}
            <div className="border-t-4 border-black p-3 flex justify-between items-center bg-white mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Live Activity Network</span>
                </div>
                <div className="font-mono text-[10px] font-bold text-black border-2 border-black px-2 py-0.5 bg-gray-100">
                    {tradeCount} TRADES
                </div>
            </div>
        </div>
    );
};
