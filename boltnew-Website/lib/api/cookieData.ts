import { WebSocket } from 'ws';

interface TrendData {
  trend: string;
  sentiment: number;
  volume: number;
  influence: number;
}

interface SocialSignal {
  source: string;
  impact: number;
  confidence: number;
  timestamp: number;
}

class CookieDataService {
  private ws: WebSocket | null = null;
  private apiKey: string = '240f2017-0e5c-4653-af7e-5f93daaa913b';
  private subscribers: ((data: any) => void)[] = [];

  connect() {
    this.ws = new WebSocket(`wss://api.cookiedata.com/v1/stream?apiKey=${this.apiKey}`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifySubscribers(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(data: any) {
    this.subscribers.forEach(callback => callback(data));
  }

  async getTrends(): Promise<TrendData[]> {
    const response = await fetch('https://api.cookiedata.com/v1/trends', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }

  async getSocialSignals(): Promise<SocialSignal[]> {
    const response = await fetch('https://api.cookiedata.com/v1/signals', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }
}

export const cookieDataService = new CookieDataService();