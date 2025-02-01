import { NetworkStats } from '@kiln-monorepo/shared';

export interface NetworkInfo {
  id: string;
  name: string;
}

const SUPPORTED_NETWORKS: NetworkInfo[] = [
  // { id: 'bbn', name: 'Babylon' },
  { id: 'ada', name: 'Cardano' },
  { id: 'tia', name: 'Celestia' },
  { id: 'atom', name: 'Cosmos' },
  { id: 'cro', name: 'Cronos' },
  { id: 'dydx', name: 'DyDx' },
  { id: 'eth', name: 'Ethereum' },
  { id: 'fet', name: 'Fetch.ai' },
  { id: 'inj', name: 'Injective' },
  { id: 'kava', name: 'Kava' },
  { id: 'ksm', name: 'Kusama' },
  { id: 'om', name: 'Mantra' },
  { id: 'egld', name: 'MultiversX' },
  { id: 'near', name: 'Near' },
  // { id: 'noble', name: 'Noble' },
  { id: 'osmo', name: 'Osmosis' },
  { id: 'dot', name: 'Polkadot' },
  { id: 'pol', name: 'Polygon' },
  { id: 'sol', name: 'Solana' },
  { id: 'xtz', name: 'Tezos' },
  { id: 'ton', name: 'The Open Network' },
  // { id: 'trx', name: 'Tron' },
  { id: 'zeta', name: 'ZetaChain' },
  { id: 'spiko-ustbl', name: 'Spiko USTBL' },
  { id: 'spiko-eutbl', name: 'Spiko EUTBL' }
];

export interface NetworkWallet {
  address: string;
  label?: string;
}

export interface NetworkWallets {
  [networkId: string]: NetworkWallet[];
}

export const kilnService = {
  getSupportedNetworks() {
    return SUPPORTED_NETWORKS;
  },

  async getNetworkStats(networkId: string): Promise<NetworkStats> {
    const response = await fetch(`/api/${networkId}/network-stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats for ${networkId}`);
    }
    return response.json();
  },

  async getAllNetworksStats(): Promise<Map<string, NetworkStats>> {
    const networks = this.getSupportedNetworks();
    const statsMap = new Map<string, NetworkStats>();

    await Promise.all(
      networks
      .filter(network => network.id !== 'spiko-ustbl' && network.id !== 'spiko-eutbl')
      .map(async (network) => {
        try {
          const stats = await this.getNetworkStats(network.id);
          console.log(`Stats for ${network.id}:`, stats);
          statsMap.set(network.id, stats);
        } catch (error) {
          console.error(`Error fetching stats for ${network.id}:`, error);
        }
      })
    );

    // Ajout des stats pour Spiko
    try {
      const [ustblResponse, eutblResponse] = await Promise.all([
        fetch('/api/spiko/USTBL/yield'),
        fetch('/api/spiko/EUTBL/yield')
      ]);

      const ustblData = await ustblResponse.json();
      const eutblData = await eutblResponse.json();

      statsMap.set('spiko-ustbl', {
        price: 1.00,
        apy: parseFloat(ustblData.dailyYield) * 100,
      });

      statsMap.set('spiko-eutbl', {
        price: 1.00,
        apy: parseFloat(eutblData.dailyYield) * 100,
      });
    } catch (error) {
      console.error('Error fetching Spiko data:', error);
    }

    return statsMap;
  }
}; 