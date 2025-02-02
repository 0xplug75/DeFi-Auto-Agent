import {
    StatsDataResponse,
    StatsResponse, TrendingAgentsOk
} from "./types";
import {elizaLogger} from "@elizaos/core";

const BASE_URLS = [
    "https://api.kiln.fi/v1/eth/network-stats",
    "https://api.kiln.fi/v1/ada/network-stats",
    "https://api.kiln.fi/v1/tia/network-stats",
    "https://api.kiln.fi/v1/atom/network-stats",
    "https://api.kiln.fi/v1/dydx/network-stats",
    "https://api.kiln.fi/v1/fet/network-stats",
    "https://api.kiln.fi/v1/inj/network-stats",
    "https://api.kiln.fi/v1/kava/network-stats",
    "https://api.kiln.fi/v1/ksm/network-stats",
    "https://api.kiln.fi/v1/egld/network-stats",
    "https://api.kiln.fi/v1/near/network-stats",
    "https://api.kiln.fi/v1/osmo/network-stats",
    "https://api.kiln.fi/v1/dot/network-stats",
    "https://api.kiln.fi/v1/pol/network-stats",
    "https://api.kiln.fi/v1/sol/network-stats",
    "https://api.kiln.fi/v1/xtz/network-stats",
    "https://api.kiln.fi/v1/zeta/network-stats"
];

const COOKIE_URL = "https://api.cookie.fun/v2/agents/agentsPaged?interval=_7Days&page=1&pageSize=5"

export const createKilnService = (apiKey: string) => {
    const extractChain = (url: string): string => {
        const matches = url.match(/\/v1\/([^/]+)\/network-stats/);
        return matches ? matches[1] : '';
    };

    const fetchNetworkStats = async (url: string): Promise<StatsDataResponse> => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }
            const data: StatsDataResponse = await response.json();
            data.chain = extractChain(url);  // Add chain to the response
            return data;
        } catch (error: any) {
            console.error(`Kiln API Error for ${url}:`, error.message);
            throw error;
        }
    };

    const getStakingStatistics = async (): Promise<StatsDataResponse[]> => {
        if (!apiKey) {
            throw new Error("API key is required");
        }

        try {
            const results = await Promise.allSettled(
                BASE_URLS.map(url => fetchNetworkStats(url))
            );

            const successfulResults = results
                .filter((result): result is PromiseFulfilledResult<StatsDataResponse> =>
                    result.status === 'fulfilled'
                )
                .map(result => result.value);

            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to fetch data for ${BASE_URLS[index]}:`, result.reason);
                }
            });

            return successfulResults;
        } catch (error: any) {
            console.error("Kiln Service Error:", error.message);
            throw error;
        }
    };

    return { getStakingStatistics };
};

export const createCookieService = (apiKey: string) => {
    const getTradingAgents = async (): Promise<TrendingAgentsOk> => {
        if (!apiKey) {
            throw new Error("API key is required");
        }

        try {
            const response = await fetch(COOKIE_URL, {
                headers: {
                    'x-api-key': `${apiKey}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            return await response.json();
        } catch (error: any) {
            console.error("Cookie Service Error:", error.message);
            throw error;
        }
    };

    return { getTradingAgents };
};
