/**
 * useMarkets - Hooks for fetching and managing V2 markets
 * V2: Markets now include full tweet data stored on-chain
 */

import { useReadContract, useReadContracts } from 'wagmi';
import { MARKET_FACTORY_ABI } from './abis';
import { getContracts } from './addresses';

const contracts = getContracts();

// Market data structure from V2 contract
export interface ContractMarket {
    id: number;
    tweetId: string;
    tweetUrl: string;
    tweetText: string;
    authorHandle: string;
    authorName: string;
    avatarUrl: string;
    mediaJson: string;
    category: string;
    metric: number;
    targetValue: bigint;
    startTime: bigint;
    endTime: bigint;
    status: number;
    yesPrice: number;
    noPrice: number;
    totalVolume: bigint;
    // Parsed media for convenience
    media: MediaItem[];
    // Quoted tweet data (if any)
    quotedTweet?: {
        id: string;
        text: string;
        authorHandle: string;
        authorName: string;
    } | null;
}

export interface MediaItem {
    type: 'image' | 'video' | 'gif';
    url: string;
    thumbnail?: string;
}

/**
 * Fetch all markets from contract
 */
export function useMarkets() {
    // First get the market count
    const { data: marketCount, isLoading: countLoading, refetch: refetchCount } = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'marketCount',
    });

    const numMarkets = marketCount ? Number(marketCount) : 0;

    // Build array of market IDs to fetch
    const marketIds = Array.from({ length: numMarkets }, (_, i) => i);

    // Fetch all markets in a single multicall
    const { data: marketsData, isLoading: marketsLoading, refetch: refetchMarkets } = useReadContracts({
        contracts: marketIds.map(id => ({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'getMarket',
            args: [BigInt(id)],
        })),
    });

    // Also fetch all quoted tweets
    const { data: quotedTweetsData } = useReadContracts({
        contracts: marketIds.map(id => ({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'getQuotedTweet',
            args: [BigInt(id)],
        })),
    });

    // Parse the results
    const markets: ContractMarket[] = [];

    if (marketsData) {
        for (let i = 0; i < numMarkets; i++) {
            const result = marketsData[i];
            if (result?.status === 'success' && result.result) {
                const m = result.result as any;

                // Parse media JSON
                let media: MediaItem[] = [];
                try {
                    if (m[6]) { // mediaJson
                        const parsed = JSON.parse(m[6]);
                        media = parsed.media || parsed || [];
                    }
                } catch (e) {
                    // Invalid JSON, ignore
                }

                // Parse quoted tweet if exists
                let quotedTweet = null;
                if (quotedTweetsData && quotedTweetsData[i]?.status === 'success') {
                    const q = quotedTweetsData[i].result as any;
                    if (q && q[0]) { // hasQuote
                        quotedTweet = {
                            id: q[1] || '',
                            text: q[2] || '',
                            authorHandle: q[3] || '',
                            authorName: q[4] || '',
                        };
                    }
                }

                markets.push({
                    id: i,
                    tweetId: m[0] || '',
                    tweetUrl: m[1] || '',
                    tweetText: m[2] || '',
                    authorHandle: m[3] || '',
                    authorName: m[4] || '',
                    avatarUrl: m[5] || '',
                    mediaJson: m[6] || '[]',
                    category: m[7] || '',
                    metric: Number(m[8]) || 0,
                    targetValue: m[9] || BigInt(0),
                    startTime: m[10] || BigInt(0),
                    endTime: m[11] || BigInt(0),
                    status: Number(m[12]) || 0,
                    yesPrice: Number(m[13]) || 50,
                    noPrice: Number(m[14]) || 50,
                    totalVolume: m[15] || BigInt(0),
                    media,
                    quotedTweet,
                });
            }
        }
    }

    return {
        markets,
        marketCount: numMarkets,
        isLoading: countLoading || marketsLoading,
        refetch: async () => {
            await refetchCount();
            await refetchMarkets();
        },
    };
}

/**
 * Fetch a single market by ID
 */
export function useLiveMarket(marketId: number) {
    const { data: market, isLoading: isMarketLoading, refetch } = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)],
    });

    // Also fetch quoted tweet data
    const { data: quotedTweet } = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getQuotedTweet',
        args: [BigInt(marketId)],
    });

    // Parse market data
    let parsedMarket: ContractMarket | null = null;

    if (market) {
        const m = market as any;

        // Parse media JSON
        let media: MediaItem[] = [];
        try {
            if (m[6]) {
                const parsed = JSON.parse(m[6]);
                media = parsed.media || parsed || [];
            }
        } catch (e) {
            // Invalid JSON
        }

        parsedMarket = {
            id: marketId,
            tweetId: m[0] || '',
            tweetUrl: m[1] || '',
            tweetText: m[2] || '',
            authorHandle: m[3] || '',
            authorName: m[4] || '',
            avatarUrl: m[5] || '',
            mediaJson: m[6] || '[]',
            category: m[7] || '',
            metric: Number(m[8]) || 0,
            targetValue: m[9] || BigInt(0),
            startTime: m[10] || BigInt(0),
            endTime: m[11] || BigInt(0),
            status: Number(m[12]) || 0,
            yesPrice: Number(m[13]) || 50,
            noPrice: Number(m[14]) || 50,
            totalVolume: m[15] || BigInt(0),
            media,
        };
    }

    // Parse quoted tweet if exists
    let quotedTweetData = null;
    if (quotedTweet) {
        const q = quotedTweet as any;
        if (q[0]) { // hasQuote
            quotedTweetData = {
                id: q[1],
                text: q[2],
                authorHandle: q[3],
                authorName: q[4],
            };
        }
    }

    return {
        market: parsedMarket,
        quotedTweet: quotedTweetData,
        isLoading: isMarketLoading,
        refetch,
    };
}

/**
 * Check if a market already exists for a tweet+metric combo
 */
export function useMarketExists(tweetId: string, metric: number) {
    const { data: exists, isLoading } = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'marketExistsFor',
        args: [tweetId, metric],
    });

    return {
        exists: exists ?? false,
        isLoading,
    };
}

/**
 * Get markets by category
 */
export function useMarketsByCategory(category: string) {
    const { data: marketIds, isLoading } = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarketsByCategory',
        args: [category],
    });

    return {
        marketIds: marketIds as bigint[] | undefined,
        isLoading,
    };
}

/**
 * Get user's position in a market
 */
export function useUserPosition(marketId: number, userAddress?: `0x${string}`) {
    const { data: position, isLoading } = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getUserPosition',
        args: userAddress ? [BigInt(marketId), userAddress] : undefined,
    });

    return {
        yesShares: position ? (position as any)[0] : BigInt(0),
        noShares: position ? (position as any)[1] : BigInt(0),
        isLoading,
    };
}
