import dotenv from 'dotenv';

// Charge les variables d'environnement avant tout
dotenv.config();

import express, { Express } from 'express';
import { kilnRoutes } from './routes/kiln';

const app: Express = express();
const PORT = 3005;

app.use(express.json());
app.use('/api', kilnRoutes);

// Ajoutons une route de test simple
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 