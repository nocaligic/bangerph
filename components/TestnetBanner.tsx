import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { bscTestnet } from 'wagmi/chains';

/**
 * Simple testnet mode indicator banner
 * Balance and mint functionality moved to header
 */
export const TestnetBanner: React.FC = () => {
    const { isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

    // Check if on correct chain
    const isTestnet = chainId === 97;
    const isWrongChain = isConnected && chainId !== 97;

    // Show wrong chain warning
    if (isConnected && isWrongChain) {
        return (
            <div className="bg-red-500 border-b-2 border-black px-4 py-2 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-white" />
                    <span className="font-mono text-sm font-bold text-white">
                        ⚠️ WRONG NETWORK - Please switch to BSC Testnet
                    </span>
                </div>
                <button
                    onClick={() => switchChain({ chainId: bscTestnet.id })}
                    disabled={isSwitchingChain}
                    className="flex items-center gap-2 px-3 py-1 font-mono text-sm font-bold bg-white text-black border-2 border-black hover:bg-yellow-200 transition-colors"
                >
                    {isSwitchingChain ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Switching...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={14} />
                            Switch Network
                        </>
                    )}
                </button>
            </div>
        );
    }

    // Don't render if not on testnet or not connected
    if (!isConnected || !isTestnet) return null;

    // Simple centered testnet indicator
    return (
        <div className="bg-amber-400 border-b-2 border-black px-4 py-1.5 flex items-center justify-center gap-2">
            <AlertTriangle size={14} className="text-black" />
            <span className="font-mono text-xs font-bold text-black">
                TESTNET MODE - BSC Testnet (Chain ID: 97)
            </span>
        </div>
    );
};
