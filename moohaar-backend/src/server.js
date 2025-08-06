import express from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { access, readFile } from 'fs/promises';
import config from './config/index';
import connectDB from './services/db.service';
import engine from './services/liquid.service';
import Store from './models/store.model';
import Theme from './models/theme.model';
import themeRoutes from './controllers/theme.controller';
import storeRoutes from './routes/store.routes';
import healthRoutes from './routes/health.routes';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';

export const app = express();

// Apply secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// Parse JSON bodies
app.use(express.json());

// Rate limiters for auth and uploads
const authLimiter = rateLimit({
  windowMs: 15 * 60e3, // 15 minutes
  max: 5,
  message: 'Too many login attempts',
});
const uploadLimiter = rateLimit({
  windowMs: 60 * 60e3, // 1 hour
  max: 10,
  message: 'Too many uploads',
});

app.use('/api/auth', authLimiter);
app.use('/api/themes', uploadLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url });
  next();
});

// Domain-mapping middleware attaches store based on hostname
app.use(async (req, res, next) => {
  try {
    const { host: headerHost } = req.headers;
    if (headerHost) {
      const host = headerHost.split(':')[0];
      let store = await Store.findOne({ customDomain: host });
      if (!store) {
        const subdomain = host.split('.')[0];
        store = await Store.findOne({ handle: subdomain });
      }
      if (store) {
        req.store = store;
      }
    }
    return next();
  } catch (err) {
    logger.error({ message: 'Domain mapping failed', error: err.message });
    return next(err);
  }
});

// API routes
app.use('/api/themes', themeRoutes);
app.use('/api/store', storeRoutes);
app.use('/health', healthRoutes);
app.use('/themes', express.static(config.THEMES_PATH));

// Public storefront - no auth required
app.get('/*', async (req, res, next) => {
  try {
    const { store } = req;
    if (!store || !store.activeTheme) {
      return res.status(404).send('Store not found');
    }
    const { activeTheme } = store;
    const theme = await Theme.findById(activeTheme);
    if (!theme) {
      return res.status(404).send('Theme not found');
    }

    // Determine template based on URL
    let templateFile = 'index.liquid';
    if (req.path !== '/' && req.path !== '') {
      templateFile = 'product.liquid';
    }

    // Resolve template path and ensure it exists
    let templatePath = path.join(theme.paths.root, 'templates', templateFile);
    try {
      await access(templatePath);
    } catch (err) {
      if (templateFile === 'product.liquid') {
        templatePath = path.join(theme.paths.root, 'templates', 'index.liquid');
        try {
          await access(templatePath);
        } catch (innerErr) {
          return res.status(404).send('Template not found');
        }
      } else {
        return res.status(404).send('Template not found');
      }
    }

    // Asynchronously read template file
    const template = await readFile(templatePath, 'utf-8');
    const html = await engine.parseAndRender(template, {
      store,
      products: store.products || [],
    });
    return res.send(html);
  } catch (err) {
    return next(err);
  }
});

// Centralized error handler
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      logger.info({ message: `Server running on port ${config.PORT}` });
    });
  } catch (err) {
    logger.error({ message: 'Failed to start server', error: err.message });
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
