# SwiftURL - Full-Stack URL Shortener Application

A full-stack URL shortening service engineered with Node.js, Express, TypeScript, PostgreSQL (Prisma ORM), Redis, React, and Tailwind CSS.

## Features
- **Base62 Encoding**: Encodes auto-incrementing database primary keys (`BigInt`) into unique Base62 short codes.
- **Custom Aliases**: Allows users to specify unique custom aliases (returns 409 Conflict if taken).
- **Expiration Support**: Set optional expiration dates on short links.
- **High Performance Caching**: Instantaneous 301 redirects backed by Redis cache fallback to PostgreSQL.
- **Non-blocking Analytics**: Asynchronous fire-and-forget click count increments.
- **Rate Limiting**: Protected `/api/shorten` endpoint limited to 20 requests/minute per IP.
- **Malicious URL Protection**: Rejects dangerous schemes (`javascript:`, `data:`, `file:`).
- **Responsive UI**: Built with React, TypeScript, Vite, and Tailwind CSS.

---

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (`ioredis` with in-memory fallback)
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Package Manager**: `pnpm`

---

## Environment Variables (`.env`)

Copy `.env.example` to `.env` or `server/.env`:

```env
PORT=5000
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/urlshortener?schema=public
REDIS_URL=redis://localhost:6379
```

---

## Quick Start (Docker Compose)

Spin up PostgreSQL, Redis, and Backend together:

```bash
docker-compose up --build
```

Access:
- **Backend API**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`

---

## Development Setup (Local)

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Database Migration**:
   ```bash
   cd server
   pnpm prisma:generate
   pnpm prisma:push
   ```

3. **Run Development Servers**:
   From the root folder:
   ```bash
   pnpm dev
   ```
   Or separately:
   - Server: `pnpm --filter server dev`
   - Client: `pnpm --filter client dev`

4. **Run Unit & Integration Tests**:
   ```bash
   cd server
   pnpm test
   ```

---

## API Documentation

### 1. `POST /api/shorten`
Shortens a URL.

**Request Body:**
```json
{
  "longUrl": "https://example.com/long/path",
  "customAlias": "my-alias", // Optional
  "expiresAt": "2026-12-31T23:59:59Z" // Optional
}
```

**Response (201 Created):**
```json
{
  "id": "1",
  "shortCode": "my-alias",
  "longUrl": "https://example.com/long/path",
  "shortUrl": "http://localhost:5000/my-alias",
  "createdAt": "2026-08-12T10:57:23.000Z",
  "expiresAt": null,
  "clickCount": 0,
  "customAlias": true
}
```

### 2. `GET /:shortCode`
Redirects to the original URL with `HTTP 301 Moved Permanently`. Redirects to 404 page if not found or expired.

### 3. `GET /api/stats/:shortCode`
Returns link analytics and metadata.

**Response (200 OK):**
```json
{
  "id": "1",
  "shortCode": "my-alias",
  "longUrl": "https://example.com/long/path",
  "shortUrl": "http://localhost:5000/my-alias",
  "createdAt": "2026-08-12T10:57:23.000Z",
  "expiresAt": null,
  "clickCount": 3,
  "customAlias": true
}
```
