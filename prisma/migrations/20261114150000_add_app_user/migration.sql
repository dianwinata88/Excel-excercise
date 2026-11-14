-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "whopUserId" TEXT,
    "pro" BOOLEAN NOT NULL DEFAULT false,
    "membershipId" TEXT,
    "sessionsRevokedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");
CREATE UNIQUE INDEX "AppUser_whopUserId_key" ON "AppUser"("whopUserId");

-- Backfill WhopUser rows so sessions minted before AppUser existed keep
-- resolving (getEffectivePro also matches by whopUserId). One row per
-- effective email so duplicate WhopUser emails can't violate the unique
-- index; ON CONFLICT DO NOTHING covers both unique constraints.
INSERT INTO "AppUser" ("id", "email", "name", "passwordHash", "whopUserId", "pro", "membershipId", "syncedAt", "createdAt")
SELECT 'bf_' || "whopUserId", "email", "name", NULL, "whopUserId", "pro", "membershipId", "syncedAt", "createdAt"
FROM (
    SELECT DISTINCT ON (COALESCE("email", 'whop-' || "whopUserId" || '@oauth.local'))
           COALESCE("email", 'whop-' || "whopUserId" || '@oauth.local') AS "email",
           COALESCE("name", 'Excel learner') AS "name",
           "whopUserId", "pro", "membershipId", "syncedAt", "createdAt"
    FROM "WhopUser"
    ORDER BY COALESCE("email", 'whop-' || "whopUserId" || '@oauth.local'), "createdAt"
) deduped
ON CONFLICT DO NOTHING;
