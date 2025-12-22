/**
 * React hooks for Bangr V2 contract interactions
 * Uses wagmi for read/write operations
 */

import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits, parseAbiItem } from 'viem';
import { useState, useEffect } from 'react';
import { CONTRACTS } from './addresses';
import { MARKET_FACTORY_ABI, MOCK_USDC_ABI, SHARE_TOKEN_ABI } from './abis';

const contracts = CONTRACTS.bscTestnet;

// Contract deployment block - used for efficient event fetching
// BSC Testnet RPC limits getLogs to ~5000 blocks, so we start from deployment
const CONTRACT_DEPLOYMENT_BLOCK = BigInt(80023861);

// Indexer API URL (local dev or deployed)
const INDEXER_API_URL = 'http://localhost:8788';

// ============ TYPES ============

export enum MetricType {
    VIEWS = 0,
    LIKES = 1,
    RETWEETS = 2,
    COMMENTS = 3,
}

export enum MarketStatus {
    ACTIVE = 0,
    RESOLVED_YES = 1,
    RESOLVED_NO = 2,
}

// ============ READ HOOKS ============

/**
 * Get total number of markets
 */
export function useMarketCount() {
    return useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'marketCount',
    });
}

/**
 * Get a specific market by ID
 */
export function useMarket(marketId: number | bigint) {
    return useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)],
    });
}

/**
 * Get current YES price (0-100 representing cents)
 */
export function useYesPrice(marketId: number | bigint) {
    const result = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getYesPrice',
        args: [BigInt(marketId)],
    });

    // V2 contract returns 0-100 directly
    const pricePercent = result.data ? Number(result.data) : 50;

    return {
        ...result,
        pricePercent,
        priceCents: pricePercent,
    };
}

/**
 * Get current NO price (0-100 representing cents)
 */
export function useNoPrice(marketId: number | bigint) {
    const result = useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getNoPrice',
        args: [BigInt(marketId)],
    });

    const pricePercent = result.data ? Number(result.data) : 50;

    return {
        ...result,
        pricePercent,
        priceCents: pricePercent,
    };
}

/**
 * Get reserves for a market
 */
export function useReserves(marketId: number | bigint) {
    return useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getReserves',
        args: [BigInt(marketId)],
    });
}

/**
 * Estimate YES shares for a given USDC amount
 * V2: Calculate client-side since contract doesn't have this view function
 */
export function useEstimateBuyYes(marketId: number | bigint, usdcAmount: string) {
    const { data: reserves } = useReserves(marketId);

    // Simple estimate: shares = (amount * noReserve) / (yesReserve + noReserve)
    const amount = Number(usdcAmount || '0') * 1e6;
    let estimatedShares = BigInt(0);

    if (reserves) {
        const [yesRes, noRes] = reserves as [bigint, bigint];
        if (yesRes + noRes > 0) {
            estimatedShares = BigInt(Math.floor((amount * Number(noRes)) / (Number(yesRes) + Number(noRes))));
        }
    }

    return { data: estimatedShares, isLoading: !reserves };
}

/**
 * Estimate NO shares for a given USDC amount
 */
export function useEstimateBuyNo(marketId: number | bigint, usdcAmount: string) {
    const { data: reserves } = useReserves(marketId);

    const amount = Number(usdcAmount || '0') * 1e6;
    let estimatedShares = BigInt(0);

    if (reserves) {
        const [yesRes, noRes] = reserves as [bigint, bigint];
        if (yesRes + noRes > 0) {
            estimatedShares = BigInt(Math.floor((amount * Number(yesRes)) / (Number(yesRes) + Number(noRes))));
        }
    }

    return { data: estimatedShares, isLoading: !reserves };
}

/**
 * Get user's YES token balance for a market
 */
export function useYesBalance(marketId: number | bigint, userAddress?: string) {
    const position = useUserPosition(marketId, userAddress as `0x${string}`);

    return {
        data: position.data ? (position.data as any)[0] : BigInt(0),
        isLoading: position.isLoading,
    };
}

/**
 * Get user's NO token balance for a market
 */
export function useNoBalance(marketId: number | bigint, userAddress?: string) {
    const position = useUserPosition(marketId, userAddress as `0x${string}`);

    return {
        data: position.data ? (position.data as any)[1] : BigInt(0),
        isLoading: position.isLoading,
    };
}

/**
 * Check if market already exists for tweet+metric
 */
export function useMarketExists(tweetId: string, metric: MetricType) {
    return useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'marketExistsFor',
        args: [tweetId, metric],
    });
}

/**
 * Get user's position in a market
 */
