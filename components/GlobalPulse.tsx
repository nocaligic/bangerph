
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Tag, Zap } from 'lucide-react';

export const GlobalPulse: React.FC = () => {
  const [events, setEvents] = useState([
    { id: '1', user: 'anon_0x', type: 'BUY', market: 'Elon Alphabet', amount: '$420', time: 'Just now' },
    { id: '2', user: 'whale_1', type: 'CREATE', market: 'BTC Cross', time: '2m ago' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const users = ['scout', 'degen', 'intern', 'whale', 'trader'];
      const markets = ['Elon Reform', 'BTC Moon', 'NYT Drama', 'Meme Alpha'];
      const newEvent = {
        id: Math.random().toString(),
        user: users[Math.floor(Math.random() * users.length)] + '_' + Math.floor(Math.random() * 99),
        type: Math.random() > 0.3 ? 'BUY' : 'CREATE',
        market: markets[Math.floor(Math.random() * markets.length)],
        amount: '$' + (Math.floor(Math.random() * 500) + 10),
        time: 'Just now'
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 4)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black h-full flex flex-col font-mono text-xs overflow-hidden">
      <div className="bg-white text-black p-2 font-display text-[10px] uppercase flex justify-between items-center">
        <span>Global Activity</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
          LIVE
        </div>
      </div>
      <div className="p-3 space-y-3 flex-grow overflow-hidden">
        {events.map(e => (
          <div key={e.id} className="border-l-2 border-banger-cyan pl-2 animate-in slide-in-from-right">
            <div className="text-gray-500 text-[10px]">@{e.user} • {e.time}</div>
            <div className="text-white flex items-center gap-1 uppercase font-bold text-[9px]">
              {e.type === 'BUY' ? <ShoppingCart size={10} className="text-banger-pink" /> : <Tag size={10} className="text-banger-yellow" />}
              {e.type === 'BUY' ? `BOUGHT ${e.amount}` : `CREATED MARKET`}
            </div>
            <div className="text-banger-cyan truncate text-[10px]">{e.market}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
