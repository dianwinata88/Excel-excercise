-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "whopUserId" TEXT,
    "pro" BOOLEAN NOT NULL DEFAULT false,
    "membershipId" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");
CREATE UNIQUE INDEX "AppUser_whopUserId_key" ON "AppUser"("whopUserId");

-- Backfill WhopUser rows so sessions minted before AppUser existed keep
-- resolving (getEffectivePro also matches by whopUserId).
INSERT INTO "AppUser" ("id", "email", "name", "passwordHash", "whopUserId", "pro", "membershipId", "syncedAt", "createdAt")
SELECT 'bf_' || "whopUserId",
       COALESCE("email", 'whop-' || "whopUserId" || '@oauth.local'),
       COALESCE("name", 'Excel learner'),
       NULL, "whopUserId", "pro", "membershipId", "syncedAt", "createdAt"
FROM "WhopUser"
ON CONFLICT ("whopUserId") DO NOTHING;
