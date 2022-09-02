-- CreateTable
CREATE TABLE "GuildPermission" (
    "guildId" TEXT NOT NULL,
    "collectBlockword" BOOLEAN NOT NULL DEFAULT false,
    "collectBan" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GuildOption" (
    "guildId" TEXT NOT NULL,
    "banChannelId" TEXT NOT NULL DEFAULT '',
    "banMessageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "welcomeChannelId" TEXT NOT NULL DEFAULT '',
    "welcomeMessage" TEXT NOT NULL DEFAULT ':wave: 안녕하세요, {user}님!',
    "welcomeMessageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "goodbyeChannelId" TEXT NOT NULL DEFAULT '',
    "goodbyeMessage" TEXT NOT NULL DEFAULT ':cry: {user}님이 나가셨습니다.',
    "goodbyeMessageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "logChannelId" TEXT NOT NULL DEFAULT '',
    "logEnabled" BOOLEAN NOT NULL DEFAULT false,
    "checkModsMessage" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GuildChannel" (
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "channelType" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "GuildData" (
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isCommunityGuild" BOOLEAN NOT NULL DEFAULT false,
    "isSettingComplete" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GuildBan" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserData" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    "bannedGuild" TEXT[]
);

-- CreateTable
CREATE TABLE "MemberData" (
    "uniqueId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    "mod" BOOLEAN NOT NULL DEFAULT false,
    "mentionBlock" BOOLEAN NOT NULL DEFAULT false,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "warning" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MemberData_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "Blockword" (
    "uniqueId" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "word" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Blockword_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tag" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" SERIAL NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'any'
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildPermission_guildId_key" ON "GuildPermission"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildOption_guildId_key" ON "GuildOption"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildChannel_channelId_key" ON "GuildChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildData_guildId_key" ON "GuildData"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildBan_userId_key" ON "GuildBan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_id_key" ON "UserData"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRole_id_key" ON "GuildRole"("id");
