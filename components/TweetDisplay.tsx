
import React from 'react';
import { Tweet } from '../types';
import { MessageSquare, Repeat, Heart, Share } from 'lucide-react';

interface TweetDisplayProps {
  tweet: Tweet;
  compact?: boolean;
  isQuote?: boolean;
  hideMetrics?: boolean;
}

export const TweetDisplay: React.FC<TweetDisplayProps> = ({ tweet, compact = false, isQuote = false, hideMetrics = false }) => {
  return (
    <div className={`
      flex flex-col gap-3
      ${isQuote ? 'mt-3 border-2 border-black p-3 bg-gray-50 rounded-none' : ''}
      ${!isQuote ? 'bg-white' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <img 
          src={tweet.avatarUrl} 
          alt={tweet.authorHandle}
          className={`
            border-2 border-black object-cover bg-gray-200
            ${compact || isQuote ? 'w-8 h-8' : 'w-10 h-10'}
            ${isQuote ? 'rounded-full' : 'rounded-none'}
          `}
        />
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="font-bold text-black font-mono text-sm">{tweet.authorName}</span>
            {tweet.authorName.toLowerCase().includes('elon') && (
               <span className="text-[10px] bg-blue-500 text-white px-1 rounded-sm">✔</span>
            )}
          </div>
          <span className="text-gray-500 font-mono text-xs">@{tweet.authorHandle} • {tweet.timestamp}</span>
        </div>
      </div>

      {/* Content */}
      <div className={`font-sans text-black whitespace-pre-wrap ${compact ? 'text-sm line-clamp-4' : 'text-base'}`}>
        {tweet.content}
      </div>

      {/* Image Attachment */}
      {tweet.imageUrl && (
        <div className="relative border-2 border-black overflow-hidden group">
           <img 
             src={tweet.imageUrl} 
             alt="Tweet attachment" 
             className="w-full object-cover max-h-[400px]"
           />
        </div>
      )}

      {/* Quote Tweet Recursion */}
      {tweet.quotedTweet && (
        <TweetDisplay tweet={tweet.quotedTweet} compact={true} isQuote={true} />
      )}

      {/* Footer Metrics (Only for main tweet) */}
      {!isQuote && !compact && !hideMetrics && (
        <div className="flex justify-between items-center text-gray-500 font-mono text-xs pt-2 border-t border-gray-200 mt-1">
          <div className="flex items-center gap-1 hover:text-banger-pink cursor-pointer transition-colors"><MessageSquare size={14} /> 420</div>
          <div className="flex items-center gap-1 hover:text-green-600 cursor-pointer transition-colors"><Repeat size={14} /> 69</div>
          <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors"><Heart size={14} /> 1.2k</div>
          <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors"><Share size={14} /></div>
        </div>
      )}
    </div>
  );
};
