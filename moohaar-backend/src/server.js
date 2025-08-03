import express from 'express';
import config from './config/index.js';
import connectDB from './services/db.service.js';
import themeRoutes from './routes/theme.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.use(express.json());

app.use('/api/themes', themeRoutes);
app.use('/health', healthRoutes);
app.use('/themes', express.static(config.THEMES_PATH));

const start = async () => {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
