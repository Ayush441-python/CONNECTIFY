import { z } from 'zod';

const password = z.string().min(8, 'Password must be at least 8 characters');
const email = z.string().email('Invalid email address');

// ---------------- Auth ----------------

export const registerInfluencerSchema = z.object({
  body: z.object({
    role: z.literal('INFLUENCER'),
    email,
    password,
    mobile: z.string().min(6).optional(),
    name: z.string().min(2),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_.]+$/, 'Username may only contain letters, numbers, underscores and dots'),
    instagramUsername: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    categories: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    tier: z.enum(['NANO', 'MICRO', 'MACRO', 'MEGA']).default('NANO'),
    availability: z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).default('AVAILABLE'),
  }),
});

export const registerBrandSchema = z.object({
  body: z.object({
    role: z.literal('BRAND'),
    email,
    password,
    mobile: z.string().min(6).optional(),
    brandName: z.string().min(2),
    industry: z.string().optional(),
    about: z.string().optional(),
    website: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    preferredCategories: z.array(z.string()).default([]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password,
  }),
});

// ---------------- Profile ----------------

export const updateInfluencerProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    instagramUsername: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    categories: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    tier: z.enum(['NANO', 'MICRO', 'MACRO', 'MEGA']).optional(),
    availability: z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).optional(),
    bio: z.string().max(1000).optional(),
  }),
});

export const updateBrandProfileSchema = z.object({
  body: z.object({
    brandName: z.string().min(2).optional(),
    industry: z.string().optional(),
    about: z.string().max(1000).optional(),
    website: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    preferredCategories: z.array(z.string()).optional(),
  }),
});

export const portfolioImageSchema = z.object({
  body: z.object({
    caption: z.string().optional(),
    category: z.string().optional(),
    featured: z.coerce.boolean().optional(),
  }),
});

// ---------------- Campaigns ----------------

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(1),
    budgetMin: z.coerce.number().nonnegative().optional(),
    budgetMax: z.coerce.number().nonnegative().optional(),
    location: z.string().optional(),
    deadline: z.string().datetime().optional().or(z.string().optional()),
    creatorsNeeded: z.coerce.number().int().positive().default(1),
    status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED']).default('DRAFT'),
    deliverables: z
      .array(z.object({ description: z.string().min(1), quantity: z.coerce.number().int().positive().default(1) }))
      .default([]),
    moodboardImageUrls: z.array(z.string()).default([]),
  }),
});

export const updateCampaignSchema = createCampaignSchema.deepPartial();

// ---------------- Applications & Requests ----------------

export const applyToCampaignSchema = z.object({
  body: z.object({
    message: z.string().min(5),
    expectedPrice: z.coerce.number().nonnegative().optional(),
  }),
});

export const createCollaborationRequestSchema = z.object({
  body: z.object({
    influencerId: z.string().min(1),
    campaignName: z.string().min(2),
    message: z.string().min(5),
    budget: z.coerce.number().nonnegative().optional(),
    deliverables: z.array(z.string()).default([]),
  }),
});

// ---------------- Collaboration ----------------

export const updateCollaborationSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
    deadline: z.string().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
  }),
});

// ---------------- Messages ----------------

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
});

// ---------------- Admin ----------------

export const reportSchema = z.object({
  body: z.object({
    reportedUserId: z.string().optional(),
    reason: z.string().min(3),
    details: z.string().optional(),
  }),
});
