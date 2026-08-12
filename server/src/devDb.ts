import { newDb } from 'pg-mem';
import net from 'net';

export async function ensurePostgresServer(): Promise<void> {
  const port = 5432;

  const isPortInUse = await new Promise<boolean>((resolve) => {
    const client = new net.Socket();
    client.once('connect', () => {
      client.end();
      resolve(true);
    });
    client.once('error', () => {
      resolve(false);
    });
    client.connect(port, '127.0.0.1');
  });

  if (isPortInUse) {
    console.log('✅ Local PostgreSQL server detected on port 5432.');
    return;
  }

  console.log('⚡ Starting lightweight embedded PostgreSQL server (pg-mem) on port 5432...');

  try {
    const db = newDb();

    // Initialize Schema matching Prisma schema exactly
    db.public.none(`
      CREATE TABLE IF NOT EXISTS "Url" (
        "id" BIGSERIAL PRIMARY KEY,
        "shortCode" VARCHAR(255) UNIQUE NOT NULL,
        "longUrl" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "clickCount" INTEGER DEFAULT 0,
        "customAlias" BOOLEAN DEFAULT FALSE
      );
      CREATE INDEX IF NOT EXISTS "Url_shortCode_idx" ON "Url"("shortCode");
    `);

    const server = db.getPostgresServer(port);
    console.log(`✅ Embedded PostgreSQL server listening on postgresql://postgres:postgres@localhost:${port}/urlshortener`);
  } catch (err) {
    console.error('Failed to start embedded postgres server:', err);
  }
}
