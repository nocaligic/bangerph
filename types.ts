
export interface TweetMedia {
  type: 'IMAGE' | 'VIDEO';
  url: string;
}

export interface Tweet {
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  media?: TweetMedia[]; // Replaces single imageUrl for flexibility
  quotedTweet?: Tweet;
  tweetId?: string;
}

export type MetricType = 'VIEWS' | 'RETWEETS' | 'LIKES' | 'COMMENTS';

export type MarketCategory = 'SHITPOST' | 'RAGEBAIT' | 'ALPHA' | 'DRAMA';

export interface MetricData {
  target: number; // The target number to hit (e.g., 1,000,000 views)
  ticketPrice: number; // Current price per ticket in cents (0 to 100)
  ticketsSold: number; // Total tickets in circulation
  vaultValue: number; // The $$ prize pool for this metric
  progress: number; // 0-100 percentage
}

export interface Market {
  id: string;
  title: string; 
  description: string; 
  tweet: Tweet;
  volume: string;
  endDate: string;
  category: MarketCategory;
  isHot?: boolean;
  
  featuredMetric: MetricType; 
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
  PORTFOLIO = 'PORTFOLIO',
}

export interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  marketCategory: MarketCategory;
  metricType: MetricType;
  side: 'LONG'; 
  shares: number;
  avgPrice: number; // cents
  currentPrice: number; // cents
  invested: number; // dollars
}
