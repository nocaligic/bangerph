
export interface Tweet {
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  media?: Array<{ type: 'IMAGE' | 'VIDEO'; url: string }>;
  quotedTweet?: Tweet;
}

export type MetricType = 'VIEWS' | 'RETWEETS' | 'LIKES' | 'COMMENTS';
export type MarketCategory = 'SHITPOST' | 'RAGEBAIT' | 'ALPHA' | 'DRAMA';

export interface MetricData {
  target: number;
  yesPrice: number;
  noPrice: number;
  progress: number;
  vaultValue: number;
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
  narrative?: string;
}

export enum ViewState {
  HOME = 'HOME',
  MARKET = 'MARKET',
  PORTFOLIO = 'PORTFOLIO'
}

export interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  marketCategory: MarketCategory;
  metricType: MetricType;
  side: 'YES' | 'NO';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
}
