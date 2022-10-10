"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const log_1 = require("../utils/log");
const setToOff = async (type, logSetting, guildId) => {
    const data = logSetting[type];
    if (!data)
        return false;
    logSetting[type] = false;
    await (0, log_1.modifyGuildLogSetting)(guildId, logSetting);
    return true;
};
const setToOn = async (type, logSetting, guildId) => {
    const data = logSetting[type];
    if (data)
        return false;
    logSetting[type] = true;
    await (0, log_1.modifyGuildLogSetting)(guildId, logSetting);
    return true;
};
const sameValue = (on) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(`:warning: 이미 ${on ? '활성화' : '비활성화'}된 로그 종류입니다.`);
};
async function log(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const thisGuild = await (0, discord_1.getThisGuild)(interaction);
    const guildId = thisGuild.id;
    const setting = args.getString('설정');
    const type = args.getString('종류');
    const logSetting = (await (0, log_1.getGuildLogSetting)(guildId));
    let result = true;
    if (setting === 'on') {
        if (type !== 'all')
            result = await setToOn(type, logSetting, guildId);
        else
            result = true;
    }
    else {
        if (type !== 'all')
            result = await setToOff(type, logSetting, guildId);
        else
            result = true;
    }
    return result ?
        await interaction.editReply({ embeds: [(0, default_1.completeSuccessfullyMessage)()] }) :
        await interaction.editReply({ embeds: [sameValue(setting === 'on')] });
}
exports.default = log;
