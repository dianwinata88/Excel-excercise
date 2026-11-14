-- CreateTable
CREATE TABLE "WhopUser" (
    "whopUserId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "pro" BOOLEAN NOT NULL DEFAULT false,
    "membershipId" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhopUser_pkey" PRIMARY KEY ("whopUserId")
);
