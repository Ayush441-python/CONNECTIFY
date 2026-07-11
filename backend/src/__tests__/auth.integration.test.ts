import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../config/db';

/**
 * These tests exercise the full stack against a real database and therefore need
 * `prisma generate` + a reachable Postgres (DATABASE_URL). They run in CI (see
 * .github/workflows/ci.yml, which provisions a Postgres service container) and on any
 * machine with normal internet access. See the root README for why this couldn't be
 * verified inside the sandbox this project was built in.
 */
describe('Auth integration flow', () => {
  const testEmail = `vitest-${Date.now()}@example.com`;
  const testPassword = 'password123';

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('registers a new influencer and returns an access token', async () => {
    const res = await request(app).post('/api/auth/register/influencer').send({
      role: 'INFLUENCER',
      email: testEmail,
      password: testPassword,
      name: 'Vitest Creator',
      username: `vitest_creator_${Date.now()}`,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it('rejects a duplicate email on a second registration attempt', async () => {
    const res = await request(app).post('/api/auth/register/influencer').send({
      role: 'INFLUENCER',
      email: testEmail,
      password: testPassword,
      name: 'Duplicate Creator',
      username: `vitest_dup_${Date.now()}`,
    });
    expect(res.status).toBe(409);
  });

  it('logs in with the correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('rejects login with the wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testEmail, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('returns the authenticated profile for GET /api/auth/me with a valid token', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword });
    const token = login.body.data.accessToken;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testEmail);
  });
});
