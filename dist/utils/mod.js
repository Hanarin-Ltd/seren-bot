"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGuildMod = exports.removeMod = exports.addMod = exports.getModList = void 0;
const discord_js_1 = require("discord.js");
const prisma_1 = __importDefault(require("../prisma"));
const log_1 = require("./log");
const memberData_1 = require("./memberData");
const role_1 = require("./role");
const getModList = async (guildId) => {
    const modList = await prisma_1.default.memberData.findMany({ where: {
            guildId,
            mod: true
        } });
    return modList;
};
exports.getModList = getModList;
const addMod = async (guild, member) => {
    try {
        const logSetting = await (0, log_1.getGuildLogSetting)(guild.id);
        const exist = await prisma_1.default.memberData.findMany({ where: { guildId: guild.id, mod: true, userId: member.id } });
        if (exist.length > 0)
            return;
        await (0, memberData_1.addMemberData)(member);
        await prisma_1.default.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mod: true },
        });
        member.roles.add((await (0, role_1.getGuildModRole)(guild)).id);
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.addMod) && (0, log_1.log)({
            content: `관리자 임명됨 : ${member.user.username}`,
            rawContent: `관리자 임명됨 : ${(0, discord_js_1.userMention)(member.id)}`,
            guild,
            type: 'addMod'
        });
    }
    catch {
        await (0, memberData_1.addMemberData)(member);
        await (0, exports.addMod)(guild, member);
    }
};
exports.addMod = addMod;
const removeMod = async (guild, member) => {
    try {
        const logSetting = await (0, log_1.getGuildLogSetting)(guild.id);
        await (0, memberData_1.addMemberData)(member);
        await prisma_1.default.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mod: false }
        });
        member.roles.remove((await (0, role_1.getGuildModRole)(guild)).id);
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.removeMod) && (0, log_1.log)({
            content: `관리자 해임됨 : ${member.user.username}`,
            rawContent: `관리자 해임됨 : ${(0, discord_js_1.userMention)(member.id)}`,
            guild,
            type: 'removeMod'
        });
    }
    catch {
        await (0, memberData_1.addMemberData)(member);
        (0, exports.removeMod)(guild, member);
    }
};
exports.removeMod = removeMod;
const updateGuildMod = async (guildId, data) => {
    const oldModList = (await prisma_1.default.memberData.findMany({ where: { guildId, mod: true } })).map(b => b.userId);
    const newModList = data.mod.map((b) => b.userId);
    oldModList.forEach(async (id) => {
        if (newModList.includes(id))
            return;
        await prisma_1.default.memberData.updateMany({
            where: { guildId, userId: id, mod: true },
            data: { mod: false }
        });
    });
};
exports.updateGuildMod = updateGuildMod;
