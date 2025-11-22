
import React from 'react';
import { Tweet } from '../types';
import { MessageSquare, Repeat, Heart, Share, Play, ExternalLink } from 'lucide-react';

interface TweetDisplayProps {
  tweet: Tweet;
  compact?: boolean;
  isQuote?: boolean;
  hideMetrics?: boolean;
}

export const TweetDisplay: React.FC<TweetDisplayProps> = ({ tweet, compact = false, isQuote = false, hideMetrics = false }) => {
  
  // Helper to render media grid
  const renderMedia = () => {
    if (!tweet.media || tweet.media.length === 0) return null;

    // SINGLE MEDIA
    if (tweet.media.length === 1) {
      const item = tweet.media[0];
      return (
        <div className="relative border-2 border-black dark:border-white overflow-hidden group mt-3 bg-black w-full">
          {item.type === 'VIDEO' ? (
            <div className="relative aspect-video flex items-center justify-center bg-gray-900 w-full">
              <img src={item.url} className="w-full h-full object-cover opacity-80" alt="Video thumbnail" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-banger-yellow border-2 border-black rounded-full flex items-center justify-center pl-1 shadow-hard hover:scale-110 transition-transform">
                  <Play size={20} fill="black" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black text-white text-xs font-mono px-1 rounded">0:42</div>
            </div>
          ) : (
            <img 
              src={item.url} 
              alt="Tweet attachment" 
              className="w-full h-auto object-cover"
            />
          )}
        </div>
      );
    }

    // MULTI IMAGE GRID - REFINED FOR MASONRY
    return (
      <div className={`grid gap-0.5 border-2 border-black dark:border-white mt-3 overflow-hidden bg-black w-full ${
        tweet.media.length === 2 ? 'grid-cols-2' : 
        tweet.media.length >= 3 ? 'grid-cols-2' : 'grid-cols-1'
      }`}>
        {tweet.media.map((item, idx) => (
          <div key={idx} className={`relative bg-gray-200 dark:bg-zinc-800 w-full ${
            tweet.media && tweet.media.length === 3 && idx === 0 ? 'row-span-2 h-full' : 'aspect-square'
          }`}>
            <img 
              src={item.url} 
              alt={`Attachment ${idx}`}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
            {item.type === 'VIDEO' && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 bg-white border border-black rounded-full flex items-center justify-center pl-0.5">
                     <Play size={12} fill="black" />
                  </div>
               </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`
      flex flex-col w-full
      ${isQuote ? 'mt-3 border-2 border-black dark:border-zinc-400 p-3 bg-white dark:bg-zinc-900 rounded-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors' : ''}
      ${!isQuote ? 'bg-transparent' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img 
            src={tweet.avatarUrl} 
            alt={tweet.authorHandle}
            className={`
              border-2 border-black dark:border-white object-cover bg-gray-200 flex-shrink-0
              ${compact || isQuote ? 'w-8 h-8' : 'w-10 h-10'}
              ${isQuote ? 'rounded-full' : 'rounded-none'}
            `}
          />
          <div className="flex flex-col leading-tight min-w-0">
            <div className="flex items-center gap-1">
              <span className={`font-bold text-black dark:text-white font-mono truncate ${compact || isQuote ? 'text-xs' : 'text-sm'}`}>
                {tweet.authorName}
              </span>
              {tweet.authorName.toLowerCase().includes('elon') && (
                 <span className="text-[10px] bg-blue-500 text-white px-1 rounded-sm flex-shrink-0">✔</span>
              )}
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-mono text-[10px] truncate">@{tweet.authorHandle} • {tweet.timestamp}</span>
          </div>
        </div>
        {/* Twitter Icon / Link for visual flair */}
        {!isQuote && (
            <ExternalLink size={14} className="text-gray-300 dark:text-zinc-600 flex-shrink-0" />
        )}
      </div>

      {/* Content */}
      <div className={`font-sans text-black dark:text-white whitespace-pre-wrap break-words ${compact ? 'text-sm' : 'text-base'}`}>
        {tweet.content}
      </div>

      {/* Media Attachments */}
      {renderMedia()}

      {/* Quote Tweet Recursion */}
      {tweet.quotedTweet && (
        <TweetDisplay tweet={tweet.quotedTweet} compact={true} isQuote={true} />
      )}

      {/* Footer Metrics (Only for main tweet) */}
      {!isQuote && !compact && !hideMetrics && (
        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 font-mono text-xs pt-3 border-t border-gray-200 dark:border-zinc-800 mt-3">
          <div className="flex items-center gap-1 hover:text-banger-pink cursor-pointer transition-colors group">
              <div className="p-1 group-hover:bg-banger-pink/10 rounded-full"><MessageSquare size={16} /></div> 420
          </div>
          <div className="flex items-center gap-1 hover:text-green-600 cursor-pointer transition-colors group">
              <div className="p-1 group-hover:bg-green-100 rounded-full"><Repeat size={16} /></div> 69
          </div>
          <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors group">
               <div className="p-1 group-hover:bg-red-100 rounded-full"><Heart size={16} /></div> 1.2k
          </div>
          <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors group">
               <div className="p-1 group-hover:bg-blue-100 rounded-full"><Share size={16} /></div>
          </div>
        </div>
      )}
    </div>
  );
};
