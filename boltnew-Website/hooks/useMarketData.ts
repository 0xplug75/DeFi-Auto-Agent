import { useState, useEffect } from 'react';
import { mockTrends } from '@/lib/api/mockData';

export function useMarketData() {
  const [trends, setTrends] = useState(mockTrends);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setTrends(mockTrends);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { trends, loading };
}