export function useUserPosition(marketId: number | bigint, userAddress?: `0x${string}`) {
    return useReadContract({
        address: contracts.marketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getUserPosition',
        args: userAddress ? [BigInt(marketId), userAddress] : undefined,
        query: {
            enabled: !!userAddress,
        },
    });
}

/**
 * Get user's positions across all markets (for portfolio page)
 * Uses multicall to efficiently fetch all positions in one RPC call
 */
export interface UserPosition {
    marketId: number;
    yesShares: bigint;
    noShares: bigint;
}

export function useAllUserPositions(marketIds: number[], userAddress?: `0x${string}`) {
    const { data: positionsData, isLoading, refetch } = useReadContracts({
        contracts: marketIds.map(id => ({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'getUserPosition',
            args: [BigInt(id), userAddress],
        })),
        query: {
            enabled: !!userAddress && marketIds.length > 0,
        },
    });

    // Parse results into positions with non-zero balances
    const positions: UserPosition[] = [];

    if (positionsData) {
        for (let i = 0; i < marketIds.length; i++) {
            const result = positionsData[i];
            if (result?.status === 'success' && result.result) {
                const [yesShares, noShares] = result.result as unknown as [bigint, bigint];
                // Only include if user has some position
                if (yesShares > BigInt(0) || noShares > BigInt(0)) {
                    positions.push({
                        marketId: marketIds[i],
                        yesShares,
                        noShares,
                    });
                }
            }
        }
    }

    return {
        positions,
        isLoading,
        refetch,
    };
}

/**
 * Trade event for history display
 */
export interface TradeEvent {
    marketId: number;
    isYes: boolean;
    usdcAmount: bigint;
    sharesReceived: bigint;
    timestamp: number;
    transactionHash: string;
    blockNumber: bigint;
}

/**
 * Fetch user's trade history from the indexer API (fast, cached)
 */
