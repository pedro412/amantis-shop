/**
 * Idempotent seed.
 *
 *   pnpm db:seed
 *
 * Creates (or refreshes the password of) the admin user defined by:
 *   SEED_ADMIN_EMAIL    — email used to log in
 *   SEED_ADMIN_PASSWORD — plaintext, hashed at runtime with bcrypt
 *   SEED_ADMIN_NAME     — optional display name
 *
 * The plaintext password is never stored or logged.
 */
import bcrypt from 'bcryptjs';

import { PrismaClient } from '../server/lib/generated/prisma';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function seedAdmin() {
  const email = requireEnv('SEED_ADMIN_EMAIL').toLowerCase().trim();
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  const name = process.env['SEED_ADMIN_NAME'] ?? null;

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, ...(name ? { name } : {}) },
    create: { email, passwordHash, name },
  });

  console.log(`✓ admin user ready: ${user.email} (id=${user.id})`);
}

async function main() {
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
