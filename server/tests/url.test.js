"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_js_1 = require("../src/app.js");
// Mock prisma for integration test suite
vitest_1.vi.mock('../src/config/db.js', () => {
    const mockDb = new Map();
    let currentId = 1n;
    return {
        prisma: {
            url: {
                findUnique: vitest_1.vi.fn(async ({ where }) => {
                    for (const item of mockDb.values()) {
                        if (item.shortCode === where.shortCode) {
                            return item;
                        }
                    }
                    return null;
                }),
                create: vitest_1.vi.fn(async ({ data }) => {
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
                update: vitest_1.vi.fn(async ({ where, data }) => {
                    let record = null;
                    if (where.id) {
                        record = mockDb.get(where.id.toString());
                    }
                    else if (where.shortCode) {
                        for (const item of mockDb.values()) {
                            if (item.shortCode === where.shortCode) {
                                record = item;
                                break;
                            }
                        }
                    }
                    if (record) {
                        if (data.shortCode)
                            record.shortCode = data.shortCode;
                        if (data.clickCount?.increment)
                            record.clickCount += data.clickCount.increment;
                    }
                    return record;
                }),
                findMany: vitest_1.vi.fn(async () => Array.from(mockDb.values()))
            }
        }
    };
});
(0, vitest_1.describe)('URL Shortener API Integration Flow', () => {
    (0, vitest_1.it)('should reject invalid and malicious URLs (e.g. javascript:)', async () => {
        const res = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/shorten')
            .send({ longUrl: 'javascript:alert(1)' });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toContain('dangerous URL scheme');
    });
    (0, vitest_1.it)('should successfully shorten a valid URL using Base62 encoding', async () => {
        const res = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/shorten')
            .send({ longUrl: 'https://google.com' });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toHaveProperty('shortCode');
        (0, vitest_1.expect)(res.body).toHaveProperty('shortUrl');
        (0, vitest_1.expect)(res.body.longUrl).toBe('https://google.com/');
    });
    (0, vitest_1.it)('should shorten with custom alias and reject duplicates with 409 Conflict', async () => {
        // First creation
        const res1 = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/shorten')
            .send({ longUrl: 'https://github.com', customAlias: 'my-repo' });
        (0, vitest_1.expect)(res1.status).toBe(201);
        (0, vitest_1.expect)(res1.body.shortCode).toBe('my-repo');
        // Duplicate creation
        const res2 = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/shorten')
            .send({ longUrl: 'https://gitlab.com', customAlias: 'my-repo' });
        (0, vitest_1.expect)(res2.status).toBe(409);
        (0, vitest_1.expect)(res2.body.error).toContain("already taken");
    });
    (0, vitest_1.it)('should redirect GET /:shortCode with 301 Permanent Redirect to longUrl', async () => {
        const shortenRes = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/shorten')
            .send({ longUrl: 'https://wikipedia.org', customAlias: 'wiki' });
        const code = shortenRes.body.shortCode;
        const redirectRes = await (0, supertest_1.default)(app_js_1.app).get(`/${code}`);
        (0, vitest_1.expect)(redirectRes.status).toBe(301);
        (0, vitest_1.expect)(redirectRes.header.location).toBe('https://wikipedia.org/');
    });
    (0, vitest_1.it)('should return 404 for unknown shortCode', async () => {
        const res = await (0, supertest_1.default)(app_js_1.app).get('/api/stats/nonexistent-code-123');
        (0, vitest_1.expect)(res.status).toBe(404);
    });
});
