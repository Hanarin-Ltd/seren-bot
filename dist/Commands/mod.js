"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const mod_1 = require("../utils/mod");
async function mod(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const thisGuild = await (0, discord_1.getThisGuild)(interaction);
    const target = args.getMember('멤버');
    await (0, discord_1.updateMemberCache)(thisGuild);
    if (!await (0, discord_1.isGuildOwner)(thisGuild, interaction.member)) {
        await interaction.editReply({ embeds: [(0, default_1.noPermissionMessage)()] });
        return;
    }
    if (args.getString('설정') === 'add') {
        if (await (0, discord_1.isGuildModerator)(thisGuild, target)) {
            await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 이미 등록된 멤버입니다.' }] });
            return;
        }
        await (0, mod_1.addMod)(thisGuild, target);
    }
    else if (args.getString('설정') === 'remove') {
        if (!await (0, discord_1.isGuildModerator)(thisGuild, target)) {
            await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 등록된 멤버가 아닙니다.' }] });
            return;
        }
        if (await (0, discord_1.isGuildOwner)(thisGuild, target)) {
            await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 서버 소유자는 항상 관리자입니다' }] });
            return;
        }
        await (0, mod_1.removeMod)(thisGuild, target);
    }
    await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }] });
}
exports.default = mod;
