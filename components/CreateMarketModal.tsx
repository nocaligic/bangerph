
import React, { useState } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { generateMarketDetails, analyzeVirality } from '../services/geminiService';
import { Market, AnalysisResult, Tweet, MetricData, MetricType, MarketCategory } from '../types';
import { X, Twitter, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { TweetDisplay } from './TweetDisplay';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMarket: (market: Market) => void;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onCreateMarket }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tweetLink, setTweetLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{
    title: string;
    description: string;
    category: MarketCategory;
    tweet: Tweet;
    analysis: AnalysisResult;
  } | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!tweetLink.trim()) return;
    setLoading(true);
    
    // Simulate extracting text from a URL (In a real app, this would be a backend scraper)
    const simulatedTweetContent = tweetLink.includes('twitter.com') || tweetLink.includes('x.com') 
      ? `Simulated content for tweet at ${tweetLink}. Someone claims that Dogecoin is going to the moon because of a new meme.` 
      : tweetLink; // Fallback if user types text directly

    // Mock the tweet object
    const mockTweet: Tweet = {
        authorName: "Simulated User",
        authorHandle: "simulated_user",
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
        content: simulatedTweetContent,
        timestamp: "Just now",
        imageUrl: Math.random() > 0.7 ? `https://picsum.photos/seed/${Math.random()}/500/300` : undefined
    };

    // Run parallel AI tasks
