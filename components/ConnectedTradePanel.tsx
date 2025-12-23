/**
 * ConnectedTradePanel - Trade panel wired to smart contracts
 * Uses the existing TradePanel UI but with real contract calls
 */

import React, { useState, useEffect } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { ArrowRight, DollarSign, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from 'lucide-react';
import { useWallet } from '../lib/useWallet';
import {
    useYesPrice,
    useNoPrice,
    useEstimateBuyYes,
    useEstimateBuyNo,
    useBuyYes,
    useBuyNo,
    useApproveUsdc,
    useUsdcBalance,
    useUsdcAllowance,
    useYesBalance,
    useNoBalance,
    formatShares,
    formatUsdc,
    useMintUsdc,
} from '../lib/contracts';
import { ConfettiSimple } from './Confetti';

interface ConnectedTradePanelProps {
    marketId: number;
    metricType: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

export const ConnectedTradePanel: React.FC<ConnectedTradePanelProps> = ({
    marketId,
    metricType,
    onSuccess,
    onClose
}) => {
    const { isConnected, address, connect } = useWallet();
    const [position, setPosition] = useState<'YES' | 'NO'>('YES');
    const [amount, setAmount] = useState<string>('10');
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Contract reads
    const { priceCents: yesPrice } = useYesPrice(marketId);
    const { priceCents: noPrice } = useNoPrice(marketId);
    const { data: usdcBalance } = useUsdcBalance(address);
    const { data: allowance } = useUsdcAllowance(address);
    const { data: yesBalance, refetch: refetchYesBalance } = useYesBalance(marketId, address);
    const { data: noBalance, refetch: refetchNoBalance } = useNoBalance(marketId, address);

    // Estimate shares
    const { data: estimatedYesShares } = useEstimateBuyYes(marketId, amount);
    const { data: estimatedNoShares } = useEstimateBuyNo(marketId, amount);

    // Contract writes
    const { approve, isPending: isApproving, isConfirming: isApprovingConfirming } = useApproveUsdc();
    const { buyYes, isPending: isBuyingYes, isConfirming: isConfirmingYes, isSuccess: buyYesSuccess } = useBuyYes();
    const { buyNo, isPending: isBuyingNo, isConfirming: isConfirmingNo, isSuccess: buyNoSuccess } = useBuyNo();
    const { mint, isPending: isMinting, isConfirming: isMintingConfirming, isSuccess: mintSuccess } = useMintUsdc();

    // Calculate estimates
    const estimatedShares = position === 'YES' ? estimatedYesShares : estimatedNoShares;
    const shares = estimatedShares ? Number(formatShares(estimatedShares)) : 0;
    const potentialReturn = shares * 1; // $1 per share if you win
    const amountNum = Number(amount) || 0;
    const profit = potentialReturn - amountNum;
    const roi = amountNum > 0 ? Math.floor((profit / amountNum) * 100) : 0;
    const currentPrice = position === 'YES' ? yesPrice : noPrice;

    // Check if we need approval
    const amountWei = BigInt(Math.floor((Number(amount) || 0) * 1e6));
    const needsApproval = !allowance || allowance < amountWei;

    // Balance display
    const balanceDisplay = usdcBalance ? formatUsdc(usdcBalance) : '0';
    const yesSharesDisplay = yesBalance ? Number(formatShares(yesBalance)).toFixed(2) : '0';
    const noSharesDisplay = noBalance ? Number(formatShares(noBalance)).toFixed(2) : '0';

    // Confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    // Watch for success
    useEffect(() => {
        if (buyYesSuccess || buyNoSuccess) {
            setIsSuccess(true);
            setShowConfetti(true); // Trigger confetti!
            // Refetch position balances
            refetchYesBalance();
            refetchNoBalance();
            setTimeout(() => {
                setIsSuccess(false);
                setShowConfetti(false);
                onSuccess?.();
            }, 2500);
        }
    }, [buyYesSuccess, buyNoSuccess, onSuccess, refetchYesBalance, refetchNoBalance]);

    const handleTrade = async () => {
        setError(null);

        if (!isConnected) {
            connect();
            return;
        }

        try {
            // Check if needs approval
            if (needsApproval) {
                await approve('1000000'); // Approve 1M USDC (max)
                return; // Will re-trigger after approval
            }

            // Execute trade
            if (position === 'YES') {
                await buyYes(marketId, amount);
            } else {
                await buyNo(marketId, amount);
            }
        } catch (err: any) {
            console.error('Trade error:', err);
            setError(err.message || 'Transaction failed');
        }
    };

    const handleMintUsdc = async () => {
        try {
            await mint('1000'); // Mint 1000 test USDC
        } catch (err: any) {
            setError(err.message || 'Mint failed');
        }
    };

    const isLoading = isApproving || isApprovingConfirming || isBuyingYes || isBuyingNo || isConfirmingYes || isConfirmingNo;

    const metricColor =
        metricType === 'VIEWS' ? 'bg-blue-500' :
            metricType === 'RETWEETS' ? 'bg-green-500' :
                metricType === 'LIKES' ? 'bg-red-500' :
                    'bg-orange-500';

    return (
        <>
            <ConfettiSimple isActive={showConfetti} duration={2500} />
            <div className="bg-white border-4 border-black shadow-hard flex flex-col relative overflow-hidden min-h-[400px]">
                {/* Success Screen */}
                {isSuccess ? (
                    <div className="absolute inset-0 z-50 bg-banger-yellow flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 pattern-lines px-6">
                        <div className="bg-white border-4 border-black p-8 shadow-hard text-center transform -rotate-1">
                            <div className="font-display text-4xl mb-2 text-black">ORDER FILLED</div>
                            <div className="font-mono text-xl">TO THE MOON 🚀</div>
                        </div>
                        <div className="mt-8 font-mono text-xs text-black/60 animate-pulse">
                            UPDATING POSITIONS...
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-banger-black text-white p-4 border-b-4 border-black flex justify-between items-center relative overflow-hidden">

                            <div className="pattern-dots absolute inset-0 opacity-20"></div>
                            <div className="relative z-10">
                                <h3 className="font-display text-xl uppercase">Trade Console</h3>
                                <div className={`text-[10px] font-mono font-bold ${metricColor} px-2 py-0.5 text-white inline-block mt-1 border border-white shadow-[2px_2px_0px_0px_#fff]`}>
                                    TRADING: {metricType}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-banger-yellow relative z-10">
                                <div className="w-2 h-2 bg-banger-yellow rounded-full animate-pulse shadow-[0_0_10px_#ecfd00]" />
                                LIVE
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-6">

                            {/* Arcade Style Position Toggles */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPosition('YES')}
                                    className={`
              relative h-28 transition-all duration-100 group
              border-4 border-black font-display uppercase text-2xl flex flex-col items-center justify-center gap-2
              ${position === 'YES'
                                            ? 'bg-[#00ff00] text-black shadow-arcade-pressed translate-y-[6px] translate-x-[6px]'
                                            : 'bg-gray-100 text-gray-400 shadow-arcade hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-hard-sm'}
            `}
                                >
                                    <ThumbsUp size={24} strokeWidth={3} className={position === 'YES' ? 'animate-bounce' : ''} />
                                    <div>YES</div>
                                    <div className="text-sm font-mono bg-black text-white px-2 py-1 rounded-sm">{yesPrice}¢</div>
                                    <div className="absolute top-2 left-2 w-full h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                                </button>

                                <button
                                    onClick={() => setPosition('NO')}
                                    className={`
              relative h-28 transition-all duration-100 group
              border-4 border-black font-display uppercase text-2xl flex flex-col items-center justify-center gap-2
              ${position === 'NO'
                                            ? 'bg-[#ff0055] text-white shadow-arcade-pressed translate-y-[6px] translate-x-[6px]'
                                            : 'bg-gray-100 text-gray-400 shadow-arcade hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-hard-sm'}
            `}
                                >
                                    <ThumbsDown size={24} strokeWidth={3} className={position === 'NO' ? 'animate-bounce' : ''} />
                                    <div>NO</div>
                                    <div className="text-sm font-mono bg-black text-white px-2 py-1 rounded-sm">{noPrice}¢</div>
                                    <div className="absolute top-2 left-2 w-full h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div className="bg-banger-black p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="font-mono font-bold text-xs text-gray-400 uppercase">Wager Amount</label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] text-banger-yellow">BAL: ${balanceDisplay}</span>
                                        {isConnected && Number(balanceDisplay) < 10 && (
                                            <button
                                                onClick={handleMintUsdc}
                                                disabled={isMinting || isMintingConfirming}
                                                className="font-mono text-[10px] bg-banger-pink text-white px-2 py-0.5 border border-white hover:bg-white hover:text-black transition-colors"
                                            >
                                                {isMinting || isMintingConfirming ? '...' : '+MINT'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <DollarSign className="absolute top-1/2 -translate-y-1/2 left-3 text-banger-yellow pointer-events-none" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-gray-900 border-2 border-gray-700 text-white font-mono text-xl p-2 pl-10 focus:outline-none focus:border-banger-yellow focus:bg-black transition-all placeholder-gray-700"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Preset Buttons */}
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                    {[10, 50, 100, 500].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val.toString())}
                                            className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-mono font-bold py-1 border-b-2 border-black active:border-t-2 active:border-b-0"
                                        >
                                            ${val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Your Positions */}
                            {isConnected && (Number(yesSharesDisplay) > 0 || Number(noSharesDisplay) > 0) && (
                                <div className="bg-gray-100 border-2 border-black p-3 font-mono text-sm">
                                    <div className="text-xs font-bold text-gray-500 mb-2">YOUR POSITIONS</div>
                                    <div className="flex gap-4">
                                        {Number(yesSharesDisplay) > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-green-500 text-white px-2 py-0.5 text-xs font-bold">YES</span>
                                                <span>{yesSharesDisplay} shares</span>
                                            </div>
                                        )}
                                        {Number(noSharesDisplay) > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold">NO</span>
                                                <span>{noSharesDisplay} shares</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Receipt / Summary */}
                            <div className="bg-white border-2 border-black p-4 space-y-2 relative font-mono text-sm">
                                <div className="absolute -top-2 left-0 w-full h-2 bg-[length:10px_10px] bg-[linear-gradient(45deg,transparent_33%,#000_33%,#000_66%,transparent_66%)] bg-repeat-x"></div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Price</span>
                                    <span className="font-bold">{currentPrice}¢</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estimated Shares</span>
                                    <span className="font-bold">{shares.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Max Payout</span>
                                    <span className="font-bold text-green-600">${potentialReturn.toFixed(2)}</span>
                                </div>
                                <div className="border-t-2 border-dashed border-gray-300 pt-2 mt-2 flex justify-between items-center">
                                    <span className="text-gray-600">Potential ROI</span>
                                    <span className="font-bold bg-black text-banger-yellow px-2">
                                        +{roi}%
                                    </span>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 font-mono text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="mt-2">
                                <BrutalistButton
                                    className="w-full py-4 text-xl flex justify-center items-center gap-2 shadow-arcade active:shadow-arcade-pressed active:translate-y-[6px] active:translate-x-[6px] transition-all"
                                    onClick={handleTrade}
                                    disabled={isLoading}
                                    variant={position === 'YES' ? 'primary' : 'danger'}
                                >
                                    {!isConnected ? (
                                        'CONNECT WALLET'
                                    ) : isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {needsApproval ? 'APPROVING...' : 'CONFIRMING...'}
                                        </>
                                    ) : needsApproval ? (
                                        'APPROVE USDC'
                                    ) : (
                                        <>BUY {position} <ArrowRight strokeWidth={3} /></>
                                    )}
                                </BrutalistButton>
                                <p className="text-center font-mono text-[10px] text-gray-400 mt-2">
                                    Fee: 1% • Powered by BANGR AMM
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
