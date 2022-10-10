"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commands_1 = __importDefault(require("../commands"));
const lib_1 = require("../lib");
const discord_1 = require("../utils/discord");
const helpMessage = () => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':scroll: 도움말')
        .addFields((0, commands_1.default)().filter(cmd => !cmd.dm_permission).map(command => {
        if (!command.dm_permission) { }
        return { name: `- **${command.name}**`, value: command.description };
    }));
};
async function help(interaction) {
    await (0, discord_1.updateMemberCache)(interaction.guild);
    await interaction.deferReply();
    try {
        await (0, discord_1.sendDM)(interaction, { embeds: [helpMessage()] });
        await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':incoming_envelope: DM으로 도움말이 전송되었습니다!', description: 'DM을 확인해주세요.' }] });
    }
    catch {
        await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: DM을 전송할 수 없습니다!' }] });
    }
}
exports.default = help;
