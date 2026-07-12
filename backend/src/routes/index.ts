import { Router } from 'express';
import { authenticate, optionalAuthenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter } from '../middlewares/security.middleware';
import { upload } from '../middlewares/upload.middleware';
import * as v from '../validators';

import * as auth from '../controllers/auth.controller';
import * as profile from '../controllers/profile.controller';
import * as discover from '../controllers/discover.controller';
import * as campaign from '../controllers/campaign.controller';
import * as application from '../controllers/application.controller';
import * as request from '../controllers/request.controller';
import * as message from '../controllers/message.controller';
import * as notification from '../controllers/notification.controller';
import * as admin from '../controllers/admin.controller';
import * as uploadCtrl from '../controllers/upload.controller';

const router = Router();

// ==================== AUTH ====================
const authRouter = Router();
authRouter.post('/register/influencer', authLimiter, validate(v.registerInfluencerSchema), auth.registerInfluencer);
authRouter.post('/register/brand', authLimiter, validate(v.registerBrandSchema), auth.registerBrand);
authRouter.post('/login', authLimiter, validate(v.loginSchema), auth.login);
authRouter.post('/refresh', auth.refresh);
authRouter.post('/logout', auth.logout);
authRouter.get('/me', authenticate, auth.getMe);
authRouter.post('/forgot-password', authLimiter, validate(v.forgotPasswordSchema), auth.forgotPassword);
authRouter.post('/reset-password', authLimiter, validate(v.resetPasswordSchema), auth.resetPassword);
authRouter.get('/verify-email/:token', auth.verifyEmail);
authRouter.post('/google', authLimiter, auth.googleAuth);
authRouter.post('/google/register/influencer', authLimiter, validate(v.googleRegisterInfluencerSchema), auth.googleRegisterInfluencer);
authRouter.post('/google/register/brand', authLimiter, validate(v.googleRegisterBrandSchema), auth.googleRegisterBrand);
router.use('/auth', authRouter);

// ==================== PROFILE ====================
const profileRouter = Router();
profileRouter.patch(
  '/influencer',
  authenticate,
  requireRole('INFLUENCER'),
  validate(v.updateInfluencerProfileSchema),
  profile.updateInfluencerProfile
);
profileRouter.patch('/brand', authenticate, requireRole('BRAND'), validate(v.updateBrandProfileSchema), profile.updateBrandProfile);
profileRouter.post('/photo', authenticate, upload.single('image'), profile.uploadProfilePhoto);
profileRouter.post('/featured-cover', authenticate, requireRole('INFLUENCER'), upload.single('image'), profile.uploadFeaturedCover);
profileRouter.get('/creator/:username', optionalAuthenticate, profile.getCreatorByUsername);
router.use('/profile', profileRouter);

// ==================== PORTFOLIO ====================
const portfolioRouter = Router();
portfolioRouter.use(authenticate, requireRole('INFLUENCER'));
portfolioRouter.get('/', profile.listMyPortfolio);
portfolioRouter.post('/', upload.single('image'), validate(v.portfolioImageSchema), profile.addPortfolioImage);
portfolioRouter.patch('/:imageId', validate(v.portfolioImageSchema), profile.updatePortfolioImage);
portfolioRouter.delete('/:imageId', profile.deletePortfolioImage);
router.use('/portfolio', portfolioRouter);

// ==================== DISCOVER ====================
const discoverRouter = Router();
discoverRouter.get('/', authenticate, requireRole('BRAND', 'ADMIN'), discover.discoverCreators);
discoverRouter.get('/category/:category', authenticate, requireRole('BRAND', 'ADMIN'), discover.discoverByCategory);
router.use('/discover', discoverRouter);

// ==================== CAMPAIGNS ====================
const campaignRouter = Router();
campaignRouter.get('/', authenticate, requireRole('INFLUENCER', 'ADMIN'), campaign.browseCampaigns);
campaignRouter.get('/mine', authenticate, requireRole('BRAND'), campaign.myCampaigns);
campaignRouter.post('/', authenticate, requireRole('BRAND'), validate(v.createCampaignSchema), campaign.createCampaign);
campaignRouter.get('/:id', authenticate, campaign.getCampaignById);
campaignRouter.patch('/:id', authenticate, requireRole('BRAND'), validate(v.updateCampaignSchema), campaign.updateCampaign);
campaignRouter.delete('/:id', authenticate, requireRole('BRAND'), campaign.deleteCampaign);
campaignRouter.post('/:id/apply', authenticate, requireRole('INFLUENCER'), validate(v.applyToCampaignSchema), application.applyToCampaign);
campaignRouter.get('/:id/applications', authenticate, requireRole('BRAND'), application.campaignApplications);
router.use('/campaigns', campaignRouter);

