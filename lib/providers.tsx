import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './wagmi';
import { bscTestnet } from 'wagmi/chains';

const queryClient = new QueryClient();

// Get Privy App ID from environment variable
const PRIVY_APP_ID = (import.meta as any).env?.VITE_PRIVY_APP_ID || '';

interface ProvidersProps {
    children: React.ReactNode;
}

import { DegenProvider } from '../contexts/DegenContext';

export function Providers({ children }: ProvidersProps) {
    // Always render providers - Privy will show error if no app ID
    // But wagmi hooks will still work
    return (
        <PrivyProvider
            appId={PRIVY_APP_ID}
            config={{
                appearance: {
                    theme: 'dark',
                    accentColor: '#ecfd00', // banger-yellow (character color)
                },
                supportedChains: [bscTestnet],
                defaultChain: bscTestnet,
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },
                loginMethods: ['email', 'wallet', 'twitter'],
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig}>
                    <DegenProvider>
                        {children}
                    </DegenProvider>
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}
