import { describe, expect, it } from 'vitest';
import {
  applyToCampaignSchema,
  createCampaignSchema,
  loginSchema,
  registerBrandSchema,
  registerInfluencerSchema,
  resetPasswordSchema,
} from '../index';

describe('loginSchema', () => {
  it('accepts a valid email/password pair', () => {
    const result = loginSchema.safeParse({ body: { email: 'a@b.com', password: 'anything' } });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ body: { email: 'not-an-email', password: 'anything' } });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ body: { email: 'a@b.com', password: '' } });
    expect(result.success).toBe(false);
  });
});

describe('registerInfluencerSchema', () => {
  const validBody = {
    role: 'INFLUENCER',
    email: 'creator@example.com',
    password: 'password123',
    name: 'Meera Kapoor',
    username: 'meera.styles',
  };

  it('accepts a minimal valid influencer registration', () => {
    const result = registerInfluencerSchema.safeParse({ body: validBody });
    expect(result.success).toBe(true);
  });

  it('defaults tier to NANO and availability to AVAILABLE when omitted', () => {
    const result = registerInfluencerSchema.safeParse({ body: validBody });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.tier).toBe('NANO');
      expect(result.data.body.availability).toBe('AVAILABLE');
      expect(result.data.body.categories).toEqual([]);
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerInfluencerSchema.safeParse({ body: { ...validBody, password: 'short' } });
    expect(result.success).toBe(false);
  });

  it('rejects a username with invalid characters', () => {
    const result = registerInfluencerSchema.safeParse({ body: { ...validBody, username: 'meera styles!' } });
    expect(result.success).toBe(false);
  });

  it('accepts underscores and dots in usernames', () => {
    const result = registerInfluencerSchema.safeParse({ body: { ...validBody, username: 'meera_styles.official' } });
    expect(result.success).toBe(true);
  });
});

describe('registerBrandSchema', () => {
  it('accepts a minimal valid brand registration', () => {
    const result = registerBrandSchema.safeParse({
      body: { role: 'BRAND', email: 'brand@example.com', password: 'password123', brandName: 'Studio Bloom' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing brand name', () => {
    const result = registerBrandSchema.safeParse({
      body: { role: 'BRAND', email: 'brand@example.com', password: 'password123' },
    });
    expect(result.success).toBe(false);
  });
});

describe('createCampaignSchema', () => {
  it('accepts a full campaign payload with deliverables', () => {
    const result = createCampaignSchema.safeParse({
      body: {
        title: 'Summer launch',
        description: 'A campaign for the summer collection launch',
        category: 'Fashion',
        creatorsNeeded: 3,
        deliverables: [{ description: '2 Reels', quantity: 2 }],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.status).toBe('DRAFT');
      expect(result.data.body.creatorsNeeded).toBe(3);
    }
  });

  it('rejects a title shorter than 3 characters', () => {
    const result = createCampaignSchema.safeParse({
      body: { title: 'Hi', description: 'A perfectly long enough description', category: 'Fashion' },
    });
    expect(result.success).toBe(false);
  });

  it('coerces numeric strings for budget fields', () => {
    const result = createCampaignSchema.safeParse({
      body: { title: 'Launch event', description: 'A perfectly long enough description', category: 'Tech', budgetMin: '5000', budgetMax: '10000' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.budgetMin).toBe(5000);
      expect(result.data.body.budgetMax).toBe(10000);
    }
  });
});

describe('applyToCampaignSchema', () => {
  it('requires a message of at least 5 characters', () => {
    const tooShort = applyToCampaignSchema.safeParse({ body: { message: 'hi' } });
    const ok = applyToCampaignSchema.safeParse({ body: { message: 'I would love to work on this campaign' } });
    expect(tooShort.success).toBe(false);
    expect(ok.success).toBe(true);
  });
});

describe('resetPasswordSchema', () => {
  it('rejects a short new password even with a valid token', () => {
    const result = resetPasswordSchema.safeParse({ body: { token: 'abc123', password: 'short' } });
    expect(result.success).toBe(false);
  });
});
