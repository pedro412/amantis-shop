/**
 * Read-only queries for announcements. Public callers use `getActiveAnnouncement`;
 * admin pages use `listAnnouncements` to render the management table.
 */

import { prisma } from '@/server/lib/prisma';

export type ActiveAnnouncement = {
  id: string;
  message: string;
};

export async function getActiveAnnouncement(): Promise<ActiveAnnouncement | null> {
  const row = await prisma.announcement.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, message: true },
  });
  return row;
}

export type AdminAnnouncement = {
  id: string;
  message: string;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
};

export async function listAnnouncements(): Promise<AdminAnnouncement[]> {
  return prisma.announcement.findMany({
    orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      message: true,
      isActive: true,
      updatedAt: true,
      createdAt: true,
    },
  });
}
