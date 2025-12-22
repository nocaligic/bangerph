// Contract addresses deployed to BSC Testnet
// Deployed: 2025-12-22 - V2

export const CONTRACTS = {
    bscTestnet: {
        chainId: 97,
        mockUSDC: '0xf71A99BD244a1f73Aa07A2ccaA315ADB9D41CaCf' as const,
        shareToken: '0x331042bf992BcD11521DfC88bB7b17f2B83f9336' as const,
        marketFactory: '0x9cc98DE92B173e24be98543ffabcd5B28b528F60' as const,
    }
} as const;

// Short aliases for quick access
export const MARKET_FACTORY = CONTRACTS.bscTestnet.marketFactory;
export const MOCK_USDC = CONTRACTS.bscTestnet.mockUSDC;
export const SHARE_TOKEN = CONTRACTS.bscTestnet.shareToken;
export const CHAIN_ID = 97;

// Get current network contracts
export function getContracts(chainId: number = 97) {
    if (chainId === 97) {
        return CONTRACTS.bscTestnet;
    }
    // Default to testnet
    return CONTRACTS.bscTestnet;
}
