import express from 'express';
import { kilnController } from '../controllers/kilnController';
import { spikoController } from '../controllers/spikoController';

const router = express.Router();

router.get('/:networkId/network-stats', async (req, res) => {
  try {
    if (!process.env.KILN_API_KEY) {
      throw new Error('KILN_API_KEY environment variable is not defined');
    }
    await kilnController.getNetworkStats(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch network stats'
    });
  }
});

router.get('/:networkId/balance', async (req, res) => {
  try {
    if (!process.env.KILN_API_KEY) {
      throw new Error('KILN_API_KEY environment variable is not defined');
    }
    await kilnController.getBalance(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch balance'
    });
  }
});

router.get('/:networkId/rewards', async (req, res) => {
  try {
    if (!process.env.KILN_API_KEY) {
      throw new Error('KILN_API_KEY environment variable is not defined');
    }
    await kilnController.getRewards(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch rewards'
    });
  }
});

router.get('/:networkId/stakes', async (req, res) => {
  try {
    if (!process.env.KILN_API_KEY) {
      throw new Error('KILN_API_KEY environment variable is not defined');
    }
    await kilnController.getStakes(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch stakes'
    });
  }
});

router.get('/spiko/:shareClass/yield', spikoController.getSpikoYield);

router.post('/magic-analysis', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not defined');
    }

    console.log(req.body);
    const text = `${req.body.text}`;

    console.log('text', text);
    console.log('process.env.GEMINI_API_KEY', process.env.GEMINI_API_KEY);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text }]
        }]
      }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze networks'
    });
  }
});

export const kilnRoutes = router;

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
    // Increase timeout to 2 minutes (120 seconds)
    timeout: 120000,
  },
} 