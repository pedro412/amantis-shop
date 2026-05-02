-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "message" VARCHAR(200) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_isActive_updatedAt_idx" ON "Announcement"("isActive", "updatedAt");
