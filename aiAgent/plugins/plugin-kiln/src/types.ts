export interface StatsResponse {
    network_gross_apy: number;
    nb_validators: number;
}

export interface StatsDataResponse {
    chain: string;
    data: StatsResponse;
}

export interface TrendingAgentsResponse {
    agentName: string;
    twitterUsernames: string[];
    marketCap: number;
    price: number;
    liquidity: number;
    volume24Hours: number;
    holdersCount: number;
    averageImpressionCount: number;
    averageEngagementsCount: number;
    followersCount: number;
    smartFollowersCount: number;
}

export interface TrendingAgentsData {
    data: TrendingAgentsResponse[];
}

export interface TrendingAgentsOk {
    ok: TrendingAgentsData;
}
