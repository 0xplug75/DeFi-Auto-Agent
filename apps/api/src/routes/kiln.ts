import express from 'express';
import { kilnController } from '../controllers/kilnController';

const router = express.Router();

router.get('/:networkId/network-stats', kilnController.getNetworkStats);
router.get('/:networkId/balance', kilnController.getBalance);
router.get('/:networkId/rewards', kilnController.getRewards);

export const kilnRoutes = router; 