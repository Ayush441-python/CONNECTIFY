import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('GET /api/health', () => {
  it('returns 200 and a success payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET / (root)', () => {
  it('returns basic API info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Connectify');
  });
});

describe('GET /api/unknown-route', () => {
  it('returns 404 via the notFoundHandler', async () => {
    const res = await request(app).get('/api/this-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/register/influencer — validation layer', () => {
  it('rejects a request missing required fields before it ever reaches the database', async () => {
    const res = await request(app).post('/api/auth/register/influencer').send({ role: 'INFLUENCER', email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register/influencer').send({
      role: 'INFLUENCER',
      email: 'creator@example.com',
      password: 'short',
      name: 'Test Creator',
      username: 'test.creator',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login — validation layer', () => {
  it('rejects a malformed email without querying the database', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope', password: 'whatever' });
    expect(res.status).toBe(400);
  });
});

describe('Protected routes without a token', () => {
  it('rejects GET /api/auth/me with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects GET /api/admin/stats with 401 for an anonymous request', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('rejects a request with a garbage bearer token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
