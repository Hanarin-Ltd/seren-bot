"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLevelUpMessage = exports.checkLevelUp = exports.addMemberLevel = exports.addMemberExp = exports.getMemberExp = exports.getMemberLevel = void 0;
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const prisma_1 = __importDefault(require("../prisma"));
const discord_1 = require("./discord");
const guildOption_1 = require("./guildOption");
const log_1 = require("./log");
const memberData_1 = require("./memberData");
const getMemberLevel = async (member) => {
    const result = await prisma_1.default.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } });
    return result ? result.level : 1;
};
exports.getMemberLevel = getMemberLevel;
const getMemberExp = async (member) => {
    const result = await prisma_1.default.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } });
    return result ? result.exp : 0;
};
exports.getMemberExp = getMemberExp;
const addMemberExp = async (member, exp) => {
    const exist = await prisma_1.default.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } });
    if (!exist)
        await (0, memberData_1.addMemberData)(member);
    return await prisma_1.default.memberData.updateMany({
        where: { guildId: member.guild.id, userId: member.id },
        data: {
            exp: exist ? exist.exp + exp : exp,
        }
    });
};
exports.addMemberExp = addMemberExp;
const addMemberLevel = async (member) => {
    const exist = await prisma_1.default.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } });
    if (!exist)
        await (0, memberData_1.addMemberData)(member);
    return await prisma_1.default.memberData.updateMany({
        where: { guildId: member.guild.id, userId: member.id },
        data: {
            level: exist ? exist.level + 1 : 1
        }
    });
};
exports.addMemberLevel = addMemberLevel;
const checkLevelUp = async (member, channel) => {
    const currentExp = await (0, exports.getMemberExp)(member);
    const currentLevel = await (0, exports.getMemberLevel)(member);
    if (currentExp <= 0)
        return false;
    const afterLevel = currentLevel + 1;
    if (currentExp >= currentLevel * 200) {
        const logSetting = await (0, log_1.getGuildLogSetting)(member.guild.id);
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.levelUp) && (0, log_1.log)({
            content: `레벨업 : ${member.user.username} / ${currentLevel} -> ${afterLevel}`,
            rawContent: `레벨업 : ${(0, discord_js_1.userMention)(member.id)} / ${currentLevel} -> ${afterLevel}`,
            guild: member.guild,
            type: 'levelUp'
        });
        await (0, exports.sendLevelUpMessage)(member, channel, currentLevel, afterLevel);
        await (0, exports.addMemberLevel)(member);
        return true;
    }
    else
        return false;
};
exports.checkLevelUp = checkLevelUp;
const levelUpEmbed = async (member, beforeLevel, afterLevel) => {
    const content = (await (0, guildOption_1.getGuildOption)(member.guild.id));
    const memberData = await (0, memberData_1.getMemberData)(member.id);
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(content.levelUpMessage
        .replaceAll('{user}', memberData.nickname)
        .replaceAll('{server}', member.guild.name)
        .replaceAll('{beforelevel}', beforeLevel.toString())
        .replaceAll('{afterlevel}', afterLevel.toString()));
};
const sendLevelUpMessage = async (member, channel, beforeLevel, afterLevel) => {
    const guildId = member.guild.id;
    const option = (await (0, guildOption_1.getGuildOption)(guildId));
    if (!option.levelUpMessageEnabled)
        return;
    if (option.messageInLevelupChannel) {
        return await channel.send({ embeds: [await levelUpEmbed(member, beforeLevel, afterLevel)] });
    }
    else {
        const channel = (await (0, discord_1.getChannel)(member.guild, option.levelUpChannelId));
        return channel.type === discord_js_1.ChannelType.GuildText && (await channel.send({ embeds: [await levelUpEmbed(member, beforeLevel, afterLevel)] }));
    }
};
exports.sendLevelUpMessage = sendLevelUpMessage;
