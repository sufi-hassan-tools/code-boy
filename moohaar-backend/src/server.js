import express from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { access, readFile } from 'fs/promises';
import crypto from 'crypto';
import cookie from 'cookie';
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

// Basic cookie parsing for CSRF protection
app.use((req, _res, next) => {
  const { cookie: rawCookie } = req.headers;
  req.cookies = rawCookie ? cookie.parse(rawCookie) : {};
  next();
});

// Restrictive CORS handling
const moohaarOrigin = /^https:\/\/([a-z0-9-]+\.)*moohaar\.com$/i;
app.use(async (req, res, next) => {
  const { origin } = req.headers;
  if (!origin) return next();

  let allowed = false;
  if (moohaarOrigin.test(origin)) {
    allowed = true;
  } else {
    try {
      const hostname = new URL(origin).hostname;
      // Allow known custom domains mapped to stores
      const store = await Store.findOne({ customDomain: hostname });
      if (store) allowed = true;
    } catch (err) {
      allowed = false;
    }
  }

  if (allowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    return next();
  }

  if (req.method === 'OPTIONS') return res.sendStatus(403);
  return res.status(403).json({ message: 'CORS not allowed' });
});

// CSRF token utilities
const generateCsrfToken = () => crypto.randomBytes(24).toString('hex');

// Endpoint to issue CSRF token
app.get('/api/csrf-token', (req, res) => {
  const token = generateCsrfToken();
  res.cookie('XSRF-TOKEN', token, {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ csrfToken: token });
});

// CSRF protection for state-changing requests
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return next();
  const headerToken =
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'] ||
    req.headers['xsrf-token'] ||
    req.headers['x-xsrf-token'];
  const cookieToken = req.cookies['XSRF-TOKEN'];
  if (headerToken && cookieToken && headerToken === cookieToken) return next();
  return res.status(403).json({ message: 'Invalid CSRF token' });
});

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
