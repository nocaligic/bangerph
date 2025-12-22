import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { bscTestnet } from 'wagmi/chains';

const TARGET_CHAIN_ID = bscTestnet.id; // 97 for testnet

export function useWallet() {
    const { login, logout, authenticated, ready, user } = usePrivy();
    const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
    const { wallets, ready: walletsReady } = useWallets();
    const { switchChain, isPending: isSwitching } = useSwitchChain();
    const chainId = useChainId();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-switch to BSC Testnet when connected but on wrong chain
    useEffect(() => {
        const autoSwitchChain = async () => {
            if (wagmiConnected && chainId && chainId !== TARGET_CHAIN_ID && !isSwitching) {
                console.log(`[Wallet] Wrong chain detected: ${chainId}. Switching to BSC Testnet (${TARGET_CHAIN_ID})...`);
                try {
                    await switchChain({ chainId: TARGET_CHAIN_ID });
                    console.log('[Wallet] Successfully switched to BSC Testnet');
                } catch (error) {
                    console.error('[Wallet] Error switching chain:', error);
                }
            }
        };
        autoSwitchChain();
    }, [wagmiConnected, chainId, switchChain, isSwitching]);

    // Also try to switch for Privy embedded wallets
    useEffect(() => {
        const autoConnect = async () => {
            if (authenticated && ready && walletsReady && wallets.length > 0) {
                const wallet = wallets[0]; // Use first wallet
                if (wallet) {
                    try {
                        await wallet.switchChain(TARGET_CHAIN_ID);
                    } catch (error) {
                        // Ignore if already on correct chain
                    }
                }
            }
        };
        autoConnect();
    }, [authenticated, ready, walletsReady, wallets]);

    const isConnected = mounted && authenticated && ready && !!wagmiAddress;
    const isWrongChain = chainId !== TARGET_CHAIN_ID;
    const address = mounted && wagmiAddress ? wagmiAddress : '';
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

    const connect = () => {
        if (!ready) return;
        if (!authenticated) {
            login();
        }
    };

    const disconnect = () => {
        logout();
    };

    const switchToCorrectChain = async () => {
        try {
            await switchChain({ chainId: TARGET_CHAIN_ID });
        } catch (error) {
            console.error('Error switching chain:', error);
        }
    };

    return {
        isConnected,
        isWrongChain,
        isSwitching,
        address,
        shortAddress,
        connect,
        disconnect,
        switchToCorrectChain,
        ready,
        user,
        chainId,
    };
}
