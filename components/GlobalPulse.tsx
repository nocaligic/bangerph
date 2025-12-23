/**
 * GlobalPulse - Real-time global activity feed
 * Shows all trades and market creations across the platform
 */

import React from 'react';
import { ShoppingCart, Zap, Eye, Heart, Repeat2, MessageCircle } from 'lucide-react';
import { useGlobalActivity, GlobalActivityItem } from '../lib/contracts/useGlobalActivity';

// Metric colors matching the rest of the app
const METRIC_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f97316']; // Blue, Red, Green, Orange
const METRIC_NAMES = ['VIEWS', 'LIKES', 'RETWEETS', 'COMMENTS'];
const METRIC_ICONS = [Eye, Heart, Repeat2, MessageCircle];

export const GlobalPulse: React.FC = () => {
  const { data, isLoading } = useGlobalActivity();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatTarget = (value: string) => {
    const num = parseInt(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${Math.floor(num / 1000)}K`;
    return num.toString();
  };

  const renderActivityItem = (item: GlobalActivityItem, index: number) => {
    const metricColor = item.metric !== undefined ? METRIC_COLORS[item.metric] : '#00d4ff';
    const metricName = item.metric !== undefined ? METRIC_NAMES[item.metric] : '';
    const MetricIcon = item.metric !== undefined ? METRIC_ICONS[item.metric] : Eye;

    return (
      <div
        key={`${item.txHash}-${index}`}
        className="border-l-2 pl-2 animate-in slide-in-from-right duration-300"
        style={{ borderColor: metricColor }}
      >
        <div className="text-gray-500 text-[10px]">
          {formatAddress(item.user)} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {item.type === 'TRADE' ? (
          <>
            <div className="text-white flex items-center gap-1 uppercase font-bold text-[9px]">
              <ShoppingCart size={10} className="text-banger-pink" />
              BOUGHT {item.isYes ? (
                <span className="text-green-400">YES</span>
              ) : (
                <span className="text-red-400">NO</span>
              )} ${item.amount}
            </div>
            <div className="truncate text-[10px] flex items-center gap-1" style={{ color: metricColor }}>
              <MetricIcon size={10} />
              Market #{item.marketId}
            </div>
          </>
        ) : (
          <>
            <div className="text-white flex items-center gap-1 uppercase font-bold text-[9px]">
              <Zap size={10} className="text-banger-yellow fill-banger-yellow" />
              CREATED MARKET #{item.marketId}
            </div>
            <div className="truncate text-[10px] flex items-center gap-1" style={{ color: metricColor }}>
              <MetricIcon size={10} />
              Target: {formatTarget(item.targetValue || '0')} {metricName}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-black h-full flex flex-col font-mono text-xs overflow-hidden max-h-[500px]">
      {/* Header */}
      <div className="bg-white text-black p-2 font-display text-[10px] uppercase flex justify-between items-center border-b-2 border-black">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-banger-pink fill-banger-pink" />
          <span>BANGR Activity</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_6px_rgba(220,38,38,0.8)]"></div>
          <span className="text-red-600 font-bold">LIVE</span>
        </div>
      </div>

      {/* Activity Feed - Scrollable, fills remaining space */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto no-scrollbar">
        {isLoading && !data ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 text-[10px] animate-pulse">Loading activity...</div>
          </div>
        ) : data?.activity && data.activity.length > 0 ? (
          data.activity.map((item, index) => renderActivityItem(item, index))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-[10px]">
            <Zap size={24} className="mb-2 opacity-50" />
            <span>No activity yet</span>
            <span className="text-[9px] mt-1">Be the first to trade!</span>
          </div>
        )}
      </div>
    </div>
  );
};
