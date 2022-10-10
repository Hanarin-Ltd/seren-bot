"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const ban_1 = require("../utils/ban");
const blockWord_1 = require("../utils/blockWord");
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const mod_1 = require("../utils/mod");
const warning_1 = require("../utils/warning");
async function list(interaction) {
    await interaction.deferReply();
    await (0, discord_1.updateMemberCache)(interaction.guild);
    const args = interaction.options;
    const thisGuild = await (0, discord_1.getThisGuild)(interaction);
    const content = args.getString('내용');
    let dataList = [];
    let dataListString = '';
    let dataName = '';
    let isDM = true;
    let isModOnly = false;
    if (content === 'mod') {
        dataName = '관리자';
        dataList = await (0, mod_1.getModList)(thisGuild.id);
        dataListString = dataList.map(mod => {
            return (0, discord_js_1.userMention)(mod.userId);
        }).join('\n-----\n');
        isDM = false;
    }
    else if (content === 'blockword') {
        dataList = await (0, blockWord_1.getBlockwordList)(thisGuild.id);
        if (dataList.length === 0) {
            dataListString = ':no_entry_sign: 금지어가 없습니다.';
        }
        else {
            dataListString = dataList.map(word => {
                return (0, discord_js_1.bold)(word);
            }).join('\n-----\n');
        }
    }
    else if (content === 'warning') {
        dataName = '경고';
        const data = await (0, warning_1.getWarningList)(thisGuild.id);
        if (data.length === 0) {
            dataListString = ':no_entry_sign: 경고를 받은 사용자가 없습니다';
        }
        else {
            dataListString = data.map(m => (`**${m.username} (${m.tag}) : ${m.warning}번**`)).join('\n');
        }
    }
    else if (content === 'ban') {
        dataName = '차단';
        const data = await (0, ban_1.getBanListFromSQL)(thisGuild.id);
        if (data.length === 0) {
            dataListString = ':no_entry_sign: 차단당한 사용자가 없습니다';
        }
        else {
            dataListString = data.map(m => (`**${m.username} (${m.tag}) : ${(0, default_1.getCurrentDate)(m.createdAt)}**`)).join('\n');
        }
        isDM = true;
    }
    if (isModOnly && !(0, discord_1.isGuildModerator)(thisGuild, interaction.member)) {
        return await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 권한이 없습니다!' }] });
    }
    if (!isDM)
        return await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: `:scroll: ${dataName} 목록`, description: dataListString }] });
    try {
        await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':incoming_envelope: DM으로 리스트가 전송되었습니다!', description: 'DM을 확인해주세요.' }] });
        await (0, discord_1.sendDM)(interaction, { embeds: [{ color: lib_1.BOT_COLOR, title: `:scroll: ${dataName} 목록`, description: dataListString }] });
    }
    catch {
        await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: DM을 전송할 수 없습니다!' }] });
    }
}
exports.default = list;
