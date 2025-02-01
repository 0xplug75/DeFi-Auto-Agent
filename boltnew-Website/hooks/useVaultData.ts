import { useState, useEffect } from 'react';
import { mockVaults } from '@/lib/api/mockData';

export function useVaultData() {
  const [vaults, setVaults] = useState(mockVaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setVaults(mockVaults);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { vaults, loading };
}