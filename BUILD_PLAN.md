# BANGR Build Plan: Phase-by-Phase

> **Objective:** Migrate and simplify bangrsh contracts into bangerph, then wire to the UI for a working prediction market prototype.

---

## Overview

| Phase | Focus | Estimated Time | Status |
|-------|-------|----------------|--------|
| Phase 1 | Migration & Setup | 1 hour | ✅ Complete |
| Phase 2 | Contract Simplification | 2-3 hours | ✅ Complete |
| Phase 3 | Deploy to Testnet | 1 hour | ⬜ Not Started |
| Phase 4 | Frontend Integration | 3-4 hours | ⬜ Not Started |
| Phase 5 | Testing & Polish | 2 hours | ⬜ Not Started |

**Total Estimated Time: 9-11 hours (1.5-2 days)**

---

## Phase 1: Migration & Setup

### Goal
Copy necessary infrastructure from bangrsh to bangerph.

### Tasks

- [ ] **1.1** Create `/contracts` folder in bangerph
- [ ] **1.2** Copy Hardhat config and dependencies
  ```
  FROM: bangrsh/bangr/contracts/
  TO:   bangerph/contracts/
  
  Files:
  - hardhat.config.ts
  - package.json
  - tsconfig.json
  ```
- [ ] **1.3** Copy smart contracts
  ```
  Files:
  - MarketFactory.sol (will simplify in Phase 2)
  - ShareToken.sol
  - MockUSDC.sol
  ```
- [ ] **1.4** Copy wallet/provider setup
  ```
  FROM: bangrsh/bangr/lib/wagmi.ts
  FROM: bangrsh/bangr/contexts/WalletContext.tsx
  TO:   bangerph/lib/
  ```
- [ ] **1.5** Install dependencies
  ```bash
  cd bangerph/contracts
  npm install
  ```
- [ ] **1.6** Verify Hardhat compiles
  ```bash
  npx hardhat compile
  ```

### Deliverable
✅ Contracts compile successfully in bangerph

---

## Phase 2: Contract Simplification

### Goal
Simplify MarketFactory.sol to match our new model (one market per metric, max 4 per tweet).

### Tasks

- [ ] **2.1** Remove complex features from MarketFactory.sol:
  - [ ] Remove `Duration` enum (fixed 24h only)
  - [ ] Remove `multiplier` options (scout sets target directly)
  - [ ] Simplify fee distribution

- [ ] **2.2** Update market uniqueness check:
  ```solidity
  // OLD: Hash includes duration + multiplier (32 markets possible)
  bytes32 marketHash = keccak256(abi.encode(tweetId, metric, duration, multiplier));
  
  // NEW: Hash is just tweetId + metric (4 markets max)
  bytes32 marketHash = keccak256(abi.encode(tweetId, metric));
  ```

- [ ] **2.3** Simplify createMarket function:
  ```solidity
  function createMarket(
      string memory tweetUrl,
      string memory tweetId,
      string memory authorHandle,
      MetricType metric,
      uint256 currentValue,
      uint256 targetValue  // Scout sets target directly
  ) external returns (uint256 marketId);
  ```

- [ ] **2.4** Update Market struct:
  ```solidity
  struct Market {
      uint256 id;
      string tweetUrl;
      string tweetId;
      string authorHandle;
      address scout;
      MetricType metric;
      uint256 currentValue;
      uint256 targetValue;
      uint256 startTime;
      uint256 endTime;        // startTime + 24 hours
      ResolutionStatus status;
      uint256 yesTokenId;
      uint256 noTokenId;
  }
  ```

- [ ] **2.5** Add simple buy/sell functions (no order book):
  ```solidity
  function buyYes(uint256 marketId, uint256 amount) external;
  function buyNo(uint256 marketId, uint256 amount) external;
  function sell(uint256 marketId, bool isYes, uint256 shares) external;
  ```

- [ ] **2.6** Add redemption function:
  ```solidity
  function redeem(uint256 marketId, uint256 shares) external;
  ```

- [ ] **2.7** Write unit tests for simplified contract

### Deliverable
✅ Simplified MarketFactory.sol compiles and passes tests

---

## Phase 3: Deploy to Testnet

### Goal
Deploy contracts to BNB Testnet with test USDC.

### Tasks

- [ ] **3.1** Get BNB testnet tokens
  ```
  Faucet: https://testnet.bnbchain.org/faucet-smart
  ```

