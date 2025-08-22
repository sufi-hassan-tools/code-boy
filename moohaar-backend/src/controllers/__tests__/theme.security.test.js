/* eslint-env jest */
import request from 'supertest.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import os from 'os.js';
import module from 'module.js';

const MALICIOUS_ZIP_B64 = `UEsDBAoAAAAAAHY2BlsAAAAAAAAAAAAAAAAKABwAdGVtcGxhdGVzL1VUCQADgPuSaIH7kmh1eAsAAQQAAAAABAAAAABQSwMEFAAAAAgAdjYGW/dzrrocAAAAHwAAABYAHAB0ZW1wbGF0ZXMvaW5kZXgubGlxdWlkVVQJAAOA+5JogPuSaHV4CwABBAAAAAAEAAAAAPNIzcnJV7ApTi7KLCixS8xJLSrRMNS00YcKAABQSwECHgMKAAAAAAB2NgZbAAAAAAAAAAAAAAAACgAYAAAAAAAAABAA7UEAAAAAdGVtcGxhdGVzL1VUBQADgPuSaHV4CwABBAAAAAAEAAAAAFBLAQIeAxQAAAAIAHY2Blv3c666HAAAAB8AAAAWABgAAAAAAAEAAACkgUQAAAB0ZW1wbGF0ZXMvaW5kZXgubGlxdWlkVVQFAAOA+5JodXgLAAEEAAAAAAQAAAAAUEsFBgAAAAACAAIArAAAALAAAAAAAA==`;

let app;
let token;
let tmpRoot;
let themeRouter;

beforeAll(async () => {
  // setup temp directories for uploads and themes
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'theme-test-'));
  const uploads = path.join(tmpRoot, 'uploads');
  const themes = path.join(tmpRoot, 'themes');
  await fs.mkdir(uploads, { recursive: true });
  await fs.mkdir(themes, { recursive: true });
  process.env.UPLOADS_PATH = uploads;
  process.env.THEMES_PATH = themes;
  process.env.JWT_SECRET = 'testsecret';
  process.env.NODE_ENV = 'test';

  // Ensure modules outside this package can resolve dependencies
  process.env.NODE_PATH = path.join(process.cwd(), 'node_modules');
  // eslint-disable-next-line no-underscore-dangle
  module.Module._initPaths();

  ({ default: themeRouter } = await import('../theme.controller'));

  token = jwt.sign({ id: '1', role: 'admin' }, process.env.JWT_SECRET);
  app = express();
  app.use('/api/themes', themeRouter);
});

afterAll(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

describe('Theme upload security', () => {
  it('rejects zips with malicious content', async () => {
    const zipPath = path.join(tmpRoot, 'malicious.zip');
    await fs.writeFile(zipPath, Buffer.from(MALICIOUS_ZIP_B64, 'base64'));

    const res = await request(app)
      .post('/api/themes')
      .set('Authorization', `Bearer ${token}`)
      .attach('themeFile', zipPath);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/malicious content/i);

    // Ensure extracted directory was removed
    const themeDirs = await fs.readdir(process.env.THEMES_PATH);
    expect(themeDirs.length).toBe(0);
  });
});
