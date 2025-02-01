"use client";

import { useMarketData } from '@/hooks/useMarketData';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function TrendingSignals() {
  const { trends, loading } = useMarketData();

  if (loading) return <div>Loading trends...</div>;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Market Trends</h2>
        <TrendingUp className="h-5 w-5 text-chart-1" />
      </div>

      <div className="space-y-4">
        {trends.map((trend, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-card rounded-lg">
            <div>
              <h3 className="font-medium">{trend.trend}</h3>
              <p className="text-sm text-muted-foreground">
                Sentiment: {trend.sentiment > 0 ? '📈' : '📉'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">Volume: {trend.volume}</p>
              <p className="text-sm text-muted-foreground">
                Influence: {trend.influence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}