// ==================== APPLICATIONS ====================
const applicationRouter = Router();
applicationRouter.get('/mine', authenticate, requireRole('INFLUENCER'), application.myApplications);
applicationRouter.patch('/:id/accept', authenticate, requireRole('BRAND'), application.acceptApplication);
applicationRouter.patch('/:id/reject', authenticate, requireRole('BRAND'), application.rejectApplication);
router.use('/applications', applicationRouter);

// ==================== COLLABORATION REQUESTS ====================
const requestRouter = Router();
requestRouter.post(
  '/',
  authenticate,
  requireRole('BRAND'),
  validate(v.createCollaborationRequestSchema),
  request.sendCollaborationRequest
);
requestRouter.get('/mine', authenticate, requireRole('BRAND', 'INFLUENCER'), request.myCollaborationRequests);
requestRouter.patch('/:id/accept', authenticate, requireRole('INFLUENCER'), request.acceptCollaborationRequest);
requestRouter.patch('/:id/reject', authenticate, requireRole('INFLUENCER'), request.rejectCollaborationRequest);
router.use('/requests', requestRouter);

// ==================== COLLABORATIONS (workspace) ====================
const collaborationRouter = Router();
collaborationRouter.use(authenticate, requireRole('BRAND', 'INFLUENCER'));
collaborationRouter.get('/mine', request.myCollaborations);
collaborationRouter.get('/:id', request.getCollaboration);
collaborationRouter.patch('/:id', validate(v.updateCollaborationSchema), request.updateCollaboration);
collaborationRouter.post('/:id/files', upload.single('file'), request.uploadCollaborationFile);
collaborationRouter.get('/:id/messages', message.getMessages);
collaborationRouter.post('/:id/messages', validate(v.sendMessageSchema), message.sendMessageRest);
router.use('/collaborations', collaborationRouter);

// ==================== NOTIFICATIONS ====================
const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get('/', notification.listNotifications);
notificationRouter.patch('/:id/read', notification.markNotificationRead);
notificationRouter.patch('/read-all', notification.markAllNotificationsRead);
router.use('/notifications', notificationRouter);

router.get('/messages/unread-count', authenticate, message.unreadCount);

// ==================== SAVED ====================
const savedRouter = Router();
savedRouter.post('/creators/:influencerId', authenticate, requireRole('BRAND'), notification.saveCreator);
savedRouter.delete('/creators/:influencerId', authenticate, requireRole('BRAND'), notification.unsaveCreator);
savedRouter.get('/creators', authenticate, requireRole('BRAND'), notification.listSavedCreators);
savedRouter.post('/campaigns/:campaignId', authenticate, requireRole('INFLUENCER'), notification.saveCampaign);
savedRouter.delete('/campaigns/:campaignId', authenticate, requireRole('INFLUENCER'), notification.unsaveCampaign);
savedRouter.get('/campaigns', authenticate, requireRole('INFLUENCER'), notification.listSavedCampaigns);
router.use('/saved', savedRouter);

// ==================== UPLOADS ====================
router.post('/uploads/image', authenticate, upload.single('image'), uploadCtrl.uploadImage);

// ==================== REPORTS ====================
router.post('/reports', authenticate, validate(v.reportSchema), admin.createReport);

// ==================== ADMIN ====================
const adminRouter = Router();
adminRouter.use(authenticate, requireRole('ADMIN'));
adminRouter.get('/stats', admin.getStats);
adminRouter.get('/users', admin.listUsers);
adminRouter.patch('/users/:id/suspend', admin.suspendUser);
adminRouter.patch('/users/:id/activate', admin.activateUser);
adminRouter.delete('/users/:id', admin.deleteUser);
adminRouter.delete('/portfolio-images/:imageId', admin.deletePortfolioImageAdmin);
adminRouter.delete('/campaigns/:id', admin.deleteCampaignAdmin);
adminRouter.get('/reports', admin.listReports);
adminRouter.patch('/reports/:id', admin.updateReportStatus);
router.use('/admin', adminRouter);

// ==================== HEALTH ====================
router.get('/health', (_req, res) => res.json({ success: true, message: 'Connectify API is running' }));

export default router;
