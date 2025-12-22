/**
 * Bangr Indexer - Cloudflare Worker + D1
 * 
 * This worker indexes blockchain events and serves them via API.
 * 
 * API Endpoints:
 *   GET /trades/:address - Get trades for a user
 *   GET /markets/:address - Get markets created by a user
 *   GET /stats - Get indexing stats
 *   GET /health - Health check
 * 
 * Scheduled:
 *   Runs every minute to index new events from the blockchain
 */

export interface Env {
    DB: D1Database;
    BSC_RPC_URL: string;
    MARKET_FACTORY: string;
    DEPLOYMENT_BLOCK: string;
}

// Event signatures (keccak256 hashes)
const SHARES_PURCHASED_TOPIC = '0x7c0c3c84c67c85fcca30d1f5d2e6c27c3ad1d1c5c0e8c8c0c0c0c0c0c0c0c0c0';
const MARKET_CREATED_TOPIC = '0x8c0c3c84c67c85fcca30d1f5d2e6c27c3ad1d1c5c0e8c8c0c0c0c0c0c0c0c0c0';

// Parsed event signatures - we'll use raw hex topics
const EVENT_SIGNATURES = {
    SharesPurchased: 'SharesPurchased(uint256,address,bool,uint256,uint256,uint256)',
    MarketCreated: 'MarketCreated(uint256,string,uint8,uint256,string,address)'
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
};

// Helper to convert hex string to UTF-8 string (works in Cloudflare Workers)
function hexToString(hex: string): string {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return new TextDecoder().decode(bytes);
}

export default {
    /**
     * HTTP Request Handler
     */
    async fetch(request: Request, env: Env): Promise<Response> {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Health check
            if (path === '/health') {
                return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
            }

            // Get indexing stats
            if (path === '/stats') {
                return await getStats(env);
            }

            // Get trades for a user
            if (path.startsWith('/trades/')) {
                const address = path.split('/trades/')[1]?.toLowerCase();
                if (!address || !address.startsWith('0x')) {
                    return jsonResponse({ error: 'Valid address required' }, 400);
                }
                return await getTrades(env, address);
            }

            // Get markets created by a user
            if (path.startsWith('/markets/')) {
                const address = path.split('/markets/')[1]?.toLowerCase();
                if (!address || !address.startsWith('0x')) {
                    return jsonResponse({ error: 'Valid address required' }, 400);
                }
                return await getCreatedMarkets(env, address);
            }

            // Trigger manual indexing (for testing)
            if (path === '/index') {
                const result = await indexEvents(env);
                return jsonResponse(result);
            }

            return jsonResponse({
                error: 'Not found',
                endpoints: ['/trades/:address', '/markets/:address', '/stats', '/health']
            }, 404);

        } catch (error) {
            console.error('Worker error:', error);
            return jsonResponse({ error: 'Internal server error', details: String(error) }, 500);
        }
    },

    /**
     * Scheduled Handler - Runs every minute to index new events
     */
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        console.log('[Indexer] Scheduled run starting...');
        try {
            const result = await indexEvents(env);
            console.log('[Indexer] Indexed:', result);
        } catch (error) {
            console.error('[Indexer] Error:', error);
        }
    },
};

// =============================================================================
// API HANDLERS
// =============================================================================

async function getTrades(env: Env, address: string): Promise<Response> {
    const { results } = await env.DB.prepare(`
        SELECT 
            market_id as marketId,
            buyer,
            is_yes as isYes,
            usdc_amount as usdcAmount,
            shares_received as sharesReceived,
            tx_hash as transactionHash,
            block_number as blockNumber,
            indexed_at as indexedAt
        FROM trades 
        WHERE LOWER(buyer) = ?
        ORDER BY block_number DESC
        LIMIT 50
    `).bind(address).all();

    return jsonResponse({
        success: true,
        count: results?.length || 0,
        trades: results || [],
    });
}

async function getCreatedMarkets(env: Env, address: string): Promise<Response> {
    const { results } = await env.DB.prepare(`
        SELECT 
            market_id as marketId,
            creator,
            tweet_id as tweetId,
            metric,
            target_value as targetValue,
            category,
            tx_hash as transactionHash,
            block_number as blockNumber,
            indexed_at as indexedAt
        FROM created_markets 
        WHERE LOWER(creator) = ?
        ORDER BY block_number DESC
        LIMIT 50
    `).bind(address).all();

    return jsonResponse({
        success: true,
        count: results?.length || 0,
        markets: results || [],
    });
}

