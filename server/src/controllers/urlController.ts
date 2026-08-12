import { Request, Response, NextFunction } from 'express';
import { urlService } from '../services/urlService.js';
import { validateLongUrl, validateCustomAlias } from '../middleware/validator.js';

function getBaseUrl(req: Request): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  return 'https://niat.me';
}

export const shortenUrlController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { longUrl, customAlias, expiresAt } = req.body;

    const urlVal = validateLongUrl(longUrl);
    if (!urlVal.isValid) {
      res.status(400).json({ error: urlVal.error });
      return;
    }

    if (customAlias) {
      const aliasVal = validateCustomAlias(customAlias);
      if (!aliasVal.isValid) {
        res.status(400).json({ error: aliasVal.error });
        return;
      }
    }

    const baseUrl = getBaseUrl(req);
    const result = await urlService.shortenUrl(
      {
        longUrl: urlVal.cleanUrl!,
        customAlias: customAlias ? customAlias.trim() : undefined,
        expiresAt
      },
      baseUrl
    );

    res.status(201).json(result);
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const redirectUrlController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const code = String(req.params.shortCode || '');

    if (!code || code === 'favicon.ico' || code === 'robots.txt' || code.startsWith('api')) {
      res.status(404).send('Not Found');
      return;
    }

    const targetUrl = await urlService.resolveUrl(code);

    if (!targetUrl) {
      const clientUrl = process.env.CLIENT_URL || 'https://niat.me';
      res.redirect(302, `${clientUrl}/404?code=${encodeURIComponent(code)}`);
      return;
    }

    res.redirect(301, targetUrl);
  } catch (err) {
    next(err);
  }
};

export const getUrlStatsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const code = String(req.params.shortCode || '');

    if (!code) {
      res.status(400).json({ error: 'Short code is required' });
      return;
    }

    const baseUrl = getBaseUrl(req);
    const stats = await urlService.getUrlStats(code, baseUrl);

    if (!stats) {
      res.status(404).json({ error: `Short code '${code}' not found or has expired.` });
      return;
    }

    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

export const getRecentUrlsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const baseUrl = getBaseUrl(req);
    const urls = await urlService.getRecentUrls(baseUrl);
    res.status(200).json(urls);
  } catch (err) {
    next(err);
  }
};

export const getAnalyticsOverviewController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const baseUrl = getBaseUrl(req);
    const analytics = await urlService.getAnalyticsOverview(baseUrl);
    res.status(200).json(analytics);
  } catch (err) {
    next(err);
  }
};
