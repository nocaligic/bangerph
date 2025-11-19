
export interface Tweet {
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  quotedTweet?: Tweet;
}

export type MetricType = 'VIEWS' | 'RETWEETS' | 'LIKES' | 'COMMENTS';

export interface MetricData {
  target: number; // The target number to hit (e.g., 1,000,000)
  yesPrice: number;
  noPrice: number;
}

export interface Market {
  id: string;
  title: string; // Kept for display, but usually derived from metric
  description: string; 
  tweet: Tweet;
  volume: string;
  endDate: string;
  category: 'TECH' | 'MEME' | 'POLITICS' | 'CRYPTO';
  isHot?: boolean;
  
  // New Multi-Metric Structure
  featuredMetric: MetricType; // The one shown on the card
  metrics: Record<MetricType, MetricData>;
}

export interface AnalysisResult {
  hypeScore: number;
  reasoning: string;
  verdict: 'BANG' | 'FLOP' | 'MID';
}

export enum ViewState {
  HOME = 'HOME',
  CREATE = 'CREATE',
  MARKET = 'MARKET',
}

export interface Trade {
  id: string;
  type: 'YES' | 'NO';
  amount: number;
  user: string;
  timestamp: Date;
}