async function getStats(env: Env): Promise<Response> {
    const [syncState, tradesCount, marketsCount] = await Promise.all([
        env.DB.prepare('SELECT last_block, last_updated FROM sync_state WHERE id = 1').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM trades').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM created_markets').first(),
    ]);

    return jsonResponse({
        success: true,
        stats: {
            lastBlock: syncState?.last_block || 0,
            lastUpdated: syncState?.last_updated || null,
            totalTrades: (tradesCount as any)?.count || 0,
            totalMarkets: (marketsCount as any)?.count || 0,
        }
    });
}

// =============================================================================
// INDEXER
// =============================================================================

async function indexEvents(env: Env): Promise<object> {
    const startTime = Date.now();

    // Get last indexed block
    const syncState = await env.DB.prepare(
        'SELECT last_block FROM sync_state WHERE id = 1'
    ).first();

    const fromBlock = (syncState?.last_block as number) || parseInt(env.DEPLOYMENT_BLOCK);

    // Get current block from RPC
    const currentBlock = await getCurrentBlock(env.BSC_RPC_URL);
    if (!currentBlock) {
        return { error: 'Failed to get current block' };
    }

    // If already up to date, skip
    if (fromBlock >= currentBlock) {
        return {
            status: 'up_to_date',
            lastBlock: fromBlock,
            currentBlock
        };
    }

    // Limit batch size (5000 blocks per query - dRPC can handle this)
    const toBlock = Math.min(fromBlock + 5000, currentBlock);

    console.log(`[Indexer] Fetching events from block ${fromBlock} to ${toBlock}`);

    // Fetch events
    const [sharesPurchasedLogs, marketCreatedLogs] = await Promise.all([
        fetchLogs(env, 'SharesPurchased', fromBlock, toBlock),
        fetchLogs(env, 'MarketCreated', fromBlock, toBlock),
    ]);

    // Insert trades
    let tradesInserted = 0;
    for (const log of sharesPurchasedLogs) {
        try {
            await env.DB.prepare(`
                INSERT OR IGNORE INTO trades 
                (market_id, buyer, is_yes, usdc_amount, shares_received, tx_hash, block_number)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                log.marketId,
                log.buyer.toLowerCase(),
                log.isYes ? 1 : 0,
                log.usdcAmount,
                log.sharesReceived,
                log.txHash,
                log.blockNumber
            ).run();
            tradesInserted++;
        } catch (e) {
            console.log('[Indexer] Duplicate trade, skipping');
        }
    }

    // Insert markets
    let marketsInserted = 0;
    for (const log of marketCreatedLogs) {
        try {
            await env.DB.prepare(`
                INSERT OR IGNORE INTO created_markets 
                (market_id, creator, tweet_id, metric, target_value, category, tx_hash, block_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                log.marketId,
                log.creator.toLowerCase(),
                log.tweetId,
                log.metric,
                log.targetValue,
                log.category,
                log.txHash,
                log.blockNumber
            ).run();
            marketsInserted++;
        } catch (e) {
            console.log('[Indexer] Duplicate market, skipping');
        }
    }

    // Update sync state
    await env.DB.prepare(
        'UPDATE sync_state SET last_block = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1'
    ).bind(toBlock).run();

    return {
        status: 'indexed',
        fromBlock,
        toBlock,
        currentBlock,
        tradesFound: sharesPurchasedLogs.length,
        tradesInserted,
        marketsFound: marketCreatedLogs.length,
        marketsInserted,
        durationMs: Date.now() - startTime,
    };
}

// =============================================================================
// RPC HELPERS
// =============================================================================

async function getCurrentBlock(rpcUrl: string): Promise<number | null> {
    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1,
            }),
        });
        const data = await response.json() as { result: string };
        return parseInt(data.result, 16);
    } catch (e) {
        console.error('[Indexer] Failed to get block number:', e);
        return null;
    }
}

async function fetchLogs(env: Env, eventType: 'SharesPurchased' | 'MarketCreated', fromBlock: number, toBlock: number): Promise<any[]> {
    // Get the correct topic hash for this event type
    const topicHash = getEventTopicHash(eventType);

    try {
        const response = await fetch(env.BSC_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getLogs',
                params: [{
                    address: env.MARKET_FACTORY,
                    topics: [topicHash],
                    fromBlock: '0x' + fromBlock.toString(16),
                    toBlock: '0x' + toBlock.toString(16),
                }],
                id: 1,
            }),
        });

        const data = await response.json() as { result: any[], error?: any };

        if (data.error) {
            console.error('[Indexer] RPC error:', data.error);
            return [];
        }

        const logs = data.result || [];
        console.log(`[Indexer] Found ${logs.length} ${eventType} events`);

        // Parse logs based on event type
        if (eventType === 'SharesPurchased') {
            return logs.map(log => parseSharesPurchasedLog(log));
        } else {
            return logs.map(log => parseMarketCreatedLog(log));
        }
    } catch (e) {
        console.error('[Indexer] Failed to fetch logs:', e);
        return [];
    }
}