export function useUserTradeHistory(userAddress?: `0x${string}`) {
    const [trades, setTrades] = useState<TradeEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTrades = async () => {
        if (!userAddress) {
            setTrades([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${INDEXER_API_URL}/trades/${userAddress}`);
            const data = await response.json();

            if (data.success && data.trades) {
                // Map API response to TradeEvent interface
                const parsedTrades: TradeEvent[] = data.trades.map((t: any) => ({
                    marketId: t.marketId,
                    isYes: t.isYes === 1,
                    usdcAmount: BigInt(t.usdcAmount || '0'),
                    sharesReceived: BigInt(t.sharesReceived || '0'),
                    timestamp: 0,
                    transactionHash: t.transactionHash || '',
                    blockNumber: BigInt(t.blockNumber || 0),
                }));
                setTrades(parsedTrades);
            } else {
                setTrades([]);
            }
        } catch (err) {
            console.error('Error fetching trade history from indexer:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [userAddress]);

    return {
        trades,
        isLoading,
        error,
        refetch: fetchTrades,
    };
}

/**
 * Market created event for displaying user's created markets
 */
export interface CreatedMarketEvent {
    marketId: number;
    tweetId: string;
    metric: number;
    targetValue: bigint;
    category: string;
    transactionHash: string;
    blockNumber: bigint;
}

/**
 * Fetch markets created by the user from the indexer API (fast, cached)
 */
export function useUserCreatedMarkets(userAddress?: `0x${string}`) {
    const [markets, setMarkets] = useState<CreatedMarketEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMarkets = async () => {
        if (!userAddress) {
            setMarkets([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${INDEXER_API_URL}/markets/${userAddress}`);
            const data = await response.json();

            if (data.success && data.markets) {
                // Map API response to CreatedMarketEvent interface
                const parsedMarkets: CreatedMarketEvent[] = data.markets.map((m: any) => ({
                    marketId: m.marketId,
                    tweetId: m.tweetId || '',
                    metric: m.metric,
                    targetValue: BigInt(m.targetValue || '0'),
                    category: m.category || '',
                    transactionHash: m.transactionHash || '',
                    blockNumber: BigInt(m.blockNumber || 0),
                }));
                setMarkets(parsedMarkets);
            } else {
                setMarkets([]);
            }
        } catch (err) {
            console.error('Error fetching created markets from indexer:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarkets();
    }, [userAddress]);

    return {
        markets,
        isLoading,
        error,
        refetch: fetchMarkets,
    };
}

/**
 * Get user's USDC balance
 */
export function useUsdcBalance(address?: string) {
    return useReadContract({
        address: contracts.mockUSDC as `0x${string}`,
        abi: MOCK_USDC_ABI,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

/**
 * Get USDC allowance for MarketFactory
 */
export function useUsdcAllowance(address?: string) {
    return useReadContract({
        address: contracts.mockUSDC as `0x${string}`,
        abi: MOCK_USDC_ABI,
        functionName: 'allowance',
        args: address ? [address as `0x${string}`, contracts.marketFactory as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

// ============ WRITE HOOKS ============

/**
 * Approve USDC for MarketFactory
 */
export function useApproveUsdc() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const approve = async (amount: string) => {
        const amountWei = parseUnits(amount, 6);
        return writeContractAsync({
            address: contracts.mockUSDC as `0x${string}`,
            abi: MOCK_USDC_ABI,
            functionName: 'approve',
            args: [contracts.marketFactory as `0x${string}`, amountWei],
        });
    };

    return { approve, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Mint test USDC (for testnet only)
 */
export function useMintUsdc() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const mint = async (amount: string) => {
        const amountWei = parseUnits(amount, 6);
        return writeContractAsync({
            address: contracts.mockUSDC as `0x${string}`,
            abi: MOCK_USDC_ABI,
            functionName: 'mint',
            args: [await (window as any).ethereum?.selectedAddress, amountWei],
        });
    };

    return { mint, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Create a new market (V2 - with full tweet data)
 */
export function useCreateMarket() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const createMarket = async (params: {
        // Tweet data
        tweetId: string;
        tweetUrl: string;
        tweetText: string;
        authorHandle: string;
        authorName: string;
        avatarUrl: string;
        mediaJson: string;
        // Quote tweet (optional)
        hasQuotedTweet: boolean;
        quotedTweetId: string;
        quotedTweetText: string;
        quotedAuthorHandle: string;
        quotedAuthorName: string;
        // Market config
        category: string;
        metric: MetricType;
        targetValue: number;
        duration?: number; // Default 24 hours
    }) => {
        return writeContractAsync({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'createMarket',
            args: [
                params.tweetId,
                params.tweetUrl,
                params.tweetText,
                params.authorHandle,
                params.authorName,
                params.avatarUrl,
                params.mediaJson,
                params.hasQuotedTweet,
                params.quotedTweetId,
                params.quotedTweetText,
                params.quotedAuthorHandle,
                params.quotedAuthorName,
                params.category,
                params.metric,
                BigInt(params.targetValue),
                BigInt(params.duration || 86400), // Default 24 hours
            ],
        });
    };

    return { createMarket, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Buy YES shares
 */
export function useBuyYes() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const buyYes = async (marketId: number | bigint, usdcAmount: string) => {
        const amountWei = parseUnits(usdcAmount, 6);
        return writeContractAsync({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'buyYes',
            args: [BigInt(marketId), amountWei],
        });
    };

    return { buyYes, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Buy NO shares
 */
export function useBuyNo() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const buyNo = async (marketId: number | bigint, usdcAmount: string) => {
        const amountWei = parseUnits(usdcAmount, 6);
        return writeContractAsync({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'buyNo',
            args: [BigInt(marketId), amountWei],
        });
    };

    return { buyNo, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Sell YES shares
 */
export function useSellYes() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const sellYes = async (marketId: number | bigint, shares: string) => {
        const sharesWei = parseUnits(shares, 6); // USDC decimals for V2
        return writeContractAsync({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'sellYes',
            args: [BigInt(marketId), sharesWei],
        });
    };

    return { sellYes, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Sell NO shares
 */
export function useSellNo() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const sellNo = async (marketId: number | bigint, shares: string) => {
        const sharesWei = parseUnits(shares, 6); // USDC decimals for V2
        return writeContractAsync({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'sellNo',
            args: [BigInt(marketId), sharesWei],
        });
    };

    return { sellNo, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Claim winnings after market resolution
 */
export function useClaimWinnings() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const claimWinnings = async (marketId: number | bigint) => {
        return writeContractAsync({
            address: contracts.marketFactory as `0x${string}`,
            abi: MARKET_FACTORY_ABI,
            functionName: 'claimWinnings',
            args: [BigInt(marketId)],
        });
    };

    return { claimWinnings, isPending, isConfirming, isSuccess, error, hash };
}

// ============ UTILITY FUNCTIONS ============

/**
 * Format shares from wei to readable number
 */
export function formatShares(shares: bigint): string {
    return formatUnits(shares, 6);
}

/**
 * Format USDC from wei to readable string
 */
export function formatUsdc(amount: bigint): string {
    return formatUnits(amount, 6);
}

/**
 * Parse USDC string to wei
 */
export function parseUsdc(amount: string): bigint {
    return parseUnits(amount, 6);
}
