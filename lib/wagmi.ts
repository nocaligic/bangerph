import { http, fallback } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { bscTestnet } from 'wagmi/chains';

// BNB Testnet RPCs (no CORS restrictions)
const bscTestnetRPCs = [
    'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
    'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
    'https://data-seed-prebsc-1-s2.bnbchain.org:8545',
    'https://data-seed-prebsc-2-s2.bnbchain.org:8545',
];

export const wagmiConfig = createConfig({
    chains: [bscTestnet],
    transports: {
        [bscTestnet.id]: fallback(
            bscTestnetRPCs.map(rpc => http(rpc, {
                timeout: 15_000,
                retryCount: 2,
            }))
        ),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiConfig;
    }
}
