import express from 'express';
import cors from 'cors';
import { shortenRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  shortenUrlController,
  redirectUrlController,
  getUrlStatsController,
  getRecentUrlsController,
  getAnalyticsOverviewController
} from './controllers/urlController.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post(['/api/shorten', '/shorten'], shortenRateLimiter, shortenUrlController);
app.get(['/api/stats/:shortCode', '/stats/:shortCode'], getUrlStatsController);
app.get(['/api/urls', '/urls'], getRecentUrlsController);
app.get(['/api/analytics/overview', '/analytics/overview'], getAnalyticsOverviewController);

app.get(['/api/:shortCode', '/:shortCode'], redirectUrlController);

app.use(errorHandler);

export default app;
