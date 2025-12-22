// Contract ABIs for Bangr V2
// Updated for MarketFactoryV2 with full tweet storage

export const MARKET_FACTORY_ABI = [
    // ============ EVENTS ============
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": false, "name": "tweetId", "type": "string" },
            { "indexed": false, "name": "metric", "type": "uint8" },
            { "indexed": false, "name": "targetValue", "type": "uint256" },
            { "indexed": false, "name": "category", "type": "string" },
            { "indexed": false, "name": "creator", "type": "address" }
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
            { "indexed": false, "name": "usdcAmount", "type": "uint256" },
            { "indexed": false, "name": "sharesReceived", "type": "uint256" },
            { "indexed": false, "name": "newPrice", "type": "uint256" }
        ],
        "name": "SharesPurchased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": true, "name": "seller", "type": "address" },
            { "indexed": false, "name": "isYes", "type": "bool" },
            { "indexed": false, "name": "sharesSold", "type": "uint256" },
            { "indexed": false, "name": "usdcReceived", "type": "uint256" }
        ],
        "name": "SharesSold",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": false, "name": "outcome", "type": "uint8" },
            { "indexed": false, "name": "finalValue", "type": "uint256" }
        ],
        "name": "MarketResolved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "marketId", "type": "uint256" },
            { "indexed": true, "name": "user", "type": "address" },
            { "indexed": false, "name": "amount", "type": "uint256" }
        ],
        "name": "WinningsClaimed",
        "type": "event"
    },

    // ============ CREATE MARKET ============
    {
        "inputs": [
            { "name": "tweetId", "type": "string" },
            { "name": "tweetUrl", "type": "string" },
            { "name": "tweetText", "type": "string" },
            { "name": "authorHandle", "type": "string" },
            { "name": "authorName", "type": "string" },
            { "name": "avatarUrl", "type": "string" },
            { "name": "mediaJson", "type": "string" },
            { "name": "hasQuotedTweet", "type": "bool" },
            { "name": "quotedTweetId", "type": "string" },
            { "name": "quotedTweetText", "type": "string" },
            { "name": "quotedAuthorHandle", "type": "string" },
            { "name": "quotedAuthorName", "type": "string" },
            { "name": "category", "type": "string" },
            { "name": "metric", "type": "uint8" },
            { "name": "targetValue", "type": "uint256" },
            { "name": "duration", "type": "uint256" }
        ],
        "name": "createMarket",
        "outputs": [{ "name": "marketId", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // ============ TRADING ============
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "usdcAmount", "type": "uint256" }
        ],
        "name": "buyYes",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "usdcAmount", "type": "uint256" }
        ],
        "name": "buyNo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "shares", "type": "uint256" }
        ],
        "name": "sellYes",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "shares", "type": "uint256" }
        ],
        "name": "sellNo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // ============ RESOLUTION ============
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "finalValue", "type": "uint256" }
        ],
        "name": "resolveMarket",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "claimWinnings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // ============ VIEW FUNCTIONS ============
    {
        "inputs": [],
        "name": "marketCount",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getMarket",
        "outputs": [
            { "name": "tweetId", "type": "string" },
            { "name": "tweetUrl", "type": "string" },
            { "name": "tweetText", "type": "string" },
            { "name": "authorHandle", "type": "string" },
            { "name": "authorName", "type": "string" },
            { "name": "avatarUrl", "type": "string" },
            { "name": "mediaJson", "type": "string" },
            { "name": "category", "type": "string" },
            { "name": "metric", "type": "uint8" },
            { "name": "targetValue", "type": "uint256" },
            { "name": "startTime", "type": "uint256" },
            { "name": "endTime", "type": "uint256" },
            { "name": "status", "type": "uint8" },
            { "name": "yesPrice", "type": "uint256" },
            { "name": "noPrice", "type": "uint256" },
            { "name": "totalVolume", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getQuotedTweet",
        "outputs": [
            { "name": "hasQuote", "type": "bool" },
            { "name": "quotedId", "type": "string" },
            { "name": "quotedText", "type": "string" },
            { "name": "quotedHandle", "type": "string" },
            { "name": "quotedName", "type": "string" }
        ],
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
        "inputs": [
            { "name": "tweetId", "type": "string" },
            { "name": "metric", "type": "uint8" }
        ],
        "name": "marketExistsFor",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "tweetId", "type": "string" },
            { "name": "metric", "type": "uint8" }
        ],
        "name": "getMarketFor",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "category", "type": "string" }],
        "name": "getMarketsByCategory",
        "outputs": [{ "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "marketId", "type": "uint256" },
            { "name": "user", "type": "address" }
        ],
        "name": "getUserPosition",
        "outputs": [
            { "name": "yesShares", "type": "uint256" },
            { "name": "noShares", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "marketId", "type": "uint256" }],
        "name": "getTokenIds",
        "outputs": [
            { "name": "yesTokenId", "type": "uint256" },
            { "name": "noTokenId", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    // ============ CONSTANTS ============
    {
        "inputs": [],
        "name": "PROTOCOL_FEE_BPS",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "INITIAL_LIQUIDITY",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DEFAULT_DURATION",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const MOCK_USDC_ABI = [
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
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
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
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "view",
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
        "inputs": [
            { "name": "operator", "type": "address" },
            { "name": "approved", "type": "bool" }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "account", "type": "address" },
            { "name": "operator", "type": "address" }
        ],
        "name": "isApprovedForAll",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
