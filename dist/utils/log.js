"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.modifyGuildLogSetting = exports.addGuildLogSetting = exports.getGuildLogSetting = void 0;
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const prisma_1 = __importDefault(require("../prisma"));
const default_1 = require("./default");
const discord_1 = require("./discord");
const guildOption_1 = require("./guildOption");
const getGuildLogSetting = async (guildId) => {
    return await prisma_1.default.guildLogSetting.findUnique({ where: { guildId } });
};
exports.getGuildLogSetting = getGuildLogSetting;
const addGuildLogSetting = async (guildId) => {
    return await prisma_1.default.guildLogSetting.create({ data: { guildId } });
};
exports.addGuildLogSetting = addGuildLogSetting;
const modifyGuildLogSetting = async (guildId, data) => {
    return await prisma_1.default.guildLogSetting.upsert({
        where: { guildId },
        update: data,
        create: { guildId }
    });
};
exports.modifyGuildLogSetting = modifyGuildLogSetting;
const logEmbed = (content, now) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':pencil: 로그')
        .setDescription(content)
        .setFooter({ text: `${(0, default_1.getCurrentDate)(now)} ${(0, default_1.getCurrentTime)(now)}` });
};
const log = async ({ content, rawContent, guild, type }) => {
    const option = (await (0, guildOption_1.getGuildOption)(guild.id));
    const logChannel = (await (0, discord_1.getChannel)(guild, option.logChannelId));
    const createdAt = new Date();
    if (logChannel.isTextBased())
        logChannel.send({ embeds: [logEmbed(rawContent, createdAt)] });
    return await prisma_1.default.guildLog.create({
        data: {
            guildId: guild.id,
            content,
            type,
            rawContent,
            createdAt
        }
    });
};
exports.log = log;
