"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goodbye = exports.welcome = void 0;
const discord_js_1 = require("discord.js");
const lib_1 = require("./lib");
const discord_1 = require("./utils/discord");
const guildOption_1 = require("./utils/guildOption");
const log_1 = require("./utils/log");
const welcome = async (member) => {
    const permission = await (0, guildOption_1.getGuildOption)(member.guild.id);
    const logSetting = await (0, log_1.getGuildLogSetting)(member.guild.id);
    if (!permission)
        return;
    if (!permission.welcomeMessageEnabled)
        return;
    const channel = await (0, discord_1.getChannel)(member.guild, permission.welcomeChannelId);
    if (!channel) {
        console.log(`Error: Can't get the Channel / guildId : ${member.guild.id} / channelId : ${permission.welcomeChannelId}`);
        return;
    }
    if (channel.isTextBased()) {
        channel.send({
            embeds: [{ color: lib_1.BOT_COLOR, title: permission.welcomeMessage
                        .replace('{user}', member.user.username)
                        .replace('{server}', member.guild.name)
                }]
        });
    }
    else {
        console.log(`TypeError: Unpredictable Type / guildId : ${member.guild.id} / channelId : ${permission.welcomeChannelId}`);
        return;
    }
    (logSetting === null || logSetting === void 0 ? void 0 : logSetting.userCreate) && (0, log_1.log)({
        content: `새로운 멤버 : ${member.user.username}`,
        rawContent: `새로운 멤버 : ${(0, discord_js_1.userMention)(member.id)}`,
        guild: member.guild,
        type: 'userCreate'
    });
};
exports.welcome = welcome;
const goodbye = async (member) => {
    const permission = await (0, guildOption_1.getGuildOption)(member.guild.id);
    const logSetting = await (0, log_1.getGuildLogSetting)(member.guild.id);
    if (!permission)
        return;
    if (!permission.goodbyeMessageEnabled)
        return;
    const channel = await (0, discord_1.getChannel)(member.guild, permission.goodbyeChannelId);
    if (!channel) {
        console.log(`Error: Can't get the Channel / guildId : ${member.guild.id} / channelId : ${permission.goodbyeChannelId}`);
        return;
    }
    if (channel.isTextBased()) {
        channel.send({
            embeds: [{ color: lib_1.BOT_COLOR, title: permission.goodbyeMessage
                        .replaceAll('{user}', member.user.username)
                        .replaceAll('{server}', member.guild.name)
                }]
        });
    }
    else {
        console.log(`TypeError: Unpredictable Type / guildId : ${member.guild.id} / channelId : ${permission.goodbyeChannelId}`);
        return;
    }
    (logSetting === null || logSetting === void 0 ? void 0 : logSetting.userDelete) && (0, log_1.log)({
        content: `멤버 나감 : ${member.user.username}`,
        rawContent: `멤버 나감 : ${(0, discord_js_1.userMention)(member.id)}`,
        guild: member.guild,
        type: 'userDelete'
    });
};
exports.goodbye = goodbye;
