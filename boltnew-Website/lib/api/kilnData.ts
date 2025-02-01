interface VaultData {
  id: string;
  name: string;
  tvl: number;
  apy: number;
  allocation: number;
}

interface StakingRewards {
  amount: number;
  token: string;
  timestamp: number;
}

class KilnService {
  private apiKey: string = 'kiln_DBmNa8Y4Eu7O1ZCx9QMdTS4fQckBnWOEuwEqw9IM';
  private baseUrl: string = 'https://api.kiln.fi/v1';

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Kiln API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getVaults(): Promise<VaultData[]> {
    return this.request('/vaults');
  }

  async getVaultPerformance(vaultId: string) {
    return this.request(`/vaults/${vaultId}/performance`);
  }

  async getStakingRewards(address: string): Promise<StakingRewards[]> {
    return this.request(`/rewards/${address}`);
  }

  async deposit(vaultId: string, amount: string) {
    return this.request('/deposit', {
      method: 'POST',
      body: JSON.stringify({ vaultId, amount }),
    });
  }

  async withdraw(vaultId: string, amount: string) {
    return this.request('/withdraw', {
      method: 'POST',
      body: JSON.stringify({ vaultId, amount }),
    });
  }
}

export const kilnService = new KilnService();