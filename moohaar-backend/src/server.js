import './apm.js'; // eslint-disable-line import/extensions
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
import authRoutes, { register as registerRoute } from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import PageView from './models/pageview.model';
import auth from './middleware/auth';
import authorizeAdmin from './middleware/authorizeAdmin';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';
import { initCache, getCache, setCache } from './services/cache.service';

export const app = express();

let register;
let httpRequestDuration;
let httpRequestsTotal;
let httpRequestErrors;
let metricsEnabled = false;
const fallbackMetrics = { total: 0, errors: 0 };

try {
  const promClient = (await import('prom-client')).default; // eslint-disable-line import/no-unresolved
  register = new promClient.Registry();
  promClient.collectDefaultMetrics({ register });

  httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });
  httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });
  httpRequestErrors = new promClient.Counter({
    name: 'http_request_errors_total',
    help: 'Total number of error HTTP responses',
    labelNames: ['method', 'route', 'status'],
  });

  register.registerMetric(httpRequestDuration);
  register.registerMetric(httpRequestsTotal);
  register.registerMetric(httpRequestErrors);
  metricsEnabled = true;
} catch (err) {
  logger.warn({ message: 'Prometheus client not available', error: err.message });
}

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const seconds = duration[0] + duration[1] / 1e9;
    const route = req.route?.path || req.path;
    const labels = { method: req.method, route, status: res.statusCode };
    if (metricsEnabled) {
      httpRequestsTotal.inc(labels);
      if (res.statusCode >= 400) {
        httpRequestErrors.inc(labels);
      }
      httpRequestDuration.observe(labels, seconds);
    } else {
      fallbackMetrics.total += 1;
      if (res.statusCode >= 400) {
        fallbackMetrics.errors += 1;
      }
    }
  });
  next();
});

app.get('/metrics', async (_req, res) => {
  if (metricsEnabled) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } else {
    res.type('text/plain').send(
      `http_requests_total ${fallbackMetrics.total}\n` +
        `http_request_errors_total ${fallbackMetrics.errors}\n`,
    );
  }
});

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
const allowedOrigins = ['https://moohaarapp.onrender.com'];
app.use(async (req, res, next) => {
  const { origin } = req.headers;
  if (!origin) return next();

  let allowed = false;
  if (allowedOrigins.includes(origin) || moohaarOrigin.test(origin)) {
    allowed = true;
  } else {
    try {
      const { hostname } = new URL(origin);
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
app.post('/api/auth/register', registerRoute);
app.use('/api/auth', authRoutes);
app.use('/api/admin', auth, authorizeAdmin, adminRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/store', storeRoutes);
app.use('/health', healthRoutes);
app.use(
  '/themes',
  express.static(config.THEMES_PATH, {
    etag: true,
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=86400');
    },
  }),
);

// Public storefront - no auth required
app.get('/*', async (req, res, next) => {
  try {
    const { store } = req;
    if (!store || !store.activeTheme) {
      return res.status(404).send('Store not found');
    }

    // Generate or read session ID cookie
    let { sessionId } = req.cookies;
    if (!sessionId) {
      sessionId = crypto.randomBytes(16).toString('hex');
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // Track page view and determine bounce
    const sessionWindow = new Date(Date.now() - 30 * 60 * 1000);
    const previous = await PageView.find({
      storeId: store.id,
      sessionId,
      timestamp: { $gt: sessionWindow },
    });
    if (previous.length > 0) {
      await PageView.updateMany({ storeId: store.id, sessionId }, { isBounce: false });
    }
    await PageView.create({
      storeId: store.id,
      sessionId,
      path: req.path,
      timestamp: new Date(),
      isBounce: previous.length === 0,
    });
    const cacheKey = `render:${store.id}:${req.path}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.send(cached);
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
    await setCache(cacheKey, html, config.CACHE_TTL_CONTEXT);
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
    await initCache();
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
