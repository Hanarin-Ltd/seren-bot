"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const coin_1 = require("../utils/coin");
const parsePrice = (data) => {
    const lastPrice = data.priceHistory[data.priceHistory.length - 2];
    const isDown = lastPrice > data.price;
    const priceDiff = Math.abs(data.price - lastPrice);
    return `${data.price}포인트 (${isDown ? '▼' : '▲'} ${priceDiff})`;
};
const priceEmbed = (data) => {
    const priceInfo = (0, coin_1.getPriceInfo)(data.priceHistory);
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':coin: 코인 가격')
        .setFields([
        { name: '이름', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(data.name)), inline: true },
        { name: '가격', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(parsePrice(data))), inline: true },
        { name: '변동폭', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(`${priceInfo.diffPercent.toFixed(2)}%`)), inline: true },
    ]);
};
const coinNotFound = () => new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setTitle(':grey_question: **코인을 찾을 수 없습니다**')
    .setDescription('없는 코인이거나 오타가 있을 수 있습니다. 다시 한번 확인해주세요!');
async function coinprice(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const coinName = args.getString('이름');
    const coinData = await (0, coin_1.getCoinDataAsName)(coinName);
    if (!coinData)
        return await interaction.editReply({ embeds: [coinNotFound()] });
    await interaction.editReply({ embeds: [priceEmbed(coinData)] });
}
exports.default = coinprice;
