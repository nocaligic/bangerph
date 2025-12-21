/**
 * React hooks for Bangr contract interactions
 * Uses wagmi for read/write operations
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS } from './addresses';
import { MARKET_FACTORY_ABI, MOCK_USDC_ABI, SHARE_TOKEN_ABI } from './abis';

const contracts = CONTRACTS.bscTestnet;

// ============ TYPES ============

export interface Market {
    id: bigint;
    tweetUrl: string;
    tweetId: string;
    authorHandle: string;
    scout: string;
    metric: number;
    currentValue: bigint;
    targetValue: bigint;
    startTime: bigint;
    endTime: bigint;
    status: number;
    yesTokenId: bigint;
    noTokenId: bigint;
}

export enum MetricType {
    VIEWS = 0,
    LIKES = 1,
    RETWEETS = 2,
    COMMENTS = 3,
}

export enum ResolutionStatus {
    PENDING = 0,
    RESOLVED_YES = 1,
    RESOLVED_NO = 2,
    RESOLVED_INVALID = 3,
}

// ============ READ HOOKS ============

/**
 * Get total number of markets
 */
export function useMarketCount() {
    return useReadContract({
        address: contracts.marketFactory,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarketCount',
    });
}

/**
 * Get a specific market by ID
 */
export function useMarket(marketId: number | bigint) {
    return useReadContract({
        address: contracts.marketFactory,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)],
    });
}

/**
 * Get current YES price (0-1e18 = 0-100%)
 */
export function useYesPrice(marketId: number | bigint) {
    const result = useReadContract({
        address: contracts.marketFactory,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getYesPrice',
        args: [BigInt(marketId)],
    });

    // Convert to percentage (0-100)
    const pricePercent = result.data ? Number(result.data) / 1e16 : 50;

    return {
        ...result,
        pricePercent,
        priceCents: Math.round(pricePercent),
    };
}

/**
 * Get current NO price (0-1e18 = 0-100%)
 */
export function useNoPrice(marketId: number | bigint) {
    const result = useReadContract({
        address: contracts.marketFactory,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getNoPrice',
        args: [BigInt(marketId)],
    });

    const pricePercent = result.data ? Number(result.data) / 1e16 : 50;

    return {
        ...result,
        pricePercent,
        priceCents: Math.round(pricePercent),
    };
}

/**
 * Get AMM reserves for a market
 */
export function useReserves(marketId: number | bigint) {
    return useReadContract({
        address: contracts.marketFactory,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getReserves',
        args: [BigInt(marketId)],
    });
}

/**
 * Estimate shares out for buying YES
 */
export function useEstimateBuyYes(marketId: number | bigint, usdcAmount: string) {
    const amountWei = parseUnits(usdcAmount || '0', 6);

    return useReadContract({
        address: contracts.marketFactory,
        abi: MARKET_FACTORY_ABI,
        functionName: 'estimateBuyYes',
        args: [BigInt(marketId), amountWei],
        query: {
            enabled: Number(usdcAmount) > 0,
        },
    });
}

/**
 * Estimate shares out for buying NO
 */
export function useEstimateBuyNo(marketId: number | bigint, usdcAmount: string) {
    const amountWei = parseUnits(usdcAmount || '0', 6);

    return useReadContract({
        address: contracts.marketFactory,
        abi: MARKET_FACTORY_ABI,
        functionName: 'estimateBuyNo',
        args: [BigInt(marketId), amountWei],
        query: {
            enabled: Number(usdcAmount) > 0,
        },
    });
}

/**
 * Get user's USDC balance
 */
