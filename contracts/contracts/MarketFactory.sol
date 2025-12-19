// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ShareToken.sol";

/**
 * @title MarketFactory (Simplified)
 * @notice Creates and manages prediction markets for Twitter engagement
 * @dev Simplified version: one market per metric per tweet, fixed 24h duration
 */
contract MarketFactory is Ownable, ReentrancyGuard {

    // Enums
    enum MetricType { VIEWS, LIKES, RETWEETS, COMMENTS }
    enum ResolutionStatus { PENDING, RESOLVED_YES, RESOLVED_NO, RESOLVED_INVALID }

    // Structs
    struct Market {
        uint256 id;
        string tweetUrl;
        string tweetId;
        string authorHandle;
        address scout;              // Market creator
        MetricType metric;
        uint256 currentValue;       // Snapshot at creation
        uint256 targetValue;        // Target to hit
        uint256 startTime;
        uint256 endTime;            // startTime + 24 hours
        ResolutionStatus status;
        uint256 yesTokenId;
        uint256 noTokenId;
        uint256 totalYesShares;     // Total YES shares in circulation
        uint256 totalNoShares;      // Total NO shares in circulation
    }

    // State variables
    ShareToken public shareToken;
    IERC20 public collateralToken;  // USDC (6 decimals)

    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;

    // Market uniqueness: hash(tweetId, metric) => marketId
    // Max 4 markets per tweet (one per metric)
    mapping(bytes32 => uint256) public marketByHash;
    mapping(bytes32 => bool) public marketExists;

    // Constants
    uint256 public constant INITIAL_LIQUIDITY = 10 * 10**6; // 10 USDC (6 decimals)
    uint256 public constant SHARES_PER_SET = 1 * 10**18;    // 1 share = 1e18
    uint256 public constant MARKET_DURATION = 24 hours;
    uint256 public constant RESOLUTION_DELAY = 1 hours;
    uint256 public constant SHARE_PRICE = 1 * 10**6;        // $1 per share set (6 decimals)

    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed scout,
        string tweetId,
        MetricType metric,
        uint256 currentValue,
        uint256 targetValue
    );

    event SharesBought(
        uint256 indexed marketId,
        address indexed buyer,
        bool isYes,
        uint256 shares,
        uint256 cost
    );

    event SharesSold(
        uint256 indexed marketId,
        address indexed seller,
        bool isYes,
        uint256 shares,
        uint256 payout
    );

    event MarketResolved(
        uint256 indexed marketId,
        ResolutionStatus status,
        uint256 finalValue
    );

    event SharesRedeemed(
        uint256 indexed marketId,
        address indexed user,
        uint256 shares,
        uint256 payout
    );

    constructor(
        address _shareToken,
        address _collateralToken
    ) Ownable(msg.sender) {
        shareToken = ShareToken(_shareToken);
        collateralToken = IERC20(_collateralToken);
    }

    /**
     * @notice Create a new prediction market
     * @param tweetUrl Full tweet URL
     * @param tweetId Tweet ID extracted from URL
     * @param authorHandle Twitter handle of tweet author
     * @param metric Type of metric (VIEWS, LIKES, RETWEETS, COMMENTS)
     * @param currentValue Current metric value at creation
     * @param targetValue Target value to hit (set by scout)
     */
    function createMarket(
        string memory tweetUrl,
        string memory tweetId,
        string memory authorHandle,
        MetricType metric,
        uint256 currentValue,
        uint256 targetValue
    ) external nonReentrant returns (uint256 marketId) {
        require(targetValue > currentValue, "Target must be > current");

        // Check market uniqueness: only one market per (tweetId, metric)
        bytes32 marketHash = keccak256(abi.encode(tweetId, metric));
        require(!marketExists[marketHash], "Market already exists for this metric");

        // Transfer initial liquidity from scout
        require(
            collateralToken.transferFrom(msg.sender, address(this), INITIAL_LIQUIDITY),
            "USDC transfer failed"
        );

        // Create market
        marketId = nextMarketId++;

        markets[marketId] = Market({
            id: marketId,
            tweetUrl: tweetUrl,
            tweetId: tweetId,
            authorHandle: authorHandle,
            scout: msg.sender,
            metric: metric,
            currentValue: currentValue,
            targetValue: targetValue,
            startTime: block.timestamp,
            endTime: block.timestamp + MARKET_DURATION,
            status: ResolutionStatus.PENDING,
            yesTokenId: shareToken.getYesTokenId(marketId),
            noTokenId: shareToken.getNoTokenId(marketId),
            totalYesShares: 10 * SHARES_PER_SET,  // Scout gets 10 of each
            totalNoShares: 10 * SHARES_PER_SET
        });

        // Mark market as existing
        marketExists[marketHash] = true;
        marketByHash[marketHash] = marketId;

        // Mint initial shares to scout (10 YES + 10 NO)
        shareToken.mint(msg.sender, markets[marketId].yesTokenId, 10 * SHARES_PER_SET);
        shareToken.mint(msg.sender, markets[marketId].noTokenId, 10 * SHARES_PER_SET);

        emit MarketCreated(
            marketId,
            msg.sender,
            tweetId,
            metric,
            currentValue,
            targetValue
        );
    }

    /**
     * @notice Buy YES and NO shares (a complete set for $1)
     * @param marketId Market to buy shares in
     * @param sets Number of share sets to buy (each set = 1 YES + 1 NO for $1)
     */
    function buyShares(uint256 marketId, uint256 sets) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.status == ResolutionStatus.PENDING, "Market not active");
        require(block.timestamp < market.endTime, "Market expired");
        require(sets > 0, "Must buy at least 1 set");

        uint256 cost = sets * SHARE_PRICE;
        
        require(
            collateralToken.transferFrom(msg.sender, address(this), cost),
            "USDC transfer failed"
        );

        uint256 shares = sets * SHARES_PER_SET;
        
        // Mint both YES and NO shares
        shareToken.mint(msg.sender, market.yesTokenId, shares);
        shareToken.mint(msg.sender, market.noTokenId, shares);

        market.totalYesShares += shares;
        market.totalNoShares += shares;

        emit SharesBought(marketId, msg.sender, true, shares, cost);
        emit SharesBought(marketId, msg.sender, false, shares, cost);
    }

    /**
     * @notice Sell a complete set of shares (1 YES + 1 NO = $1)
     * @param marketId Market to sell shares in
     * @param sets Number of share sets to sell
     */
    function sellShares(uint256 marketId, uint256 sets) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.status == ResolutionStatus.PENDING, "Market not active");
        require(sets > 0, "Must sell at least 1 set");

        uint256 shares = sets * SHARES_PER_SET;
        
        // Check user has both YES and NO shares
        require(
            shareToken.balanceOf(msg.sender, market.yesTokenId) >= shares,
            "Insufficient YES shares"
        );
        require(
            shareToken.balanceOf(msg.sender, market.noTokenId) >= shares,
            "Insufficient NO shares"
        );

        // Burn both YES and NO shares
        shareToken.burn(msg.sender, market.yesTokenId, shares);
        shareToken.burn(msg.sender, market.noTokenId, shares);

        market.totalYesShares -= shares;
        market.totalNoShares -= shares;

        uint256 payout = sets * SHARE_PRICE;
        require(
            collateralToken.transfer(msg.sender, payout),
            "USDC transfer failed"
        );

        emit SharesSold(marketId, msg.sender, true, shares, payout);
    }

    /**
     * @notice Resolve a market (owner only)
     * @param marketId Market to resolve
     * @param finalValue Final metric value from oracle
     */
    function resolveMarket(uint256 marketId, uint256 finalValue) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.status == ResolutionStatus.PENDING, "Already resolved");
        require(block.timestamp >= market.endTime + RESOLUTION_DELAY, "Too early");

        if (finalValue >= market.targetValue) {
            market.status = ResolutionStatus.RESOLVED_YES;
        } else {
            market.status = ResolutionStatus.RESOLVED_NO;
        }

        emit MarketResolved(marketId, market.status, finalValue);
    }

    /**
     * @notice Resolve market as invalid (tweet deleted, etc.)
     */
    function resolveAsInvalid(uint256 marketId) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.status == ResolutionStatus.PENDING, "Already resolved");

        market.status = ResolutionStatus.RESOLVED_INVALID;

        emit MarketResolved(marketId, ResolutionStatus.RESOLVED_INVALID, 0);
    }

    /**
     * @notice Redeem winning shares for $1 each
     * @param marketId Market to redeem from
     * @param shares Number of shares to redeem
     */
    function redeem(uint256 marketId, uint256 shares) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.status != ResolutionStatus.PENDING, "Not resolved");
        require(shares > 0, "Must redeem at least 1 share");

        uint256 payout;
        
        if (market.status == ResolutionStatus.RESOLVED_YES) {
            // YES wins - redeem YES shares for $1 each
            require(
                shareToken.balanceOf(msg.sender, market.yesTokenId) >= shares,
                "Insufficient YES shares"
            );
            shareToken.burn(msg.sender, market.yesTokenId, shares);
            payout = (shares * SHARE_PRICE) / SHARES_PER_SET;
            
        } else if (market.status == ResolutionStatus.RESOLVED_NO) {
            // NO wins - redeem NO shares for $1 each
            require(
                shareToken.balanceOf(msg.sender, market.noTokenId) >= shares,
                "Insufficient NO shares"
            );
            shareToken.burn(msg.sender, market.noTokenId, shares);
            payout = (shares * SHARE_PRICE) / SHARES_PER_SET;
            
        } else if (market.status == ResolutionStatus.RESOLVED_INVALID) {
            // Invalid - both YES and NO redeem for $0.50 each
            uint256 yesBalance = shareToken.balanceOf(msg.sender, market.yesTokenId);
            uint256 noBalance = shareToken.balanceOf(msg.sender, market.noTokenId);
            
            if (yesBalance >= shares) {
                shareToken.burn(msg.sender, market.yesTokenId, shares);
            } else if (noBalance >= shares) {
                shareToken.burn(msg.sender, market.noTokenId, shares);
            } else {
                revert("Insufficient shares");
            }
            
            payout = (shares * SHARE_PRICE) / (2 * SHARES_PER_SET); // $0.50 per share
        }

        require(collateralToken.transfer(msg.sender, payout), "Payout failed");

        emit SharesRedeemed(marketId, msg.sender, shares, payout);
    }

    // View functions
    
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getMarketByTweetAndMetric(
        string memory tweetId, 
        MetricType metric
    ) external view returns (uint256 marketId, bool exists) {
        bytes32 marketHash = keccak256(abi.encode(tweetId, metric));
        exists = marketExists[marketHash];
        marketId = marketByHash[marketHash];
    }

    function getMarketCount() external view returns (uint256) {
        return nextMarketId;
    }
}
