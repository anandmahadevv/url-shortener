import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || '3a6b9465a306a3d7e039aca801094e35ea0bd13d0eb0d342cd112311b9a16e12';

// Memory Fallback Users Store for local offline testing if needed
class MemoryUserStore {
  private users: Map<string, any> = new Map();
  private usersByEmail: Map<string, any> = new Map();

  async findByEmail(email: string) {
    return this.usersByEmail.get(email.toLowerCase()) || null;
  }

  async findById(id: string) {
    return this.users.get(id) || null;
  }

  async create(data: { email: string; password: string; name?: string }) {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const record = {
      id,
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, record);
    this.usersByEmail.set(data.email.toLowerCase(), record);
    return record;
  }
}

const memoryUserDb = new MemoryUserStore();

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw { status: 400, message: 'Please provide a valid email address.' };
    }

    if (!password || password.length < 6) {
      throw { status: 400, message: 'Password must be at least 6 characters long.' };
    }

    // Check existing
    let existing: any = null;
    try {
      existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    } catch (err) {
      existing = await memoryUserDb.findByEmail(cleanEmail);
    }

    if (existing) {
      throw { status: 409, message: 'An account with this email address already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user: any = null;

    try {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          name: name ? name.trim() : null
        }
      });
    } catch (err) {
      user = await memoryUserDb.create({
        email: cleanEmail,
        password: hashedPassword,
        name: name ? name.trim() : undefined
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }

  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw { status: 400, message: 'Email and password are required.' };
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    } catch (err) {
      user = await memoryUserDb.findByEmail(cleanEmail);
    }

    if (!user) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }

  async getProfile(userId: string) {
    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } catch (err) {
      user = await memoryUserDb.findById(userId);
    }

    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}

export const authService = new AuthService();