export function useUsdcBalance(address?: string) {
    return useReadContract({
        address: contracts.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

/**
 * Get user's USDC allowance for MarketFactory
 */
export function useUsdcAllowance(owner?: string) {
    return useReadContract({
        address: contracts.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: 'allowance',
        args: owner ? [owner as `0x${string}`, contracts.marketFactory] : undefined,
        query: {
            enabled: !!owner,
        },
    });
}

/**
 * Get user's YES share balance for a market
 */
export function useYesBalance(address?: string, marketId?: number | bigint) {
    const yesTokenId = marketId !== undefined ? BigInt(marketId) * 2n : 0n;

    return useReadContract({
        address: contracts.shareToken,
        abi: SHARE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`, yesTokenId] : undefined,
        query: {
            enabled: !!address && marketId !== undefined,
        },
    });
}

/**
 * Get user's NO share balance for a market
 */
export function useNoBalance(address?: string, marketId?: number | bigint) {
    const noTokenId = marketId !== undefined ? BigInt(marketId) * 2n + 1n : 0n;

    return useReadContract({
        address: contracts.shareToken,
        abi: SHARE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`, noTokenId] : undefined,
        query: {
            enabled: !!address && marketId !== undefined,
        },
    });
}

// ============ WRITE HOOKS ============

/**
 * Approve USDC spending for MarketFactory
 */
export function useApproveUsdc() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const approve = async (amount: string) => {
        const amountWei = parseUnits(amount, 6);
        return writeContractAsync({
            address: contracts.mockUSDC,
            abi: MOCK_USDC_ABI,
            functionName: 'approve',
            args: [contracts.marketFactory, amountWei],
        });
    };

    return { approve, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Mint test USDC (testnet only)
 */
export function useMintUsdc() {
    const { address } = useAccount();
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const mint = async (amount: string) => {
        if (!address) return;
        const amountWei = parseUnits(amount, 6);
        return writeContractAsync({
            address: contracts.mockUSDC,
            abi: MOCK_USDC_ABI,
            functionName: 'mint',
            args: [address, amountWei],
        });
    };

    return { mint, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Create a new market
 */
export function useCreateMarket() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const createMarket = async (params: {
        tweetUrl: string;
        tweetId: string;
        authorHandle: string;
        metric: MetricType;
        currentValue: number;
        targetValue: number;
    }) => {
        return writeContractAsync({
            address: contracts.marketFactory,
            abi: MARKET_FACTORY_ABI,
            functionName: 'createMarket',
            args: [
                params.tweetUrl,
                params.tweetId,
                params.authorHandle,
                params.metric,
                BigInt(params.currentValue),
                BigInt(params.targetValue),
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
            address: contracts.marketFactory,
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
            address: contracts.marketFactory,
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
        const sharesWei = parseUnits(shares, 18);
        return writeContractAsync({
            address: contracts.marketFactory,
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
        const sharesWei = parseUnits(shares, 18);
        return writeContractAsync({
            address: contracts.marketFactory,
            abi: MARKET_FACTORY_ABI,
            functionName: 'sellNo',
            args: [BigInt(marketId), sharesWei],
        });
    };

    return { sellNo, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Redeem winning shares after resolution
 */
export function useRedeem() {
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const redeem = async (marketId: number | bigint, shares: string) => {
        const sharesWei = parseUnits(shares, 18);
        return writeContractAsync({
            address: contracts.marketFactory,
            abi: MARKET_FACTORY_ABI,
            functionName: 'redeem',
            args: [BigInt(marketId), sharesWei],
        });
    };

    return { redeem, isPending, isConfirming, isSuccess, error, hash };
}

// ============ UTILITY FUNCTIONS ============

/**
 * Format shares from wei to readable number
 */
export function formatShares(shares: bigint): string {
    return formatUnits(shares, 18);
}

/**
 * Format USDC from wei to readable number
 */
export function formatUsdc(amount: bigint): string {
    return formatUnits(amount, 6);
}

/**
 * Parse USDC to wei
 */
export function parseUsdc(amount: string): bigint {
    return parseUnits(amount, 6);
}

/**
 * Get metric label
 */
export function getMetricLabel(metric: number): string {
    const labels = ['VIEWS', 'LIKES', 'RETWEETS', 'COMMENTS'];
    return labels[metric] || 'UNKNOWN';
}

/**
 * Get resolution status label
 */
export function getStatusLabel(status: number): string {
    const labels = ['PENDING', 'YES WINS', 'NO WINS', 'INVALID'];
    return labels[status] || 'UNKNOWN';
}

/**
 * Calculate time remaining
 */
export function getTimeRemaining(endTime: bigint): string {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const remaining = endTime - now;

    if (remaining <= 0n) return 'Ended';

    const hours = Number(remaining / 3600n);
    const minutes = Number((remaining % 3600n) / 60n);

    if (hours > 24) {
        return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
}
