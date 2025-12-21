/**
 * ConnectedCreateMarketModal - Create market modal wired to smart contracts
 */

import React, { useState, useEffect } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { X, Twitter, Zap, Loader2, AlertCircle, Eye, Heart, Repeat, MessageCircle, DollarSign } from 'lucide-react';
import { useWallet } from '../lib/useWallet';
import {
    useCreateMarket,
    useApproveUsdc,
    useUsdcBalance,
    useUsdcAllowance,
    useMintUsdc,
    formatUsdc,
    MetricType,
} from '../lib/contracts';
import { fetchTweetFromUrl, extractTweetId, extractAuthorHandle, getMetricValue, TweetData } from '../services/twitterService';

interface ConnectedCreateMarketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const METRIC_OPTIONS = [
    { type: MetricType.VIEWS, label: 'VIEWS', icon: Eye, color: 'bg-blue-500' },
    { type: MetricType.LIKES, label: 'LIKES', icon: Heart, color: 'bg-red-500' },
    { type: MetricType.RETWEETS, label: 'RETWEETS', icon: Repeat, color: 'bg-green-500' },
    { type: MetricType.COMMENTS, label: 'COMMENTS', icon: MessageCircle, color: 'bg-orange-500' },
];

// Initial liquidity required to create a market
const INITIAL_LIQUIDITY = 10; // $10 USDC

