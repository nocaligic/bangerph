/**
 * Hook to fetch trades and price history for a specific market
 */

import { useState, useEffect } from 'react';

// Use local worker in development, deployed worker in production
const INDEXER_API_URL = (import.meta as any).env?.PROD
    ? 'https://bangr-indexer.nocaligic.workers.dev'
    : 'http://localhost:8788';

export interface TradeData {
    marketId: number;
    buyer: string;
    isYes: boolean;
    usdcAmount: string;
    sharesReceived: string;
    transactionHash: string;
    blockNumber: number;
    indexedAt: string;
}

export interface PricePoint {
    blockNumber: number;
    yesPrice: number;
    noPrice: number;
    isYes: boolean;
    amount: string;
    buyer: string;
}

export interface MarketTradesData {
    success: boolean;
    marketId: number;
    count: number;
    trades: TradeData[];
    priceHistory: PricePoint[];
    currentYesPrice: number;
    currentNoPrice: number;
}

export function useMarketTrades(marketId: number) {
    const [data, setData] = useState<MarketTradesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrades = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${INDEXER_API_URL}/market-trades/${marketId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch market trades');
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (marketId >= 0) {
            fetchTrades();
            // Auto-refresh every 5 seconds for faster updates
            const interval = setInterval(fetchTrades, 5000);
            return () => clearInterval(interval);
        }
    }, [marketId]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchTrades,
    };
}
