# BANGR Implementation Plan (Simplified)

> **Goal:** Ship a simple, working prediction market for Twitter metrics in 2-3 days.

---

## ✅ Core Principle: Back to Basics

**Keep it Polymarket-style:**
- One question: "Will this tweet hit X in 24h?"
- Two choices: YES or NO
- Prices in ¢ (e.g., YES: 72¢, NO: 28¢)
- Winner gets $1 per share

---

## 📊 The Simple Model

| Feature | Decision |
|---------|----------|
| **Markets** | One metric per market (not 4) |
| **Timeframes** | 6h or 24h |
| **Trading** | YES/NO shares priced in ¢ |
| **Resolution** | YES wins → $1/share, NO wins → $0 |
| **Creation** | $10 USDC → 10 YES + 10 NO shares |

---

## 🎨 UI: Keep the Style, Simplify the Logic

### Market Card (Target Design):
```
┌─────────────────────────────────────┐
│ @elonmusk • 2h ago       [TECH] 🔥  │
│                                     │
│ "Considering removing 'W' from      │
│ the alphabet..."                    │
│ [Tweet media]                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     WILL IT HIT?                │ │
│ │     50M VIEWS                   │ │
│ │     in 24 hours                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│   ✅ YES        ❌ NO               │
│    72¢          28¢                 │
│                                     │
│  📊 $4.2K vol   ⏰ 23h left         │
│                                     │
│ [        TRADE NOW        ]         │
└─────────────────────────────────────┘
```

### What to Keep from New UI:
- ✅ Neo-brutalist ticket borders
- ✅ Categories (SHITPOST, RAGEBAIT, ALPHA, DRAMA) 
- ✅ Jagged edges and shadows
- ✅ Dark mode support
- ✅ HypeRadar / GlobalActivity (ambient features)

### What to Remove:
- ❌ "Prize Pool" / "Entry Price" 
- ❌ "TIX" terminology
- ❌ Multiple order books per market
- ❌ AI HYPE score
- ❌ Progress bars / fill percentages

---

## 📅 3-Day Sprint

### Day 1: Simplify MarketCard
- [ ] Replace Prize Pool/Entry Price with YES ¢ / NO ¢
- [ ] Add prominent "WILL IT HIT? [TARGET]" banner
- [ ] Add YES and NO buttons with prices
- [ ] Show volume + time remaining
- [ ] One metric displayed per card

### Day 2: Connect to Contracts
- [ ] Wire up bangrsh smart contracts
- [ ] Market creation flow (paste URL → pick metric → pick multiplier)
- [ ] Trading modal (buy YES or NO shares)
- [ ] Portfolio showing positions

### Day 3: Polish & Ship
- [ ] Market resolution display
- [ ] Simple leaderboard (top 10)
- [ ] Share buttons
- [ ] Test full flow end-to-end
- [ ] Record demo video

---

## 🔧 Components to Modify

| Component | Change |
|-----------|--------|
| `MarketCard.tsx` | Replace complex stats with YES/NO prices |
| `MarketDetail.tsx` | Remove multi-metric selector, show single market |
| `TradePanel.tsx` | YES/NO buttons with share quantity input |
| `CreateMarketModal.tsx` | Simplify: URL → metric → multiplier → create |

---

## 📐 Data Model (Simplified)

```typescript
interface Market {
  id: string;
  tweetId: string;
  tweetUrl: string;
  
  // Single metric
  metric: 'VIEWS' | 'LIKES' | 'RETWEETS' | 'COMMENTS';
  currentValue: number;
  targetValue: number;
  multiplier: number; // 2, 5, 10, or 20
  
  // Time
  duration: '6h' | '24h';
  expiresAt: Date;
  
  // Prices (in cents, add up to 100)
  yesPrice: number; // e.g., 72
  noPrice: number;  // e.g., 28
  
  // Stats
  volume: number;
  
  // Category
  category: 'SHITPOST' | 'RAGEBAIT' | 'ALPHA' | 'DRAMA';
  
  // Resolution
  status: 'ACTIVE' | 'RESOLVED_YES' | 'RESOLVED_NO' | 'INVALID';
}
```

---

## ✅ Definition of Done

**MVP is complete when:**
1. User can browse markets with clear YES/NO prices
2. User can click market → see "Will it hit X?" question
3. User can buy YES or NO shares
4. User can see their positions
5. Markets show resolution status
6. Looks good (keep the brutalist aesthetic)

---

## 🚫 Out of Scope (for now)

- Multiple metrics per market
- AI analysis
- Sound effects
- Streaks/badges
- Battle mode
- Comments/chat

**Ship simple first. Add features later.**
