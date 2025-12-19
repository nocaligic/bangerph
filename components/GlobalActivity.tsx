
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Tag, Zap, TrendingUp, User } from 'lucide-react';

interface ActivityEvent {
  id: string;
  user: string;
  type: 'BUY' | 'CREATE' | 'WIN';
  market: string;
  amount?: string;
  time: string;
}

const INITIAL_EVENTS: ActivityEvent[] = [
  { id: '1', user: 'elon_musk', type: 'CREATE', market: 'Is Mars Real?', time: '2m ago' },
  { id: '2', user: 'sol_king', type: 'BUY', market: 'GTA 6 Leak', amount: '4.2k TIX', time: '1m ago' },
  { id: '3', user: 'intern_0x', type: 'BUY', market: 'Friday Deploy', amount: '150 TIX', time: 'Just now' },
];

export const GlobalActivity: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      const users = ['alpha_scout', 'whale_watcher', 'degengod', 'tweet_trader', '0x_banger'];
      const markets = ['GTA 6 Leak', 'Crypto Breakout', 'Ragebait Thread', 'Meme Alpha'];
      const types: ('BUY' | 'CREATE' | 'WIN')[] = ['BUY', 'BUY', 'CREATE', 'WIN'];
      
      const newEvent: ActivityEvent = {
        id: Math.random().toString(),
        user: users[Math.floor(Math.random() * users.length)],
        type: types[Math.floor(Math.random() * types.length)],
        market: markets[Math.floor(Math.random() * markets.length)],
        amount: Math.floor(Math.random() * 1000) + ' TIX',
        time: 'Just now'
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 5)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white dark:bg-black border-4 border-black dark:border-white h-full flex flex-col">
      <div className="bg-banger-cyan p-2 border-b-4 border-black dark:border-white font-display text-sm uppercase flex items-center justify-between text-black">
        <span>Global Pulse</span>
        <TrendingUp size={16} />
      </div>
      <div className="flex-grow overflow-hidden p-4 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3 animate-in slide-in-from-right duration-500">
            <div className={`p-2 border-2 border-black dark:border-white flex-shrink-0 ${
              event.type === 'CREATE' ? 'bg-banger-yellow' : 
              event.type === 'WIN' ? 'bg-banger-green' : 'bg-banger-pink'
            }`}>
              {event.type === 'CREATE' ? <Tag size={16} className="text-black"/> : 
               event.type === 'WIN' ? <Zap size={16} className="text-black"/> : <ShoppingCart size={16} className="text-white"/>}
            </div>
            <div className="min-w-0">
               <div className="font-mono text-[10px] font-bold dark:text-gray-400">
                @{event.user} • {event.time}
               </div>
               <div className="font-display text-xs uppercase truncate dark:text-white">
                {event.type === 'CREATE' ? 'CREATED MARKET' : event.type === 'WIN' ? 'CLAIMED WIN' : `BOUGHT ${event.amount}`}
               </div>
               <div className="font-mono text-[9px] text-gray-500 truncate">{event.market}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 font-mono text-[9px] text-center text-gray-500 uppercase tracking-widest">
        Live High-Frequency Stream
      </div>
    </div>
  );
};
