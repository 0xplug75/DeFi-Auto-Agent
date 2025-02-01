import { useState, useEffect } from 'react';
import { kilnService } from '@/lib/api/kilnData';

export function useKilnData() {
  const [vaults, setVaults] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vaultsData = await kilnService.getVaults();
        setVaults(vaultsData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch vault data'));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchRewards = async (address: string) => {
    try {
      const rewardsData = await kilnService.getStakingRewards(address);
      setRewards(rewardsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rewards'));
    }
  };

  return { vaults, rewards, loading, error, fetchRewards };
}