"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const coin_1 = require("../utils/coin");
const default_1 = require("../utils/default");
const youCommentedCoin = (name, content) => new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setTitle(':white_check_mark: 성공적으로 댓글을 달았습니다!')
    .setFields([
    { name: '코인 이름', value: (0, discord_js_1.blockQuote)(name) },
    { name: '댓글 내용', value: (0, discord_js_1.blockQuote)(content) }
]);
const coinNotFound = (name) => new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setTitle(':grey_question: 코인을 찾을 수 없습니다!')
    .setDescription(`\`${name}\`라는 이름의 코인을 찾을 수 없습니다. 오타를 확인해주세요.`);
async function coincomment(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const coinName = args.getString('이름');
    const content = args.getString('댓글');
    const coinData = (await (0, coin_1.getCoinDataAsName)(coinName));
    try {
        const result = await (0, coin_1.addCoinComment)(coinData.id, interaction.user.id, content);
        if (result.error)
            return await interaction.editReply({ embeds: [(0, default_1.errorMessage)(result.error)] });
        if (result)
            return await interaction.editReply({ embeds: [youCommentedCoin(coinName, content)] });
        else
            return await interaction.editReply({ embeds: [coinNotFound(coinName)] });
    }
    catch (e) {
        console.log(e);
        await interaction.editReply({ embeds: [(0, default_1.errorMessage)()] });
    }
}
exports.default = coincomment;
