import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export function useWallet() {
    const { login, logout, authenticated, ready, user } = usePrivy();
    const { address: wagmiAddress } = useAccount();
    const { wallets, ready: walletsReady } = useWallets();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-connect embedded wallet when authenticated
    useEffect(() => {
        const autoConnect = async () => {
            if (authenticated && ready && walletsReady && wallets.length > 0 && !wagmiAddress) {
                const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
                if (embeddedWallet) {
                    try {
                        await embeddedWallet.switchChain(97); // BNB Testnet
                    } catch (error) {
                        console.error('Error auto-connecting wallet:', error);
                    }
                }
            }
        };
        autoConnect();
    }, [authenticated, ready, walletsReady, wallets, wagmiAddress]);

    const isConnected = mounted && authenticated && ready && !!wagmiAddress;
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

    return {
        isConnected,
        address,
        shortAddress,
        connect,
        disconnect,
        ready,
        user,
    };
}
