"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const coin_1 = require("../utils/coin");
const default_1 = require("../utils/default");
const userData_1 = require("../utils/userData");
const notEnoughPoint = (point, needPoint) => (new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setDescription(`:x: **포인트가 부족합니다.**`)
    .addFields([
    { name: '보유 포인트', value: `${point}`, inline: true },
    { name: '필요 포인트', value: `${needPoint}`, inline: true },
    { name: '차이', value: `${needPoint - point}`, inline: true },
]));
const youBoughtCoin = (name, amount, price, point, now) => (new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setDescription(`:white_check_mark: **성공적으로 거래되었습니다!**`)
    .addFields([
    { name: '코인 이름', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(name)), inline: true },
    { name: '코인 가격', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(price.toString())), inline: true }
])
    .addFields([
    { name: '거래 개수', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(amount.toString())), inline: true },
    { name: '총 가격', value: (0, discord_js_1.blockQuote)(`${price * amount}`), inline: true },
    { name: '현재 포인트', value: (0, discord_js_1.blockQuote)(point.toString()), inline: true }
])
    .setFooter({ text: `거래 시각: ${(0, default_1.getCurrentDate)(now)} ${(0, default_1.getCurrentTime)(now)}` }));
async function coinbuy(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const coinName = args.getString('이름');
    const amount = args.getInteger('수량');
    const coinData = (await (0, coin_1.getCoinDataAsName)(coinName));
    const userCoinData = (await (0, coin_1.getUserCoinData)(interaction.user.id)).find(coin => coin.name === coinName);
    const coinPrice = coinData.price;
    const point = (await (0, userData_1.getUserData)(interaction.user.id)).point;
    if (point < coinPrice * amount) {
        return await interaction.editReply({ embeds: [notEnoughPoint(point, coinPrice * amount)] });
    }
    try {
        await (0, userData_1.removeUserPoint)(interaction.user.id, coinPrice * amount);
        await (0, coin_1.addUserCoin)(interaction.user.id, coinData.id, amount, new Date());
        coin_1.userCoinIo.emit('update', {
            amount: userCoinData ? userCoinData.amount + amount : amount,
            point: point - coinPrice * amount,
            coinId: coinData.id,
        });
        await interaction.editReply({ embeds: [youBoughtCoin(coinData.name, amount, coinPrice, point - coinPrice * amount, new Date())] });
    }
    catch {
        await interaction.editReply({ embeds: [coin_1.errorOccurredWhileTrading] });
    }
}
exports.default = coinbuy;
