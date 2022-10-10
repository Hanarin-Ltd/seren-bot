"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyGuildChannel = exports.removeGuildChannel = exports.addGuildChannel = exports.addAllGuildChannel = exports.getGuildChannel = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const discord_1 = require("./discord");
const getGuildChannel = async (guild) => {
    const result = await prisma_1.default.guildChannel.findFirst({ where: { guildId: guild.id } });
    return result ? result : {};
};
exports.getGuildChannel = getGuildChannel;
const addAllGuildChannel = async (guild) => {
    await (0, discord_1.updateChannelCache)(guild);
    await prisma_1.default.guildChannel.deleteMany({ where: { guildId: guild.id } });
    guild.channels.cache.forEach(async (c) => {
        await (0, exports.addGuildChannel)(c);
    });
};
exports.addAllGuildChannel = addAllGuildChannel;
const addGuildChannel = async (channel) => {
    return await prisma_1.default.guildChannel.create({ data: {
            guildId: channel.guildId,
            channelId: channel.id,
            channelName: channel.name,
            channelType: channel.type
        } });
};
exports.addGuildChannel = addGuildChannel;
const removeGuildChannel = async (channel) => {
    return await prisma_1.default.guildChannel.deleteMany({ where: { guildId: channel.guildId, channelId: channel.id } });
};
exports.removeGuildChannel = removeGuildChannel;
const modifyGuildChannel = async (oldCh, newCh) => {
    return await prisma_1.default.guildChannel.updateMany({
        where: { guildId: oldCh.guildId, channelId: oldCh.id },
        data: {
            channelId: newCh.id,
            channelName: newCh.name,
            channelType: newCh.type
        }
    });
};
exports.modifyGuildChannel = modifyGuildChannel;
