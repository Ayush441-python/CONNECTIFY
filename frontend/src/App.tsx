import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { PublicLayout, DashboardLayout } from './components/layout';
import { ProtectedRoute, RoleRoute, GuestOnlyRoute } from './components/routeGuards';
import { Loader } from './components/ui';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GoogleFinishSignup from './pages/auth/GoogleFinishSignup';
import { ForgotPassword, ResetPassword } from './pages/auth/PasswordReset';
import VerifyEmail from './pages/auth/VerifyEmail';

const InfluencerDashboard = lazy(() => import('./pages/influencer/Dashboard'));
const InfluencerPortfolio = lazy(() => import('./pages/influencer/Portfolio'));
const InfluencerCampaigns = lazy(() => import('./pages/influencer/Campaigns'));
const InfluencerApplications = lazy(() => import('./pages/influencer/Applications'));
const InfluencerRequests = lazy(() => import('./pages/influencer/Requests'));
const InfluencerSettings = lazy(() => import('./pages/influencer/Settings'));

const BrandDashboard = lazy(() => import('./pages/brand/Dashboard'));
const BrandDiscover = lazy(() => import('./pages/brand/Discover'));
const BrandCampaigns = lazy(() => import('./pages/brand/Campaigns'));
const BrandApplications = lazy(() => import('./pages/brand/Applications'));
const SavedCreators = lazy(() => import('./pages/brand/SavedCreators'));
const BrandSettings = lazy(() => import('./pages/brand/Settings'));

const CreatorProfile = lazy(() => import('./pages/shared/CreatorProfile'));
const CampaignDetail = lazy(() => import('./pages/shared/CampaignDetail'));
const Messages = lazy(() => import('./pages/shared/Messages'));
const Notifications = lazy(() => import('./pages/shared/Notifications'));

const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader size={28} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
          <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public marketing site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/creator/:username" element={<CreatorProfile />} />
              <Route path="/campaign/:id" element={<CampaignDetail />} />
            </Route>

            {/* Accessible whether logged in or not — the verification link goes here either way */}
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Guest-only auth pages */}
            <Route element={<GuestOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/google/finish" element={<GoogleFinishSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Authenticated dashboards */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allow={['INFLUENCER']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/influencer" element={<InfluencerDashboard />} />
                  <Route path="/influencer/portfolio" element={<InfluencerPortfolio />} />
                  <Route path="/influencer/campaigns" element={<InfluencerCampaigns />} />
                  <Route path="/influencer/applications" element={<InfluencerApplications />} />
                  <Route path="/influencer/requests" element={<InfluencerRequests />} />
                  <Route path="/influencer/messages" element={<Messages />} />
                  <Route path="/influencer/notifications" element={<Notifications />} />
                  <Route path="/influencer/settings" element={<InfluencerSettings />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allow={['BRAND']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/brand" element={<BrandDashboard />} />
                  <Route path="/brand/discover" element={<BrandDiscover />} />
                  <Route path="/brand/campaigns" element={<BrandCampaigns />} />
                  <Route path="/brand/campaigns/:campaignId/applications" element={<BrandApplications />} />
                  <Route path="/brand/saved" element={<SavedCreators />} />
                  <Route path="/brand/messages" element={<Messages />} />
                  <Route path="/brand/notifications" element={<Notifications />} />
                  <Route path="/brand/settings" element={<BrandSettings />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allow={['ADMIN']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/users" element={<AdminPanel />} />
                  <Route path="/admin/reports" element={<AdminPanel />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Landing />} />
          </Routes>
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
