import * as dotenv from 'dotenv';

// Charge les variables d'environnement avant tout
dotenv.config();

const KILN_API_BASE_URL = process.env.KILN_API_BASE_URL;
const API_KEY = process.env.KILN_API_KEY;

import express, { Express } from 'express';
import { kilnRoutes } from './routes/kiln';

const app: Express = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use('/api', kilnRoutes);

// Ajoutons une route de test simple
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 