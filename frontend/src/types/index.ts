export type Role = 'BRAND' | 'INFLUENCER' | 'ADMIN';
export type Tier = 'NANO' | 'MICRO' | 'MACRO' | 'MEGA';
export type Availability = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'COMPLETED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  mobile: string | null;
  role: Role;
  isEmailVerified: boolean;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  name: string;
  username: string;
  instagramUsername?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  categories: string[];
  languages: string[];
  tier: Tier;
  availability: Availability;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  featuredCoverUrl?: string | null;
  portfolioImages?: PortfolioImage[];
  createdAt: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  logoUrl?: string | null;
  industry?: string | null;
  about?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  preferredCategories: string[];
  createdAt: string;
}

export type Profile = InfluencerProfile | BrandProfile | null;

export interface PortfolioImage {
  id: string;
  influencerId: string;
  imageUrl: string;
  caption?: string | null;
  category?: string | null;
  featured: boolean;
  createdAt: string;
}

export interface Deliverable {
  id?: string;
  description: string;
  quantity: number;
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  location?: string | null;
  deadline?: string | null;
  creatorsNeeded: number;
  status: CampaignStatus;
  deliverables: Deliverable[];
  moodboardImages: { id: string; imageUrl: string }[];
  brand?: { id: string; brandName: string; logoUrl?: string | null; industry?: string | null };
  _count?: { applications: number };
  createdAt: string;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  message: string;
  expectedPrice?: number | null;
  status: ApplicationStatus;
  campaign?: Campaign;
  influencer?: InfluencerProfile;
  createdAt: string;
}

export interface CollaborationRequestItem {
  id: string;
  brandId: string;
  influencerId: string;
  campaignName: string;
  message: string;
  budget?: number | null;
  deliverables: string[];
  status: RequestStatus;
  brand?: { brandName: string; logoUrl?: string | null; industry?: string | null };
  influencer?: { name: string; username: string; profilePhotoUrl?: string | null; tier: Tier };
  createdAt: string;
}

export interface Collaboration {
  id: string;
  brandId: string;
  influencerId: string;
  campaignId?: string | null;
  status: 'ACTIVE' | 'COMPLETED';
  notes?: string | null;
  deadline?: string | null;
  brand: { id: string; brandName: string; logoUrl?: string | null; userId: string };
  influencer: { id: string; name: string; username: string; profilePhotoUrl?: string | null; userId: string };
  campaign?: Campaign | null;
  files: { id: string; fileUrl: string; name: string; createdAt: string }[];
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  collaborationId: string;
  senderId: string;
  receiverId: string;
  content?: string | null;
  imageUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginatedMeta & Record<string, unknown>;
}
