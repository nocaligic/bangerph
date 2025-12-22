-- Bangr Events Database Schema
-- Stores indexed blockchain events for fast queries

-- Trades table: Stores SharesPurchased events
CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id INTEGER NOT NULL,
    buyer TEXT NOT NULL,
    is_yes INTEGER NOT NULL,  -- 0 = NO, 1 = YES
    usdc_amount TEXT NOT NULL,  -- BigInt as string
    shares_received TEXT NOT NULL,  -- BigInt as string
    tx_hash TEXT NOT NULL UNIQUE,
    block_number INTEGER NOT NULL,
    indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Created markets table: Stores MarketCreated events
CREATE TABLE IF NOT EXISTS created_markets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id INTEGER NOT NULL UNIQUE,
    creator TEXT NOT NULL,
    tweet_id TEXT NOT NULL,
    metric INTEGER NOT NULL,  -- 0=VIEWS, 1=LIKES, 2=RETWEETS, 3=COMMENTS
    target_value TEXT NOT NULL,  -- BigInt as string
    category TEXT,
    tx_hash TEXT NOT NULL UNIQUE,
    block_number INTEGER NOT NULL,
    indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sync state table: Tracks indexing progress
CREATE TABLE IF NOT EXISTS sync_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Only one row
    last_block INTEGER NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize sync state with deployment block
INSERT OR IGNORE INTO sync_state (id, last_block) VALUES (1, 80023861);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_trades_buyer ON trades(buyer);
CREATE INDEX IF NOT EXISTS idx_trades_market ON trades(market_id);
CREATE INDEX IF NOT EXISTS idx_trades_block ON trades(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_markets_creator ON created_markets(creator);
CREATE INDEX IF NOT EXISTS idx_markets_block ON created_markets(block_number DESC);
