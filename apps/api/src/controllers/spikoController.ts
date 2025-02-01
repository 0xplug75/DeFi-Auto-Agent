import { Request, Response } from 'express';

export const spikoController = {
  async getSpikoYield(req: Request, res: Response) {
    const shareClass = req.params.shareClass.toUpperCase();
    
    try {
      const response = await fetch(
        `https://public-api.spiko.finance/share-classes/${shareClass}/yield`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching Spiko data:', error);
      res.status(500).json({ error: 'Failed to fetch Spiko data' });
    }
  }
}; 