import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { shortenRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth, optionalAuth } from './middleware/auth.js';
import {
  shortenUrlController,
  redirectUrlController,
  getUrlStatsController,
  getRecentUrlsController,
  getAnalyticsOverviewController
} from './controllers/urlController.js';
import {
  registerController,
  loginController,
  getMeController,
  getUserUrlsController,
  deleteUserUrlController
} from './controllers/authController.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication Routes
app.post(['/api/auth/register', '/auth/register'], registerController);
app.post(['/api/auth/login', '/auth/login'], loginController);
app.get(['/api/auth/me', '/auth/me'], requireAuth, getMeController);

// User Specific URL Management
app.get(['/api/user/urls', '/user/urls'], requireAuth, getUserUrlsController);
app.delete(['/api/urls/:shortCode', '/urls/:shortCode'], requireAuth, deleteUserUrlController);

// General Shortener & Telemetry Routes
app.post(['/api/shorten', '/shorten'], optionalAuth, shortenRateLimiter, shortenUrlController);
app.get(['/api/stats/:shortCode', '/stats/:shortCode'], getUrlStatsController);
app.get(['/api/urls', '/urls'], getRecentUrlsController);
app.get(['/api/analytics/overview', '/analytics/overview'], getAnalyticsOverviewController);

// Short Code Redirection
app.get(['/api/:shortCode', '/:shortCode'], redirectUrlController);

app.use(errorHandler);

export default app;
