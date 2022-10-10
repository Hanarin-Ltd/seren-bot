"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("..");
const lib_1 = require("../lib");
const coin_1 = require("../utils/coin");
const youJoined = (data) => new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setURL(`${__1.env.SITE}/coin`)
    .setTitle(':coin: 이미 코인게임에 참가하셨습니다!')
    .setDescription((0, discord_js_1.bold)('Seren이 있는 모든 서버, DM채널, 심지어 웹에서도 코인게임을 즐기실 수 있습니다!'))
    .setFields([
    { name: '현재 가격', value: (0, discord_js_1.codeBlock)('diff', data.map(d => {
            if (d.priceDiff > 0)
                return `+ ${d.name}: ${d.price} (+${d.priceDiff})`;
            else if (d.priceDiff < 0)
                return `- ${d.name}: ${d.price} (${d.priceDiff})`;
            else
                return `= ${d.name}: ${d.price}`;
        }).join('\n')) }
]);
async function coin(interaction) {
    await interaction.deferReply();
    const coinList = await (0, coin_1.getCoinList)();
    const coinDataList = coinList.map(c => {
        const priceInfo = (0, coin_1.getPriceInfo)(c.priceHistory);
        return {
            name: c.name,
            price: c.price,
            priceDiff: priceInfo.priceDiff,
            diffPercent: priceInfo.diffPercent,
        };
    }).sort((a, b) => b.price - a.price);
    await interaction.editReply({ embeds: [youJoined(coinDataList)] });
}
exports.default = coin;
