import request from 'supertest';
import { app } from '../server.js';
import User from '../models/user.model.js';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('should not register a user with an existing email', async () => {
    await User.create({ email: 'test@example.com', passwordHash: 'hashedpassword' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.statusCode).toEqual(400);
  });

  it('should login a registered user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should not login a user with incorrect credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
  });

  it('should logout a logged in user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    const cookie = loginRes.headers['set-cookie'];
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);
    expect(res.statusCode).toEqual(200);
  });
});
