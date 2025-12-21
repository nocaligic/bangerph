// Contract addresses deployed to BSC Testnet
// Deployed: 2025-12-20

export const CONTRACTS = {
    bscTestnet: {
        chainId: 97,
        mockUSDC: '0xb0edAB53b28B4A13B396e66e6892ad553429A49f' as const,
        shareToken: '0x56591846d568350705F6238089dA36f8F459A553' as const,
        marketFactory: '0xC1F10B760AAD6949f264122749E80b42C76b6b4F' as const,
    }
} as const;

// Get current network contracts
export function getContracts(chainId: number = 97) {
    if (chainId === 97) {
        return CONTRACTS.bscTestnet;
    }
    // Default to testnet
    return CONTRACTS.bscTestnet;
}
