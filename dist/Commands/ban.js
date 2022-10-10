"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.someoneHasUnban = exports.someoneHasBan = void 0;
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const ban_1 = require("../utils/ban");
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const guildOption_1 = require("../utils/guildOption");
const someoneHasBan = (name, reason) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(`:no_entry: ${name}이(가) 차단되었습니다.`)
        .setDescription(`사유: ${reason ? reason : '공개하지 않음'}`)
        .setTimestamp();
};
exports.someoneHasBan = someoneHasBan;
const someoneHasUnban = (name, reason) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(`:white_check_mark: ${name}이(가) 차단 해제되었습니다.`)
        .setDescription(`사유: ${reason ? reason : '공개하지 않음'}`)
        .setTimestamp();
};
exports.someoneHasUnban = someoneHasUnban;
async function ban(interaction) {
    const args = interaction.options;
    const thisGuild = await (0, discord_1.getThisGuild)(interaction);
    const setting = args.getString('설정');
    const targetUser = await (0, discord_1.getUser)(interaction, args.getString('아이디'));
    const targetMember = await (0, discord_1.getMember)(thisGuild, args.getString('아이디'));
    const reason = args.getString('사유');
    const permission = await (0, guildOption_1.getGuildOption)(thisGuild.id);
    await interaction.deferReply();
    if (!await (0, discord_1.isGuildModerator)(thisGuild, interaction.member)) {
        return await interaction.editReply({ embeds: [(0, default_1.noPermissionMessage)()] });
    }
    if (!targetUser) {
        return await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':warning: ID가 유효하지 않습니다!' }] });
    }
    if (!permission) {
        return await interaction.editReply({ embeds: [(0, default_1.errorMessage)()] });
    }
    const channel = await (0, discord_1.getChannel)(thisGuild, setting === 'add' ? permission.banChannelId : permission.unbanChannelId);
    if (setting === 'add') {
        if (!targetMember) {
            return await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':warning: ID가 유효하지 않습니다!' }] });
        }
        if (await (0, discord_1.isGuildModerator)(thisGuild, targetMember)) {
            return await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry: 관리자는 차단할 수 없습니다.' }] });
        }
        if (thisGuild.bans.cache.has(targetUser.id)) {
            return await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':x: 이미 차단된 사용자입니다!' }] });
        }
        await thisGuild.bans.create(targetMember, { reason: reason ? reason : '공개하지 않음' });
        await (0, ban_1.addBan)(thisGuild.id, targetMember, reason);
        await interaction.editReply({ embeds: [(0, default_1.completeSuccessfullyMessage)()] });
    }
    else if (setting === 'remove') {
        try {
            await (0, discord_1.updateMemberCache)(thisGuild);
            await thisGuild.members.unban(targetUser.id, reason ? reason : '공개하지 않음');
            await (0, ban_1.removeBan)(thisGuild.id, targetUser.id);
            await interaction.editReply({ embeds: [(0, default_1.completeSuccessfullyMessage)()] });
        }
        catch (e) {
            console.log(e);
            return await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':x: 차단되지 않은 사용자입니다!' }] });
        }
    }
}
exports.default = ban;
