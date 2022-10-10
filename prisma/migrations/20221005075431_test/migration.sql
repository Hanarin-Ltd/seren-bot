/*
  Warnings:

  - You are about to drop the column `mentionBlock` on the `MemberData` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `profileImg` to the `GuildBan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `botCount` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPartner` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isVerified` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberCount` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `premiumSubscriptionCount` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `premiumTier` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `GuildData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `UserData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GuildBan" ADD COLUMN     "profileImg" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GuildData" ADD COLUMN     "botCount" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "isPartner" BOOLEAN NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL,
ADD COLUMN     "memberCount" INTEGER NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "premiumSubscriptionCount" INTEGER NOT NULL,
ADD COLUMN     "premiumTier" INTEGER NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GuildOption" ADD COLUMN     "blockwordDisabledChannel" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "enableLegacyCommand" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "levelUpChannelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "levelUpMessage" TEXT NOT NULL DEFAULT ':partying_face: {user}님의 레벨이 올랐습니다! Level {beforelevel} -> {afterlevel}',
ADD COLUMN     "levelUpMessageEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "messageInLevelupChannel" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "unbanChannelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "unbanMessageEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "useLevelSystem" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "GuildRole" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MemberData" DROP COLUMN "mentionBlock",
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "UserData" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownedGuild" TEXT[],
ADD COLUMN     "point" INTEGER NOT NULL DEFAULT 25000,
ADD COLUMN     "preminumStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "GuildLogSetting" (
    "guildId" TEXT NOT NULL,
    "userCreate" BOOLEAN NOT NULL DEFAULT false,
    "userDelete" BOOLEAN NOT NULL DEFAULT false,
    "addMod" BOOLEAN NOT NULL DEFAULT false,
    "removeMod" BOOLEAN NOT NULL DEFAULT false,
    "useCommand" BOOLEAN NOT NULL DEFAULT false,
    "useBlockword" BOOLEAN NOT NULL DEFAULT false,
    "addBlockword" BOOLEAN NOT NULL DEFAULT false,
    "removeBlockword" BOOLEAN NOT NULL DEFAULT false,
    "removeMessage" BOOLEAN NOT NULL DEFAULT false,
    "levelUp" BOOLEAN NOT NULL DEFAULT false,
    "addRoleToMember" BOOLEAN NOT NULL DEFAULT false,
    "removeRoleToMember" BOOLEAN NOT NULL DEFAULT false,
    "addBan" BOOLEAN NOT NULL DEFAULT false,
    "removeBan" BOOLEAN NOT NULL DEFAULT false,
    "getWarning" BOOLEAN NOT NULL DEFAULT false,
    "removeWarning" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GuildLog" (
    "uniqueId" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rawContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildLog_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "CoinData" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceHistory" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "CoinData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCoinData" (
    "uniqueId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "coinId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCoinData_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "CoinComment" (
    "id" SERIAL NOT NULL,
    "authorId" TEXT NOT NULL,
    "coinId" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildLogSetting_guildId_key" ON "GuildLogSetting"("guildId");
