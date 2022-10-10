"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeGuildData = exports.addOrUpdateGuildData = exports.getGuildData = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const discord_1 = require("./discord");
const getGuildData = async (guildId) => {
    return await prisma_1.default.guildData.findUnique({ where: { guildId } });
};
exports.getGuildData = getGuildData;
const addOrUpdateGuildData = async (guild) => {
    await prisma_1.default.guildData.upsert({
        where: { guildId: guild.id },
        update: {
            name: guild.name,
            ownerId: guild.ownerId,
            icon: guild.iconURL() || 'none',
            memberCount: guild.memberCount,
            botCount: guild.members.cache.filter(member => member.user.bot).size,
            region: guild.preferredLocale,
            createdAt: guild.createdAt,
            isPartner: guild.partnered,
            isVerified: guild.verified,
            premiumTier: guild.premiumTier,
            premiumSubscriptionCount: guild.premiumSubscriptionCount || 0,
            description: guild.description || '설명 없음',
            isCommunityGuild: (0, discord_1.isCommunity)(guild)
        },
        create: {
            guildId: guild.id,
            name: guild.name,
            ownerId: guild.ownerId,
            icon: guild.iconURL() || 'none',
            memberCount: guild.memberCount,
            botCount: guild.members.cache.filter(member => member.user.bot).size,
            region: guild.preferredLocale,
            createdAt: guild.createdAt,
            isPartner: guild.partnered,
            isVerified: guild.verified,
            premiumTier: guild.premiumTier,
            premiumSubscriptionCount: guild.premiumSubscriptionCount || 0,
            description: guild.description || '설정되지 않음',
            isCommunityGuild: (0, discord_1.isCommunity)(guild)
        }
    });
};
exports.addOrUpdateGuildData = addOrUpdateGuildData;
const removeGuildData = async (guildId) => {
    try {
        await prisma_1.default.guildData.deleteMany({ where: { guildId } });
        await prisma_1.default.guildBan.deleteMany({ where: { guildId } });
        await prisma_1.default.guildChannel.deleteMany({ where: { guildId } });
        await prisma_1.default.guildOption.deleteMany({ where: { guildId } });
        await prisma_1.default.guildPermission.deleteMany({ where: { guildId } });
        await prisma_1.default.blockword.deleteMany({ where: { guildId } });
        await prisma_1.default.memberData.deleteMany({ where: { guildId } });
        await prisma_1.default.guildRole.deleteMany({ where: { guildId } });
        await prisma_1.default.guildLog.deleteMany({ where: { guildId } });
        await prisma_1.default.guildLogSetting.deleteMany({ where: { guildId } });
    }
    catch (err) {
        console.log(err);
    }
};
exports.removeGuildData = removeGuildData;
