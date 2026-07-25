import axios, { AxiosError } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  // Use Clerk's global object to fetch the token asynchronously
  const clerk = (window as any).Clerk;
  if (clerk?.session) {
    const token = await clerk.session.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; details?: { field?: string; message: string }[] } | undefined;
    if (data?.details?.length) {
      return data.details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join(' • ');
    }
    return data?.message || err.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}