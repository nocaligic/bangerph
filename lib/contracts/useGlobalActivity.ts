/**
 * Hook to fetch global activity (all trades + market creations) from the indexer
 */

import { useState, useEffect } from 'react';

const INDEXER_API_URL = 'http://localhost:8788';

export interface GlobalActivityItem {
    type: 'TRADE' | 'CREATE';
    marketId: number;
    user: string;
    isYes?: boolean;
    amount?: string;
    authorHandle?: string;
    metric?: number;
    targetValue?: string;
    txHash: string;
    blockNumber: number;
    timestamp: string;
}

export interface GlobalActivityData {
    success: boolean;
    count: number;
    activity: GlobalActivityItem[];
}

export function useGlobalActivity() {
    const [data, setData] = useState<GlobalActivityData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivity = async () => {
        try {
            const response = await fetch(`${INDEXER_API_URL}/global-activity`);
            if (!response.ok) {
                throw new Error('Failed to fetch global activity');
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchActivity, 5000);
        return () => clearInterval(interval);
    }, []);

    return {
        data,
        isLoading,
        error,
        refetch: fetchActivity,
    };
}