- [ ] **3.2** Deploy MockUSDC (testnet USDC)
  ```bash
  npx hardhat run scripts/deploy-usdc.ts --network bscTestnet
  ```

- [ ] **3.3** Deploy ShareToken
  ```bash
  npx hardhat run scripts/deploy-sharetoken.ts --network bscTestnet
  ```

- [ ] **3.4** Deploy MarketFactory
  ```bash
  npx hardhat run scripts/deploy-factory.ts --network bscTestnet
  ```

- [ ] **3.5** Verify contracts on BscScan
  ```bash
  npx hardhat verify --network bscTestnet <ADDRESS>
  ```

- [ ] **3.6** Save contract addresses to config file
  ```typescript
  // lib/contracts/addresses.ts
  export const ADDRESSES = {
    USDC: "0x...",
    ShareToken: "0x...",
    MarketFactory: "0x...",
  };
  ```

### Deliverable
✅ Contracts deployed and verified on BNB Testnet

---

## Phase 4: Frontend Integration

### Goal
Wire the existing UI to the deployed contracts.

### Tasks

#### 4.1 Wallet Connection
- [ ] Install Privy SDK
  ```bash
  npm install @privy-io/react-auth @privy-io/wagmi wagmi viem
  ```
- [ ] Set up PrivyProvider in app
- [ ] Add wallet connect button functionality
- [ ] Test wallet connection on BNB Testnet

#### 4.2 Contract Hooks
- [ ] Create `useMarketFactory` hook
  ```typescript
  // Read functions
  const { data: market } = useReadMarket(marketId);
  const { data: markets } = useReadAllMarkets();
  
  // Write functions
  const { write: createMarket } = useCreateMarket();
  const { write: buyYes } = useBuyYes();
  const { write: buyNo } = useBuyNo();
  ```

- [ ] Create `useUserPositions` hook
  ```typescript
  const { data: positions } = useUserPositions(address);
  ```

#### 4.3 Connect UI Components
- [ ] **CreateMarketModal** → calls `createMarket()`
- [ ] **TradePanel** → calls `buyYes()` / `buyNo()`
- [ ] **MarketCard** → reads market data from contract
- [ ] **Portfolio** (if adding) → shows user positions

#### 4.4 Transaction Handling
- [ ] Add loading states during transactions
- [ ] Add success/error toasts
- [ ] Handle transaction confirmations

### Deliverable
✅ Users can create markets and trade via the UI

---

## Phase 5: Testing & Polish

### Goal
Test full flow end-to-end and fix issues.

### Tasks

- [ ] **5.1** Test market creation flow
  - Paste tweet URL
  - Select metric
  - Set target
  - Pay $10 USDC
  - Market appears in list

- [ ] **5.2** Test trading flow
  - Click market
  - Buy YES/NO shares
  - See position in portfolio

- [ ] **5.3** Test resolution (manual for now)
  - Owner calls resolveMarket()
  - Winners can redeem

- [ ] **5.4** Fix any bugs found

- [ ] **5.5** Add real tweet fetching (optional)
  - Apify integration for metrics
  - Or: use mock data for demo

- [ ] **5.6** Record demo video

### Deliverable
✅ Working prototype ready for demo

---

## Contract Addresses (Fill After Deploy)

| Contract | Testnet Address | Mainnet Address |
|----------|-----------------|-----------------|
| MockUSDC | `0x...` | - |
| ShareToken | `0x...` | - |
| MarketFactory | `0x...` | - |

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ACTIVE_CHAIN_ID=97  # BNB Testnet
PRIVATE_KEY=your_deployer_key
BSCSCAN_API_KEY=your_bscscan_key
PRIVY_APP_ID=your_privy_app_id
```

---

## Dependencies to Install

```bash
# Frontend (bangerph)
npm install @privy-io/react-auth @privy-io/wagmi wagmi viem

# Contracts (bangerph/contracts)
npm install hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

---

## Resources

- **BNB Testnet Faucet:** https://testnet.bnbchain.org/faucet-smart
- **BscScan Testnet:** https://testnet.bscscan.com/
- **Privy Dashboard:** https://dashboard.privy.io/
- **Original Contracts:** `bangrsh/bangr/contracts/`

---

*Last updated: 2024-12-19*
*Status: Ready to start Phase 1*
