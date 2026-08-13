import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { urlService } from '../services/urlService.js';
import { AuthRequest } from '../middleware/auth.js';

function getBaseUrl(req: Request): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  return 'https://niat.me';
}

export const registerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const getMeController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const profile = await authService.getProfile(req.user.userId);
    res.status(200).json({ user: profile });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const getUserUrlsController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const baseUrl = getBaseUrl(req);
    const urls = await urlService.getUserUrls(req.user.userId, baseUrl);
    res.status(200).json(urls);
  } catch (err) {
    next(err);
  }
};

export const deleteUserUrlController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const code = String(req.params.shortCode || '');
    const success = await urlService.deleteUserUrl(code, req.user.userId);
    if (!success) {
      res.status(404).json({ error: 'Link not found or you do not have permission to delete it.' });
      return;
    }
    res.status(200).json({ message: 'Link deleted successfully' });
  } catch (err) {
    next(err);
  }
};
