"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _1 = require(".");
const lib_1 = require("./lib");
const blockWord_1 = require("./utils/blockWord");
const channel_1 = require("./utils/channel");
const discord_1 = require("./utils/discord");
const guildData_1 = require("./utils/guildData");
const guildOption_1 = require("./utils/guildOption");
const log_1 = require("./utils/log");
const permission_1 = require("./utils/permission");
const role_1 = require("./utils/role");
const thanksForUsing = (guildId) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':wave: Seren을 선택해주셔서 감사합니다!')
        .setURL(`${_1.env.SITE}/dashboard/${guildId}`)
        .setDescription('**사용해주셔서 감사합니다!**\nSeren을 사용하기전 기본적인 설정이 필요합니다. 링크로 들어가 로그인 한뒤 설정을 해주세요.\n이 설정은 웹 대시보드에서 변경할 수 있습니다.');
};
async function guildSetting(guild) {
    const guildId = guild.id;
    await (0, guildData_1.addOrUpdateGuildData)(guild);
    await (0, guildOption_1.setDefaultGuildOption)(guildId);
    await (0, permission_1.setDefaultGuildPermission)(guildId);
    await (0, blockWord_1.setDefaultBlockword)(guildId);
    await (0, channel_1.addAllGuildChannel)(guild);
    await (0, role_1.addAllGuildRole)(guild);
    await (0, log_1.addGuildLogSetting)(guild.id);
    await (await (0, discord_1.getGuildOwner)(guild)).send({ embeds: [thanksForUsing(guildId)] });
}
exports.default = guildSetting;
