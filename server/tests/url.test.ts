import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/db.js';

// Mock prisma for integration test suite
vi.mock('../src/config/db.js', () => {
  const mockDb = new Map<string, any>();
  let currentId = 1n;

  return {
    prisma: {
      url: {
        findUnique: vi.fn(async ({ where }: { where: { shortCode: string } }) => {
          for (const item of mockDb.values()) {
            if (item.shortCode === where.shortCode) {
              return item;
            }
          }
          return null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const id = currentId++;
          const record = {
            id,
            shortCode: data.shortCode,
            longUrl: data.longUrl,
            createdAt: new Date(),
            expiresAt: data.expiresAt || null,
            clickCount: 0,
            customAlias: data.customAlias || false
          };
          mockDb.set(id.toString(), record);
          return record;
        }),
        update: vi.fn(async ({ where, data }: { where: any; data: any }) => {
          let record: any = null;
          if (where.id) {
            record = mockDb.get(where.id.toString());
          } else if (where.shortCode) {
            for (const item of mockDb.values()) {
              if (item.shortCode === where.shortCode) {
                record = item;
                break;
              }
            }
          }

          if (record) {
            if (data.shortCode) record.shortCode = data.shortCode;
            if (data.clickCount?.increment) record.clickCount += data.clickCount.increment;
          }
          return record;
        }),
        findMany: vi.fn(async () => Array.from(mockDb.values()))
      }
    }
  };
});

describe('URL Shortener API Integration Flow', () => {
  it('should reject invalid and malicious URLs (e.g. javascript:)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'javascript:alert(1)' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('dangerous URL scheme');
  });

  it('should successfully shorten a valid URL using Base62 encoding', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://google.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.longUrl).toBe('https://google.com/');
  });

  it('should shorten with custom alias and reject duplicates with 409 Conflict', async () => {
    // First creation
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://github.com', customAlias: 'my-repo' });

    expect(res1.status).toBe(201);
    expect(res1.body.shortCode).toBe('my-repo');

    // Duplicate creation
    const res2 = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://gitlab.com', customAlias: 'my-repo' });

    expect(res2.status).toBe(409);
    expect(res2.body.error).toContain("already taken");
  });

  it('should redirect GET /:shortCode with 301 Permanent Redirect to longUrl', async () => {
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://wikipedia.org', customAlias: 'wiki' });

    const code = shortenRes.body.shortCode;

    const redirectRes = await request(app).get(`/${code}`);
    expect(redirectRes.status).toBe(301);
    expect(redirectRes.header.location).toBe('https://wikipedia.org/');
  });

  it('should return 404 for unknown shortCode', async () => {
    const res = await request(app).get('/api/stats/nonexistent-code-123');
    expect(res.status).toBe(404);
  });
});
