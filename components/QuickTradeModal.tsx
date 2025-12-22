/**
 * QuickTradeModal - A popup modal for quick trading from market cards
 * Uses real contract calls for buying YES/NO shares
 */

import React, { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import {
    useYesPrice,
    useNoPrice,
    useApproveUsdc,
    useBuyYes,
    useBuyNo,
    useUsdcBalance,
    useUsdcAllowance
} from '../lib/contracts/hooks';
import { BrutalistButton } from './BrutalistButton';
import { ConfettiSimple } from './Confetti';

interface QuickTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    marketId: number;
    initialSide: 'YES' | 'NO';
    metricName?: string;
    targetValue?: string;
}

const QUICK_AMOUNTS = [10, 50, 100, 500];

export const QuickTradeModal: React.FC<QuickTradeModalProps> = ({
    isOpen,
    onClose,
    marketId,
    initialSide,
    metricName = 'VIEWS',
    targetValue = '1M'
}) => {
    const { isConnected, address } = useAccount();
    const [side, setSide] = useState<'YES' | 'NO'>(initialSide);
    const [amount, setAmount] = useState('10');
    const [error, setError] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Contract data
    const { priceCents: yesPrice } = useYesPrice(marketId);
    const { priceCents: noPrice } = useNoPrice(marketId);
    const { data: balance } = useUsdcBalance(address);
    const { data: allowance } = useUsdcAllowance(address);

    // Contract actions
    const { approve, isPending: isApproving, isConfirming: isApprovingConfirming } = useApproveUsdc();
    const { buyYes, isPending: isBuyingYes, isConfirming: isBuyingYesConfirming } = useBuyYes();
    const { buyNo, isPending: isBuyingNo, isConfirming: isBuyingNoConfirming } = useBuyNo();

    // Reset side when prop changes
    useEffect(() => {
        setSide(initialSide);
    }, [initialSide]);

    if (!isOpen) return null;

    const currentPrice = side === 'YES' ? (yesPrice ?? 50) : (noPrice ?? 50);
    const amountNum = parseFloat(amount) || 0;
    const amountStr = amountNum.toString();

    // Estimate shares based on AMM formula
    const priceNumber = Number(currentPrice);
    const estimatedShares = amountNum > 0 && priceNumber > 0
        ? (amountNum / (priceNumber / 100)).toFixed(2)
        : '0';

    const maxPayout = parseFloat(estimatedShares);
    const potentialROI = amountNum > 0 ? (((maxPayout - amountNum) / amountNum) * 100).toFixed(0) : '0';

    const balanceDisplay = balance ? (Number(balance) / 1e6).toFixed(2) : '0';
    const hasEnoughBalance = balance ? Number(balance) >= amountNum * 1e6 : false;
    const allowanceNum = allowance ? Number(allowance) : 0;
    const needsApproval = allowanceNum < amountNum * 1e6;

    const isLoading = isApproving || isApprovingConfirming || isBuyingYes || isBuyingYesConfirming || isBuyingNo || isBuyingNoConfirming;

    const handleApprove = async () => {
        setError(null);
        try {
            await approve(amountStr);
        } catch (err: any) {
            setError(err.message || 'Approval failed');
        }
    };

    const handleBuy = async () => {
        setError(null);
        try {
            if (side === 'YES') {
                await buyYes(marketId, amountStr);
            } else {
                await buyNo(marketId, amountStr);
            }
            // Show confetti celebration!
            setShowConfetti(true);
        } catch (err: any) {
            setError(err.message || 'Trade failed');
        }
    };

    const handleConfettiComplete = () => {
        setShowConfetti(false);
        onClose();
    };

    return (
        <>
            <ConfettiSimple
                isActive={showConfetti}
                onComplete={handleConfettiComplete}
                duration={2500}
            />
            <div
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
                onClick={onClose}
            >
                {showConfetti ? (
                    /* Full success "Screen" replacing the modal box */
                    <div
                        className="bg-banger-yellow border-4 border-black p-12 shadow-hard text-center animate-in zoom-in duration-300 pattern-lines flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white border-4 border-black p-10 shadow-hard transform -rotate-1">
                            <div className="font-display text-5xl mb-2 text-black">ORDER FILLED</div>
                            <div className="font-mono text-2xl">TO THE MOON 🚀</div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="bg-banger-black border-4 border-black shadow-hard max-w-sm w-full relative animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b-2 border-gray-700">
                            <div className="flex items-center gap-2">
                                <h2 className="font-display text-xl text-white uppercase">Quick Trade</h2>
                                <span className="bg-banger-pink text-white font-mono text-[10px] px-2 py-0.5 border border-white uppercase">
                                    {metricName}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* YES/NO Toggle */}
                        <div className="grid grid-cols-2 gap-3 p-4">
                            <button
                                onClick={() => setSide('YES')}
                                className={`
                            p-4 border-4 border-black transition-all flex flex-col items-center gap-1
                            ${side === 'YES'
                                        ? 'bg-green-500 text-white shadow-[4px_4px_0px_0px_#00ff00]'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
                        `}
                            >
                                <ThumbsUp size={24} />
                                <span className="font-display text-lg">YES</span>
                                <span className="font-mono text-sm">{yesPrice ?? 50}¢</span>
                            </button>
                            <button
                                onClick={() => setSide('NO')}
                                className={`
                            p-4 border-4 border-black transition-all flex flex-col items-center gap-1
                            ${side === 'NO'
                                        ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_#ff0000]'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
                        `}
                            >
                                <ThumbsDown size={24} />
                                <span className="font-display text-lg">NO</span>
                                <span className="font-mono text-sm">{noPrice ?? 50}¢</span>
                            </button>
                        </div>

                        {/* Amount Input */}
                        <div className="px-4 pb-4">
                            <div className="bg-gray-900 border-2 border-gray-700 p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono text-[10px] text-gray-400 uppercase">Wager Amount</span>
                                    <span className="font-mono text-[10px] text-gray-400">BAL: ${balanceDisplay}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="text-gray-500" size={20} />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="flex-1 bg-transparent text-white font-mono text-2xl focus:outline-none"
                                        placeholder="10"
                                    />
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {QUICK_AMOUNTS.map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val.toString())}
                                            className={`flex-1 py-1 border font-mono text-xs transition-colors
                                        ${amount === val.toString()
                                                    ? 'bg-banger-cyan text-black border-banger-cyan'
                                                    : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-gray-500'}`}
                                        >
                                            ${val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mx-4 mb-4 border-t-2 border-dashed border-gray-700 pt-3">
                            <div className="space-y-2 font-mono text-sm">
                                <div className="flex justify-between text-gray-400">
                                    <span>Price</span>
                                    <span className="text-white">{currentPrice}¢</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Estimated Shares</span>
                                    <span className="text-white">{estimatedShares}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Max Payout</span>
                                    <span className="text-green-400">${maxPayout.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Potential ROI</span>
                                    <span className={`${Number(potentialROI) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        +{potentialROI}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mx-4 mb-4 bg-red-900/50 border border-red-500 text-red-400 p-2 font-mono text-xs flex items-center gap-2">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="p-4 pt-0">
                            {!isConnected ? (
                                <div className="text-center text-gray-400 font-mono text-sm">
                                    Connect wallet to trade
                                </div>
                            ) : needsApproval ? (
                                <BrutalistButton
                                    onClick={handleApprove}
                                    disabled={isLoading || !hasEnoughBalance}
                                    className="w-full"
                                    variant="secondary"
                                >
                                    {isLoading ? 'APPROVING...' : 'APPROVE USDC'}
                                </BrutalistButton>
                            ) : (
                                <BrutalistButton
                                    onClick={handleBuy}
                                    disabled={isLoading || !hasEnoughBalance || amountNum <= 0}
                                    className="w-full"
                                    variant={side === 'YES' ? 'primary' : 'primary'}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {isLoading ? 'PROCESSING...' : `BUY ${side}`}
                                        <TrendingUp size={16} />
                                    </span>
                                </BrutalistButton>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="text-center pb-3">
                            <span className="font-mono text-[10px] text-gray-500">
                                Fee: 1% • Powered by BANGR AMM
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
