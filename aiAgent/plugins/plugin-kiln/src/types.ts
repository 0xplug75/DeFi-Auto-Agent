export interface StatsResponse {
    network_gross_apy: number;
    nb_validators: number;
}

export interface StatsDataResponse {
    chain: string;
    data: StatsResponse;
}
