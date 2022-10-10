"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoleToMod = exports.modifyGuildRole = exports.removeGuildRole = exports.getGuildRole = exports.getGuildModRole = exports.addGuildRole = exports.addAllGuildRole = void 0;
const discord_js_1 = require("discord.js");
const prisma_1 = __importDefault(require("../prisma"));
const discord_1 = require("./discord");
const addAllGuildRole = async (guild) => {
    await (0, discord_1.updateRoleCache)(guild);
    await prisma_1.default.guildRole.deleteMany({ where: { guildId: guild.id } });
    guild.roles.cache.forEach(async (r) => {
        await (0, exports.addGuildRole)(r);
    });
};
exports.addAllGuildRole = addAllGuildRole;
const addGuildRole = async (role) => {
    if (role.name === '@everyone')
        return;
    return await prisma_1.default.guildRole.createMany({ data: {
            id: role.id,
            name: role.name,
            guildId: role.guild.id,
            type: 'any'
        }, skipDuplicates: true });
};
exports.addGuildRole = addGuildRole;
const getGuildModRole = async (guild) => {
    return (await prisma_1.default.guildRole.findFirst({ where: { guildId: guild.id, type: 'mod' } }));
};
exports.getGuildModRole = getGuildModRole;
const getGuildRole = async (guild, roleId) => {
    return await prisma_1.default.guildRole.findFirst({ where: { guildId: guild.id, id: roleId } });
};
exports.getGuildRole = getGuildRole;
const removeGuildRole = async (role) => {
    return await prisma_1.default.guildRole.deleteMany({ where: { guildId: role.guild.id, id: role.id } });
};
exports.removeGuildRole = removeGuildRole;
const modifyGuildRole = async (oldRole, newRole) => {
    return await prisma_1.default.guildRole.updateMany({
        where: { guildId: oldRole.guild.id, id: oldRole.id },
        data: {
            name: newRole.name,
            guildId: newRole.guild.id,
        }
    });
};
exports.modifyGuildRole = modifyGuildRole;
const setRoleToMod = async (role) => {
    role.setPermissions(discord_js_1.PermissionFlagsBits.Administrator);
    return await prisma_1.default.guildRole.update({
        where: { id: role.id },
        data: { type: 'mod' }
    });
};
exports.setRoleToMod = setRoleToMod;
