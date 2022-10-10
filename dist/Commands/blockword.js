"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanMessage = void 0;
const discord_js_1 = require("discord.js");
const string_similarity_1 = require("string-similarity");
const lib_1 = require("../lib");
const blockWord_1 = require("../utils/blockWord");
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const guildData_1 = require("../utils/guildData");
const guildOption_1 = require("../utils/guildOption");
const log_1 = require("../utils/log");
const warning_1 = require("../utils/warning");
async function blockword(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const thisGuild = await (0, discord_1.getThisGuild)(interaction);
    const guildId = thisGuild.id;
    const word = args.getString('금지어');
    await (0, discord_1.updateMemberCache)(thisGuild);
    if (!await (0, discord_1.isGuildModerator)(thisGuild, interaction.member)) {
        await interaction.editReply({ embeds: [(0, default_1.noPermissionMessage)()] });
        return;
    }
    if (args.getString('설정') === 'add') {
        if (await (0, blockWord_1.checkIsBlockword)(guildId, word)) {
            await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 이미 등록된 금지어입니다.' }] });
            return;
        }
        await (0, blockWord_1.addBlockword)(thisGuild, word);
    }
    else if (args.getString('설정') === 'remove') {
        if (!await (0, blockWord_1.checkIsBlockword)(guildId, word)) {
            await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':no_entry_sign: 등록된 금지어가 아닙니다.' }] });
            return;
        }
        await (0, blockWord_1.removeBlockword)(thisGuild, word);
    }
    await interaction.editReply({ embeds: [{ color: lib_1.BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }] });
}
exports.default = blockword;
const youUsedBlockword = (word) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':no_entry: 금지어를 사용하셨습니다.')
        .setDescription('경고가 추가됐습니다. 경고 10번시 서버에서 차단됩니다.')
        .addFields({ name: '사용한 금지어', 'value': word.join(', ') });
};
const scanMessage = async (message) => {
    if (!lib_1.FILTERING_MESSAGE_TYPE.includes(message.type))
        return;
    if (message.content.length < 1)
        return;
    if (!message.channelId || !message.guildId)
        return;
    const option = (await (0, guildOption_1.getGuildOption)(message.guildId));
    if (!option.checkModsMessage) {
        if (await (0, discord_1.isGuildModerator)(message.guild, message.author))
            return;
    }
    const data = await (0, guildData_1.getGuildData)(message.guildId);
    if (!data)
        return;
    const thisGuild = message.guild;
    const guildId = thisGuild.id;
    const blockwordList = await (0, blockWord_1.getBlockwordList)(guildId);
    const catchedWordList = [];
    const logSetting = await (0, log_1.getGuildLogSetting)(guildId);
    blockwordList.forEach(blockword => {
        if (message.content.toLowerCase().includes(blockword.toLowerCase())) {
            catchedWordList.push(blockword);
            return;
        }
        message.content.toLowerCase().split(' ').forEach(word => {
            if ((0, string_similarity_1.compareTwoStrings)(word, blockword) > 0.8) {
                catchedWordList.push(blockword);
                return;
            }
        });
    });
    if (catchedWordList.length > 0) {
        await message.delete();
        await message.author.send({ embeds: [youUsedBlockword(catchedWordList)] });
        await (0, warning_1.giveWarning)(guildId, message.member);
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.useBlockword) && await (0, log_1.log)({
            content: `금지어 사용 멤버 : ${message.member.user.username} / 사용 금지어 : ${catchedWordList.join(', ')}`,
            rawContent: `금지어 사용 멤버 : ${(0, discord_js_1.userMention)(message.member.id)} / 사용 금지어 : ${catchedWordList.join(', ')}`,
            guild: thisGuild,
            type: 'useBlockword'
        });
    }
};
exports.scanMessage = scanMessage;
