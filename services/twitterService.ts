/**
 * Twitter API Service
 * Fetches tweet data from TwitterAPI.io
 * 
 * In production, this should be called via a serverless function to protect the API key
 * For testnet demo, we're using the key directly (it's a test key)
 */

const TWITTER_API_KEY = (import.meta as any).env?.VITE_TWITTER_API_KEY || 'new1_76b20b877cdd4fcba5323e4d9f2030dd';
const TWITTER_API_BASE = 'https://api.twitterapi.io';

// Simple in-memory cache
const cache = new Map<string, { data: TweetData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface TweetData {
    tweetId: string;
    text: string;
    authorHandle: string;
    authorName: string;
    avatarUrl: string | null;
    imageUrl: string | null;
    quotedTweet: {
        tweetId: string;
        text: string;
        authorHandle: string;
        authorName: string;
        avatarUrl: string | null;
    } | null;
    views: number;
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
    bookmarks: number;
}

/**
 * Extract tweet ID from various URL formats
 * Supports: twitter.com, x.com, mobile links
 */
export function extractTweetId(url: string): string | null {
    // Handle different URL formats
    const patterns = [
        /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
        /status\/(\d+)/,
        /^(\d+)$/, // Just a bare ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Extract author handle from URL
 */
export function extractAuthorHandle(url: string): string {
    const match = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
    return match ? match[1] : 'unknown';
}

/**
 * Fetch tweet data from TwitterAPI.io
 */
export async function fetchTweetData(tweetId: string): Promise<TweetData> {
    // Check cache first
    const cached = cache.get(tweetId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[TwitterAPI] Returning cached data for tweet ${tweetId}`);
        return cached.data;
    }

    console.log(`[TwitterAPI] Fetching metrics for tweet ${tweetId}`);

    try {
        const response = await fetch(
            `${TWITTER_API_BASE}/twitter/tweets?tweet_ids=${tweetId}`,
            {
                method: 'GET',
                headers: {
                    'x-api-key': TWITTER_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[TwitterAPI] Error: ${response.status} - ${errorText}`);

            // If rate limited, return fallback data
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few minutes.');
            }

            throw new Error(`Failed to fetch tweet: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[TwitterAPI] Raw response:`, data);

        const tweets = data.tweets || [];
        if (tweets.length === 0) {
            throw new Error('Tweet not found');
        }

        const tweet = tweets[0];
        const author = tweet.author || tweet.user || {};

        // Extract metrics
        const publicMetrics = tweet.public_metrics || tweet.publicMetrics || tweet.metrics || {};

        const views = tweet.viewCount ?? tweet.impressionCount ?? publicMetrics.impression_count ?? 0;
        const likes = tweet.likeCount ?? publicMetrics.like_count ?? 0;
        const retweets = tweet.retweetCount ?? publicMetrics.retweet_count ?? 0;
        const replies = tweet.replyCount ?? publicMetrics.reply_count ?? 0;
        const quotes = tweet.quoteCount ?? publicMetrics.quote_count ?? 0;
        const bookmarks = tweet.bookmarkCount ?? publicMetrics.bookmark_count ?? 0;

        const avatarUrl = author.profilePicture || author.profileImageUrl || author.profile_image_url || author.avatar || null;

        // Extract media
        const extendedMedia = tweet.extendedEntities?.media || tweet.entities?.media || tweet.media || [];
        const imageUrl = extendedMedia.length > 0 && extendedMedia[0].type === 'photo'
            ? extendedMedia[0].media_url_https || extendedMedia[0].url || extendedMedia[0].media_url
            : null;

        // Extract quote tweet
        let quotedTweet = null;
        if (tweet.quotedTweet || tweet.quoted_tweet || tweet.is_quote_status) {
            const quoted = tweet.quotedTweet || tweet.quoted_tweet || {};
            const quotedAuthor = quoted.author || quoted.user || {};

            if (quoted.text || quoted.full_text) {
                quotedTweet = {
                    tweetId: quoted.id || '',
                    text: quoted.text || quoted.full_text || '',
                    authorHandle: quotedAuthor.username || quotedAuthor.userName || 'unknown',
                    authorName: quotedAuthor.name || 'Unknown',
                    avatarUrl: quotedAuthor.profilePicture || quotedAuthor.profileImageUrl || quotedAuthor.profile_image_url || null,
                };
            }
        }

        const tweetData: TweetData = {
            tweetId: tweet.id || tweetId,
            text: tweet.text || '',
            authorHandle: author.username || author.userName || 'unknown',
            authorName: author.name || 'Unknown',
            avatarUrl,
            imageUrl,
            quotedTweet,
            views,
            likes,
            retweets,
            replies,
            quotes,
            bookmarks,
        };

        // Cache the result
        cache.set(tweetId, { data: tweetData, timestamp: Date.now() });

        return tweetData;
    } catch (error: any) {
        console.error('[TwitterAPI] Error:', error);
        throw error;
    }
}

/**
 * Fetch tweet data from URL
 */
export async function fetchTweetFromUrl(url: string): Promise<TweetData | null> {
    const tweetId = extractTweetId(url);
    if (!tweetId) {
        console.error('[TwitterAPI] Could not extract tweet ID from URL:', url);
        return null;
    }

    return fetchTweetData(tweetId);
}

/**
 * Get current metric value for a specific metric type
 */
export function getMetricValue(tweetData: TweetData, metricType: 'VIEWS' | 'LIKES' | 'RETWEETS' | 'COMMENTS'): number {
    switch (metricType) {
        case 'VIEWS': return tweetData.views;
        case 'LIKES': return tweetData.likes;
        case 'RETWEETS': return tweetData.retweets;
        case 'COMMENTS': return tweetData.replies;
        default: return 0;
    }
}
