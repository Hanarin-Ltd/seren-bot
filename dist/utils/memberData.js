"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberData = exports.removeMemberData = exports.addMemberData = exports.getMemberData = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const discord_1 = require("./discord");
const getMemberData = async (memberId) => {
    const result = await prisma_1.default.memberData.findFirst({ where: { userId: memberId } });
    return result ? result : {};
};
exports.getMemberData = getMemberData;
const addMemberData = async (member) => {
    const exist = await prisma_1.default.memberData.findFirst({ where: { userId: member.id, guildId: member.guild.id } });
    if (exist)
        return;
    await prisma_1.default.memberData.create({
        data: {
            userId: member.id,
            guildId: member.guild.id,
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            joinedAt: member.joinedAt ? member.joinedAt : new Date(),
            isOwner: (await (0, discord_1.getGuildOwner)(member.guild)).id === member.id
        }
    });
};
exports.addMemberData = addMemberData;
const removeMemberData = async (member) => {
    await prisma_1.default.memberData.deleteMany({ where: { guildId: member.guild.id, userId: member.id } });
};
exports.removeMemberData = removeMemberData;
const updateMemberData = async (member) => {
    await prisma_1.default.memberData.updateMany({
        where: { guildId: member.guild.id, userId: member.id },
        data: {
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            joinedAt: member.joinedAt ? member.joinedAt : new Date(),
            isOwner: (await (0, discord_1.getGuildOwner)(member.guild)).id === member.id
        }
    });
};
exports.updateMemberData = updateMemberData;