export const ConnectedCreateMarketModal: React.FC<ConnectedCreateMarketModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const { isConnected, address, connect } = useWallet();
    const [tweetUrl, setTweetUrl] = useState('');
    const [step, setStep] = useState<'input' | 'loading' | 'configure' | 'success'>('input');
    const [selectedMetric, setSelectedMetric] = useState<MetricType>(MetricType.VIEWS);
    const [targetValue, setTargetValue] = useState('1000000');
    const [tweetData, setTweetData] = useState<TweetData | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Extract from URL or use fetched data
    const tweetId = tweetData?.tweetId || extractTweetId(tweetUrl);
    const authorHandle = tweetData?.authorHandle || extractAuthorHandle(tweetUrl);

    // Get current metric value from live tweet data
    const currentMetricValue = tweetData ? getMetricValue(tweetData,
        selectedMetric === MetricType.VIEWS ? 'VIEWS' :
            selectedMetric === MetricType.LIKES ? 'LIKES' :
                selectedMetric === MetricType.RETWEETS ? 'RETWEETS' : 'COMMENTS'
    ) : 0;

    // Contract reads
    const { data: usdcBalance } = useUsdcBalance(address);
    const { data: allowance } = useUsdcAllowance(address);

    // Contract writes
    const { approve, isPending: isApproving, isConfirming: isApprovingConfirming } = useApproveUsdc();
    const { createMarket, isPending: isCreating, isConfirming: isCreatingConfirming, isSuccess: createSuccess, error: createError } = useCreateMarket();
    const { mint, isPending: isMinting, isConfirming: isMintingConfirming } = useMintUsdc();

    // Check if needs approval
    const requiredAmount = BigInt(INITIAL_LIQUIDITY * 1e6);
    const needsApproval = !allowance || allowance < requiredAmount;
    const hasEnoughBalance = usdcBalance && usdcBalance >= requiredAmount;

    const balanceDisplay = usdcBalance ? formatUsdc(usdcBalance) : '0';

    // Watch for success
    useEffect(() => {
        if (createSuccess) {
            setStep('success');
            setTimeout(() => {
                onSuccess?.();
                handleClose();
            }, 2000);
        }
    }, [createSuccess, onSuccess]);

    // Watch for errors
    useEffect(() => {
        if (createError) {
            setError(createError.message || 'Failed to create market');
        }
    }, [createError]);

    const handleClose = () => {
        setTweetUrl('');
        setStep('input');
        setError(null);
        setFetchError(null);
        setTweetData(null);
        setSelectedMetric(MetricType.VIEWS);
        setTargetValue('1000000');
        onClose();
    };

    const handleNext = async () => {
        const id = extractTweetId(tweetUrl);
        if (!id) {
            setFetchError('Please enter a valid tweet URL');
            return;
        }

        setFetchError(null);
        setStep('loading');

        try {
            const data = await fetchTweetFromUrl(tweetUrl);
            if (data) {
                setTweetData(data);
                // Set default target based on current metric (e.g., 2x current)
                const currentViews = data.views || 100000;
                setTargetValue(String(Math.round(currentViews * 2)));
                setStep('configure');
            } else {
                setFetchError('Could not fetch tweet data. Check the URL.');
                setStep('input');
            }
        } catch (err: any) {
            console.error('Tweet fetch error:', err);
            setFetchError(err.message || 'Failed to fetch tweet');
            setStep('input');
        }
    };

    const handleCreate = async () => {
        if (!isConnected) {
            connect();
            return;
        }

        setError(null);

        try {
            // Check balance
            if (!hasEnoughBalance) {
                setError(`Need ${INITIAL_LIQUIDITY} USDC. Click +MINT to get test USDC.`);
                return;
            }

            // Check approval
            if (needsApproval) {
                await approve('1000000'); // Approve 1M USDC
                return;
            }

            // Create market with real current metric value
            await createMarket({
                tweetUrl: tweetUrl,
                tweetId: tweetId!,
                authorHandle: authorHandle,
                metric: selectedMetric,
                currentValue: currentMetricValue || 1, // Use live metric or minimum
                targetValue: Number(targetValue),
            });
        } catch (err: any) {
            console.error('Create market error:', err);
            setError(err.message || 'Failed to create market');
        }
    };

    const handleMint = async () => {
        try {
            await mint('1000');
        } catch (err: any) {
            setError(err.message || 'Mint failed');
        }
    };

    const isLoading = isApproving || isApprovingConfirming || isCreating || isCreatingConfirming;
    const isMintingLoading = isMinting || isMintingConfirming;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black shadow-hard max-w-lg w-full relative animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-4 -right-4 bg-banger-pink text-white p-2 border-4 border-black shadow-hard-sm hover:bg-black transition-colors z-10"
                >
                    <X size={20} strokeWidth={3} />
                </button>

                {/* Success State */}
                {step === 'success' && (
                    <div className="p-8 flex flex-col items-center justify-center bg-banger-yellow pattern-lines min-h-[300px]">
                        <div className="bg-white border-4 border-black p-8 shadow-hard text-center">
                            <div className="font-display text-4xl mb-2 text-black">MARKET CREATED!</div>
                            <div className="font-mono text-lg">You're now the Scout 🔥</div>
                            <div className="font-mono text-sm mt-2 text-gray-600">
                                You received 10 YES + 10 NO shares
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State - Fetching Tweet */}
                {step === 'loading' && (
                    <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                        <Loader2 size={48} className="animate-spin text-banger-pink mb-4" />
                        <div className="font-display text-2xl mb-2">FETCHING TWEET...</div>
                        <div className="font-mono text-sm text-gray-500">Getting live metrics from Twitter</div>
                    </div>
                )}

                {/* Input Step */}
                {step === 'input' && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                            <div className="bg-banger-yellow p-2 border-2 border-black">
                                <Zap size={24} />
                            </div>
                            <h2 className="font-display text-2xl uppercase">Spot Alpha</h2>
                        </div>

                        {/* Tweet URL Input */}
                        <div className="mb-6">
                            <label className="font-mono text-xs font-bold uppercase text-gray-500 mb-2 block">
                                Tweet URL
                            </label>
                            <div className="relative">
                                <Twitter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={tweetUrl}
                                    onChange={(e) => setTweetUrl(e.target.value)}
                                    placeholder="https://x.com/user/status/..."
                                    className="w-full border-4 border-black p-3 pl-10 font-mono text-sm focus:outline-none focus:border-banger-pink transition-colors"
                                />
                            </div>
                            {tweetUrl && tweetId && (
                                <div className="mt-2 font-mono text-xs text-green-600">
                                    ✓ Tweet ID: {tweetId} • @{authorHandle}
                                </div>
                            )}
                        </div>

                        {fetchError && (
                            <div className="mb-4 bg-red-100 border-2 border-red-500 text-red-700 p-3 font-mono text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {fetchError}
                            </div>
                        )}

                        <BrutalistButton
                            onClick={handleNext}
                            disabled={!tweetUrl.trim()}
                            className="w-full"
                        >
                            NEXT: CONFIGURE MARKET
                        </BrutalistButton>
                    </div>
                )}

                {/* Configure Step */}
                {step === 'configure' && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                            <div className="bg-banger-cyan p-2 border-2 border-black">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h2 className="font-display text-2xl uppercase">Configure Market</h2>
                                <div className="font-mono text-xs text-gray-500">@{authorHandle}</div>
                            </div>
                        </div>

                        {/* Metric Selection */}
                        <div className="mb-6">
                            <label className="font-mono text-xs font-bold uppercase text-gray-500 mb-3 block">
                                What metric to track?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {METRIC_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.type}
                                            onClick={() => setSelectedMetric(option.type)}
                                            className={`
                        p-4 border-4 border-black transition-all flex flex-col items-center gap-2
                        ${selectedMetric === option.type
                                                    ? `${option.color} text-white shadow-arcade-pressed translate-x-1 translate-y-1`
                                                    : 'bg-gray-100 hover:bg-gray-200 shadow-hard-sm'}
                      `}
                                        >
                                            <Icon size={20} />
                                            <span className="font-mono text-xs font-bold">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Target Value */}
                        <div className="mb-6">
                            <label className="font-mono text-xs font-bold uppercase text-gray-500 mb-2 block">
                                Target to hit
                            </label>
                            <input
                                type="number"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-banger-pink"
                                placeholder="1000000"
                            />
                            <div className="flex gap-2 mt-2">
                                {['100000', '500000', '1000000', '5000000'].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setTargetValue(val)}
                                        className="flex-1 bg-gray-100 border-2 border-black py-1 font-mono text-xs hover:bg-gray-200"
                                    >
                                        {Number(val) >= 1000000 ? `${Number(val) / 1000000}M` : `${Number(val) / 1000}K`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cost Display */}
                        <div className="bg-banger-black text-white p-4 border-2 border-black mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-mono text-xs text-gray-400">SCOUT FEE</div>
                                    <div className="font-display text-2xl flex items-center gap-2">
                                        <DollarSign size={20} />
                                        {INITIAL_LIQUIDITY} USDC
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-xs text-gray-400">YOUR BALANCE</div>
                                    <div className="font-mono text-lg text-banger-yellow flex items-center gap-2">
                                        ${balanceDisplay}
                                        {isConnected && !hasEnoughBalance && (
                                            <button
                                                onClick={handleMint}
                                                disabled={isMintingLoading}
                                                className="font-mono text-xs bg-banger-pink px-2 py-1 hover:bg-white hover:text-black transition-colors"
                                            >
                                                {isMintingLoading ? '...' : '+MINT'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 font-mono text-xs text-gray-400">
                                You'll receive: 10 YES + 10 NO shares (worth ${INITIAL_LIQUIDITY})
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-100 border-2 border-red-500 text-red-700 p-3 font-mono text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <BrutalistButton
                                onClick={() => setStep('input')}
                                variant="secondary"
                                className="flex-1"
                            >
                                BACK
                            </BrutalistButton>
                            <BrutalistButton
                                onClick={handleCreate}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {!isConnected ? (
                                    'CONNECT WALLET'
                                ) : isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        {needsApproval ? 'APPROVING...' : 'CREATING...'}
                                    </span>
                                ) : needsApproval ? (
                                    'APPROVE USDC'
                                ) : (
                                    'CREATE MARKET'
                                )}
                            </BrutalistButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
