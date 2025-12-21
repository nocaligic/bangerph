// Contract ABIs for Bangr
// Auto-generated from compiled contracts

export const MARKET_FACTORY_ABI = [
    // Constructor
    {
        "inputs": [
            { "name": "_shareToken", "type": "address" },
            { "name": "_collateralToken", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    // Events
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": true, "name": "scout", "type": "address" },
            { "indexed": false, "name": "tweetId", "type": "string" },
            { "indexed": false, "name": "metric", "type": "uint8" },
            { "indexed": false, "name": "currentValue", "type": "uint256" },
            { "indexed": false, "name": "targetValue", "type": "uint256" }
        ],
        "name": "MarketCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": true, "name": "buyer", "type": "address" },
            { "indexed": false, "name": "isYes", "type": "bool" },
            { "indexed": false, "name": "sharesReceived", "type": "uint256" },
            { "indexed": false, "name": "usdcPaid", "type": "uint256" },
            { "indexed": false, "name": "newPrice", "type": "uint256" }
        ],
        "name": "SharesBought",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": true, "name": "seller", "type": "address" },
            { "indexed": false, "name": "isYes", "type": "bool" },
            { "indexed": false, "name": "sharesSold", "type": "uint256" },
            { "indexed": false, "name": "usdcReceived", "type": "uint256" },
            { "indexed": false, "name": "newPrice", "type": "uint256" }
        ],
        "name": "SharesSold",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": false, "name": "status", "type": "uint8" },
            { "indexed": false, "name": "finalValue", "type": "uint256" }
        ],
        "name": "MarketResolved",
        "type": "event"
    },
    // Read Functions
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getMarket",
        "outputs": [
            {
                "components": [
                    { "name": "id", "type": "uint256" },
                    { "name": "tweetUrl", "type": "string" },
                    { "name": "tweetId", "type": "string" },
                    { "name": "authorHandle", "type": "string" },
                    { "name": "scout", "type": "address" },
                    { "name": "metric", "type": "uint8" },
                    { "name": "currentValue", "type": "uint256" },
                    { "name": "targetValue", "type": "uint256" },
                    { "name": "startTime", "type": "uint256" },
                    { "name": "endTime", "type": "uint256" },
                    { "name": "status", "type": "uint8" },
                    { "name": "yesTokenId", "type": "uint256" },
                    { "name": "noTokenId", "type": "uint256" }
                ],
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMarketCount",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getYesPrice",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getNoPrice",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getReserves",
        "outputs": [
            { "name": "yesRes", "type": "uint256" },
            { "name": "noRes", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "", "type": "uint256" }],
        "name": "yesReserves",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "", "type": "uint256" }],
        "name": "noReserves",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "usdcAmount", "type": "uint256" }
        ],
        "name": "estimateBuyYes",
        "outputs": [{ "name": "sharesOut", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "usdcAmount", "type": "uint256" }
        ],
        "name": "estimateBuyNo",
        "outputs": [{ "name": "sharesOut", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextMarketId",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    // Write Functions
    {
        "inputs": [
            { "name": "tweetUrl", "type": "string" },
            { "name": "tweetId", "type": "string" },
            { "name": "authorHandle", "type": "string" },
            { "name": "metric", "type": "uint8" },
            { "name": "currentValue", "type": "uint256" },
            { "name": "targetValue", "type": "uint256" }
        ],
        "name": "createMarket",
        "outputs": [{ "name": "marketId", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "usdcAmount", "type": "uint256" }
        ],
        "name": "buyYes",
        "outputs": [{ "name": "sharesOut", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "usdcAmount", "type": "uint256" }
        ],
        "name": "buyNo",
        "outputs": [{ "name": "sharesOut", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "shares", "type": "uint256" }
        ],
        "name": "sellYes",
        "outputs": [{ "name": "usdcOut", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "shares", "type": "uint256" }
        ],
        "name": "sellNo",
        "outputs": [{ "name": "usdcOut", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "shares", "type": "uint256" }
        ],
        "name": "redeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export const MOCK_USDC_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "to", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "owner", "type": "address" },
            { "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "to", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export const SHARE_TOKEN_ABI = [
    {
        "inputs": [
            { "name": "account", "type": "address" },
            { "name": "id", "type": "uint256" }
        ],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getYesTokenId",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getNoTokenId",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "pure",
        "type": "function"
    }
] as const;
