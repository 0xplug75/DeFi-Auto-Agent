"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';

interface CookieData {
    agentName?: string;
    mindshare?: number;
    mindshareDeltaPercent?: number;
    price?: number;
    priceDeltaPercent?: number;
    twitterUsernames?: string[];
    topTweets?: {
        tweetAuthorProfileImageUrl: string;
        tweetAuthorDisplayName: string;
        tweetUrl: string;
        impressionsCount: number;
    }[];
}

export function CookieDashboard() {
    const [cookieData, setCookieData] = useState<CookieData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/cookie');
                if (!response.ok) {
                    throw new Error('Error fetching data');
                }
                const data = await response.json();
                setCookieData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Failed to fetch Cookie data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Social Analytics</h2>
                    <Users className="h-5 w-5 text-chart-1" />
                </div>
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Loading social data...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Social Analytics</h2>
                    <Users className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Using fallback data - API unavailable</p>
                </div>
            </Card>
        );
    }

    if (!cookieData) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Social Analytics</h2>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No data available</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Social Analytics</h2>
                <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Mindshare</p>
                        <p className="text-2xl font-bold">
                            {cookieData.mindshare?.toFixed(2)}
                            <span className="text-sm text-muted-foreground ml-2">
                                ({cookieData.mindshareDeltaPercent?.toFixed(2)}%)
                            </span>
                        </p>
                    </div>
                    <div className="bg-card p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-2xl font-bold">
                            ${cookieData.price?.toFixed(4)}
                            <span className="text-sm text-muted-foreground ml-2">
                                ({cookieData.priceDeltaPercent?.toFixed(2)}%)
                            </span>
                        </p>
                    </div>
                </div>

                {cookieData.topTweets && cookieData.topTweets.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Top Tweets</h3>
                        <div className="space-y-3">
                            {cookieData.topTweets.slice(0, 3).map((tweet, index) => (
                                <a
                                    key={index}
                                    href={tweet.tweetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-3 bg-card rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <img
                                        src={tweet.tweetAuthorProfileImageUrl}
                                        alt={tweet.tweetAuthorDisplayName}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div>
                                        <p className="font-medium">{tweet.tweetAuthorDisplayName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {tweet.impressionsCount.toLocaleString()} impressions
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}