"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBan = exports.addBan = exports.getBannedGuildList = exports.getBanListFromAPI = exports.getBanListFromSQL = exports.updateBanListCache = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const updateBanListCache = async (guild) => {
    await guild.bans.fetch().catch(err => { return; });
};
exports.updateBanListCache = updateBanListCache;
const getBanListFromSQL = async (guildId) => {
    const result = await prisma_1.default.guildBan.findMany({ where: { guildId } });
    return result;
};
exports.getBanListFromSQL = getBanListFromSQL;
const getBanListFromAPI = async (guild) => {
    await (0, exports.updateBanListCache)(guild);
    return guild.bans.cache;
};
exports.getBanListFromAPI = getBanListFromAPI;
const getBannedGuildList = async (userId) => {
    const result = await prisma_1.default.userData.findUnique({ where: { id: userId } });
    return result ? result.bannedGuild : [];
};
exports.getBannedGuildList = getBannedGuildList;
const addBan = async (guildId, member, reason) => {
    const exist = await prisma_1.default.guildBan.findFirst({ where: { guildId, userId: member.user.id } });
    if (exist)
        return;
    await prisma_1.default.guildBan.create({
        data: {
            userId: member.id,
            guildId,
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            reason: reason || '공개하지 않음'
        }
    });
    const list = [...await (0, exports.getBannedGuildList)(member.user.id), guildId];
    await prisma_1.default.userData.upsert({
        where: { id: member.user.id },
        update: { bannedGuild: list },
        create: {
            id: member.id,
            username: member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            bannedGuild: list,
            createdAt: member.user.createdAt
        }
    });
};
exports.addBan = addBan;
const removeBan = async (guildId, userId) => {
    await prisma_1.default.guildBan.deleteMany({ where: { guildId, userId } });
    const bannedGuild = await (0, exports.getBannedGuildList)(userId);
    if (!bannedGuild.includes(guildId))
        return;
    bannedGuild.splice(bannedGuild.indexOf(guildId), 1);
    await prisma_1.default.userData.update({
        where: { id: userId },
        data: { bannedGuild: bannedGuild }
    });
};
exports.removeBan = removeBan;
