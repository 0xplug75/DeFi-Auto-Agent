import { Request, Response } from 'express';
import axios from 'axios';

const KILN_API_BASE_URL = process.env.KILN_API_BASE_URL;
const API_KEY = process.env.KILN_API_KEY;

export const kilnController = {
  async getNetworkStats(req: Request, res: Response) {
    try {
      const { networkId } = req.params;
      console.log(`Fetching stats for network: ${networkId}`);
      console.log(`URL: ${KILN_API_BASE_URL}/${networkId}/network-stats`);
      
      const response = await axios.get(
        `${KILN_API_BASE_URL}/${networkId}/network-stats`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      // Log the response for debugging
      console.log('Kiln API Response:', response.data.data);

      // Format the response to match our interface
      const formattedResponse = {
        apy: response.data.data.network_gross_apy || 0,
        price: response.data.data[`${networkId}_price_usd`] || 0
      };

      res.json(formattedResponse);
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to fetch network stats',
        details: error.response?.data || error.message
      });
    }
  },

  async getBalance(req: Request, res: Response) {
    try {
      const { networkId } = req.params;
      const response = await axios.get(
        `${KILN_API_BASE_URL}/${networkId}/balance`,
        {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  },

  async getRewards(req: Request, res: Response) {
    try {
      const { networkId } = req.params;
      const { wallets } = req.query;
      const response = await axios.get(
        `${KILN_API_BASE_URL}/${networkId}/rewards`,
        {
          params: { wallets },
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rewards' });
    }
  }
}; 