function parseSharesPurchasedLog(log: any): any {
    // Topics: [eventSig, marketId (indexed), buyer (indexed)]
    // Data: [isYes, usdcAmount, sharesReceived, newPrice]
    const topics = log.topics;
    const data = log.data;

    // Parse indexed parameters from topics
    const marketId = parseInt(topics[1], 16);
    const buyer = '0x' + topics[2].slice(26); // Last 20 bytes of 32-byte topic

    // Parse non-indexed from data (remove 0x, each param is 32 bytes = 64 chars)
    const dataHex = data.slice(2);
    const isYes = parseInt(dataHex.slice(0, 64), 16) === 1;
    const usdcAmount = BigInt('0x' + dataHex.slice(64, 128)).toString();
    const sharesReceived = BigInt('0x' + dataHex.slice(128, 192)).toString();

    return {
        marketId,
        buyer,
        isYes,
        usdcAmount,
        sharesReceived,
        txHash: log.transactionHash,
        blockNumber: parseInt(log.blockNumber, 16),
    };
}

function parseMarketCreatedLog(log: any): any {
    // Topics: [eventSig, marketId (indexed)]
    // Data layout for: MarketCreated(uint256 indexed marketId, string tweetId, uint8 metric, uint256 targetValue, string category, address creator)
    // When there are dynamic types, the data contains:
    // [0-64]: offset to tweetId string
    // [64-128]: metric (uint8, padded to 32 bytes)
    // [128-192]: targetValue (uint256)
    // [192-256]: offset to category string
    // [256-320]: creator (address, padded to 32 bytes)
    // Then the actual string data follows...

    const topics = log.topics;
    const data = log.data;

    const marketId = parseInt(topics[1], 16);
    const dataHex = data.slice(2); // Remove 0x

    // Parse static values at fixed positions
    // Slot 0 (0-64): offset to tweetId
    // Slot 1 (64-128): metric
    const metric = parseInt(dataHex.slice(64, 128), 16);
    // Slot 2 (128-192): targetValue
    const targetValue = BigInt('0x' + dataHex.slice(128, 192)).toString();
    // Slot 3 (192-256): offset to category
    // Slot 4 (256-320): creator address (last 20 bytes of the 32-byte slot)
    const creatorSlot = dataHex.slice(256, 320);
    const creator = '0x' + creatorSlot.slice(24); // Last 40 chars = 20 bytes = address

    // Parse tweetId string
    const tweetIdOffset = parseInt(dataHex.slice(0, 64), 16) * 2; // Convert to hex chars offset
    const tweetIdLength = parseInt(dataHex.slice(tweetIdOffset, tweetIdOffset + 64), 16);
    const tweetIdHex = dataHex.slice(tweetIdOffset + 64, tweetIdOffset + 64 + tweetIdLength * 2);
    let tweetId = '';
    try {
        tweetId = hexToString(tweetIdHex);
    } catch {
        tweetId = 'unknown';
    }

    // Parse category string
    const categoryOffset = parseInt(dataHex.slice(192, 256), 16) * 2;
    const categoryLength = parseInt(dataHex.slice(categoryOffset, categoryOffset + 64), 16);
    const categoryHex = dataHex.slice(categoryOffset + 64, categoryOffset + 64 + categoryLength * 2);
    let category = '';
    try {
        category = hexToString(categoryHex);
    } catch {
        category = '';
    }

    return {
        marketId,
        creator,
        tweetId,
        metric,
        targetValue,
        category,
        txHash: log.transactionHash,
        blockNumber: parseInt(log.blockNumber, 16),
    };
}

// Correct event topic hashes (keccak256 of event signature)
function getEventTopicHash(eventType: 'SharesPurchased' | 'MarketCreated'): string {
    const hashes: { [key: string]: string } = {
        // keccak256("SharesPurchased(uint256,address,bool,uint256,uint256,uint256)")
        SharesPurchased: '0x0830b253517c7681cb33c8586fff29355b4c027f346bf597887f95162d008fdb',
        // keccak256("MarketCreated(uint256,string,uint8,uint256,string,address)")
        MarketCreated: '0x3bac209ff38f01fa8b944162bf53fea132d7da98e85520f7a33c649d88cc99d0',
    };
    return hashes[eventType];
}

// =============================================================================
// HELPERS
// =============================================================================

function jsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}
