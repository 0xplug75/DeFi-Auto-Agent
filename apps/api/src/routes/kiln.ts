import express from 'express';
import { kilnController } from '../controllers/kilnController';
import { spikoController } from '../controllers/spikoController';

const router = express.Router();

router.get('/:networkId/network-stats', kilnController.getNetworkStats);
router.get('/:networkId/balance', kilnController.getBalance);
router.get('/:networkId/rewards', kilnController.getRewards);
router.get('/:networkId/stakes', kilnController.getStakes);

router.get('/spiko/:shareClass/yield', spikoController.getSpikoYield);

router.post('/magic-analysis', async (req, res) => {
  try {
    console.log(req.body);
    const text = `${req.body.text}`;

    console.log(text);

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBwBqUodQWDVFY_d_jaYr3UuJ3fmTij8CA', {
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
    res.status(500).json({ error: 'Failed to analyze networks' });
  }
});

export const kilnRoutes = router;

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
    // Augmenter le timeout à 2 minutes (120 secondes)
    timeout: 120000,
  },
} 