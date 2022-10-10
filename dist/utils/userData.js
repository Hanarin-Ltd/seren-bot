"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnedGuildList = exports.removeUserPoint = exports.addUserPoint = exports.addUserData = exports.getUserData = void 0;
const __1 = require("..");
const prisma_1 = __importDefault(require("../prisma"));
const ban_1 = require("./ban");
const getUserData = async (userId) => {
    const result = await prisma_1.default.userData.findUnique({ where: { id: userId } });
    if (!result)
        await (0, exports.addUserData)(userId);
    return result ? result : await (0, exports.getUserData)(userId);
};
exports.getUserData = getUserData;
const addUserData = async (userId) => {
    const user = await __1.client.users.fetch(userId);
    const exist = await prisma_1.default.userData.findUnique({ where: { id: user.id } });
    if (exist)
        return;
    return await prisma_1.default.userData.create({
        data: {
            id: user.id,
            username: user.username,
            tag: user.tag,
            profileImg: user.displayAvatarURL(),
            bannedGuild: await (0, ban_1.getBannedGuildList)(userId),
            ownedGuild: (await (0, exports.getOwnedGuildList)(userId)).map(g => g.guildId),
            createdAt: user.createdAt
        }
    });
};
exports.addUserData = addUserData;
const addUserPoint = async (userId, point) => {
    const userData = await (0, exports.getUserData)(userId);
    await prisma_1.default.userData.update({
        where: { id: userId },
        data: { point: userData.point + point }
    });
};
exports.addUserPoint = addUserPoint;
const removeUserPoint = async (userId, point) => {
    const userData = await (0, exports.getUserData)(userId);
    await prisma_1.default.userData.update({
        where: { id: userId },
        data: { point: userData.point - point }
    });
};
exports.removeUserPoint = removeUserPoint;
const getOwnedGuildList = async (userId) => {
    const result = await prisma_1.default.guildData.findMany({ where: { ownerId: userId } });
    return result;
};
exports.getOwnedGuildList = getOwnedGuildList;
