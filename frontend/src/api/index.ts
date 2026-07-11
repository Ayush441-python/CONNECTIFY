import { api } from '../lib/api';
import type {
  AppNotification,
  Campaign,
  CampaignApplication,
  Collaboration,
  CollaborationRequestItem,
  Message,
  PortfolioImage,
} from '../types';

// ---------------- Auth ----------------

export const authApi = {
  registerInfluencer: (payload: Record<string, unknown>) => api.post('/auth/register/influencer', payload),
  registerBrand: (payload: Record<string, unknown>) => api.post('/auth/register/brand', payload),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
};

// ---------------- Profile & Portfolio ----------------

export const profileApi = {
  updateInfluencer: (payload: Record<string, unknown>) => api.patch('/profile/influencer', payload),
  updateBrand: (payload: Record<string, unknown>) => api.patch('/profile/brand', payload),
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/profile/photo', form);
  },
  uploadFeaturedCover: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/profile/featured-cover', form);
  },
  getCreatorByUsername: (username: string) => api.get(`/profile/creator/${username}`),
};

export const portfolioApi = {
  list: () => api.get<{ data: PortfolioImage[] }>('/portfolio'),
  add: (file: File, caption?: string, category?: string, featured?: boolean) => {
    const form = new FormData();
    form.append('image', file);
    if (caption) form.append('caption', caption);
    if (category) form.append('category', category);
    if (featured) form.append('featured', String(featured));
    return api.post('/portfolio', form);
  },
  update: (imageId: string, payload: Record<string, unknown>) => api.patch(`/portfolio/${imageId}`, payload),
  remove: (imageId: string) => api.delete(`/portfolio/${imageId}`),
};

// ---------------- Discover ----------------

export interface DiscoverParams {
  category?: string;
  location?: string;
  tier?: string;
  availability?: string;
  search?: string;
  sort?: 'newest' | 'trending';
  page?: number;
}

export const discoverApi = {
  browse: (params: DiscoverParams) => api.get('/discover', { params }),
  byCategory: (category: string) => api.get(`/discover/category/${category}`),
};

// ---------------- Campaigns ----------------

export const campaignApi = {
  browse: (params: Record<string, unknown>) => api.get<{ data: Campaign[] }>('/campaigns', { params }),
  mine: () => api.get<{ data: Campaign[] }>('/campaigns/mine'),
  getById: (id: string) => api.get<{ data: Campaign }>(`/campaigns/${id}`),
  create: (payload: Record<string, unknown>) => api.post('/campaigns', payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/campaigns/${id}`, payload),
  remove: (id: string) => api.delete(`/campaigns/${id}`),
  apply: (id: string, payload: { message: string; expectedPrice?: number }) => api.post(`/campaigns/${id}/apply`, payload),
  applications: (id: string) => api.get<{ data: CampaignApplication[] }>(`/campaigns/${id}/applications`),
};

export const applicationApi = {
  mine: () => api.get<{ data: CampaignApplication[] }>('/applications/mine'),
  accept: (id: string) => api.patch(`/applications/${id}/accept`),
  reject: (id: string) => api.patch(`/applications/${id}/reject`),
};

// ---------------- Collaboration Requests & Workspace ----------------

export const requestApi = {
  send: (payload: Record<string, unknown>) => api.post('/requests', payload),
  mine: () => api.get<{ data: CollaborationRequestItem[] }>('/requests/mine'),
  accept: (id: string) => api.patch(`/requests/${id}/accept`),
  reject: (id: string) => api.patch(`/requests/${id}/reject`),
};

export const collaborationApi = {
  mine: () => api.get<{ data: Collaboration[] }>('/collaborations/mine'),
  getById: (id: string) => api.get<{ data: Collaboration }>(`/collaborations/${id}`),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/collaborations/${id}`, payload),
  uploadFile: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/collaborations/${id}/files`, form);
  },
  getMessages: (id: string, page = 1) => api.get<{ data: Message[] }>(`/collaborations/${id}/messages`, { params: { page } }),
};

// ---------------- Notifications ----------------

export const notificationApi = {
  list: (page = 1) => api.get<{ data: AppNotification[]; meta: { unreadCount: number } }>('/notifications', { params: { page } }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  unreadMessageCount: () => api.get<{ data: { count: number } }>('/messages/unread-count'),
};

// ---------------- Saved ----------------

export const savedApi = {
  saveCreator: (influencerId: string) => api.post(`/saved/creators/${influencerId}`),
  unsaveCreator: (influencerId: string) => api.delete(`/saved/creators/${influencerId}`),
  listSavedCreators: () => api.get('/saved/creators'),
  saveCampaign: (campaignId: string) => api.post(`/saved/campaigns/${campaignId}`),
  unsaveCampaign: (campaignId: string) => api.delete(`/saved/campaigns/${campaignId}`),
  listSavedCampaigns: () => api.get('/saved/campaigns'),
};

// ---------------- Uploads ----------------

export const uploadApi = {
  image: (file: File, folder = 'misc') => {
    const form = new FormData();
    form.append('image', file);
    return api.post<{ data: { url: string } }>('/uploads/image', form, { params: { folder } });
  },
};

// ---------------- Admin ----------------

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  listUsers: (params: Record<string, unknown>) => api.get('/admin/users', { params }),
  suspendUser: (id: string) => api.patch(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => api.patch(`/admin/users/${id}/activate`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  listReports: () => api.get('/admin/reports'),
};
