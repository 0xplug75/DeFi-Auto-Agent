import { useState, useEffect } from 'react';
import { cookieDataService } from '@/lib/api/cookieData';

export function useCookieData() {
  const [trends, setTrends] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsData, signalsData] = await Promise.all([
          cookieDataService.getTrends(),
          cookieDataService.getSocialSignals()
        ]);
        
        setTrends(trendsData);
        setSignals(signalsData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        setLoading(false);
      }
    };

    // Subscribe to real-time updates
    const unsubscribe = cookieDataService.subscribe((data) => {
      if (data.type === 'trend') setTrends(prev => [...prev, data]);
      if (data.type === 'signal') setSignals(prev => [...prev, data]);
    });

    fetchData();
    cookieDataService.connect();

    return () => {
      unsubscribe();
    };
  }, []);

  return { trends, signals, loading, error };
}