"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const role_1 = require("../utils/role");
async function role(interaction) {
    var _a, _b;
    await interaction.deferReply();
    if (!await (0, discord_1.isGuildModerator)(interaction.guild, interaction.member))
        return interaction.editReply({ embeds: [(0, default_1.noPermissionMessage)()] });
    const args = interaction.options;
    const setting = args.getString('설정');
    const role = args.getRole('역할');
    const target = args.getMember('멤버');
    const thisGuild = interaction.guild;
    try {
        if (setting === 'add') {
            if (role.name === ((_a = (await (0, role_1.getGuildModRole)(thisGuild))) === null || _a === void 0 ? void 0 : _a.name))
                return interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':x: 관리자 역할은 추가할 수 없습니다.', description: '/관리자 명령어를 써주세요.' }] });
            if (target.roles.cache.has(role.id))
                return interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 이미 부여된 역할입니다.' }] });
            await target.roles.add(role);
        }
        else if (setting === 'remove') {
            if (role.name === ((_b = (await (0, role_1.getGuildModRole)(thisGuild))) === null || _b === void 0 ? void 0 : _b.name))
                return interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':x: 관리자 역할은 제거할 수 없습니다.', description: '/관리자 명령어를 써주세요.' }] });
            if (!target.roles.cache.has(role.id))
                return interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 부여되지 않은 역할입니다.' }] });
            await target.roles.remove(role);
        }
        await interaction.editReply({ embeds: [(0, default_1.completeSuccessfullyMessage)()] });
    }
    catch (e) {
        await interaction.editReply({ embeds: [{
                    color: lib_1.BOT_COLOR,
                    title: ':no_entry_sign: 오류가 발생했습니다!',
                    description: '역할과 관련된 권한 오류가 발생했습니다. Seren의 역할을 맨위에  위치시켜 주세요. (관리자보다 높아야 됩니다)'
                }] });
    }
}
exports.default = role;
