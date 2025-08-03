import express from 'express';
import fs from 'fs';
import path from 'path';
import config from './config/index.js';
import connectDB from './services/db.service.js';
import engine from './services/liquid.service.js';
import Store from './models/store.model.js';
import Theme from './models/theme.model.js';
import themeRoutes from './routes/theme.routes.js';
import storeRoutes from './routes/store.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.use(express.json());

// Domain-mapping middleware attaches store based on hostname
app.use(async (req, res, next) => {
  try {
    const headerHost = req.headers.host;
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
  } catch (err) {
    console.error('Domain mapping failed', err);
  }
  next();
});

// API routes
app.use('/api/themes', themeRoutes);
app.use('/api/store', storeRoutes);
app.use('/health', healthRoutes);
app.use('/themes', express.static(config.THEMES_PATH));

// Public storefront - no auth required
app.get('/*', async (req, res) => {
  try {
    const store = req.store;
    if (!store || !store.activeTheme) {
      return res.status(404).send('Store not found');
    }
    const theme = await Theme.findById(store.activeTheme);
    if (!theme) {
      return res.status(404).send('Theme not found');
    }

    // Determine template based on URL
    let templateFile = 'index.liquid';
    if (req.path !== '/' && req.path !== '') {
      templateFile = 'product.liquid';
    }

    let templatePath = path.join(theme.paths.root, 'templates', templateFile);
    if (!fs.existsSync(templatePath) && templateFile === 'product.liquid') {
      templatePath = path.join(theme.paths.root, 'templates', 'index.liquid');
    }
    if (!fs.existsSync(templatePath)) {
      return res.status(404).send('Template not found');
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = await engine.parseAndRender(template, {
      store,
      products: store.products || [],
    });
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Server error');
  }
});

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
