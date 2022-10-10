"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const coin_1 = require("../utils/coin");
const default_1 = require("../utils/default");
const userData_1 = require("../utils/userData");
const youSelledCoin = (name, amount, price, point, now) => (new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setDescription(`:white_check_mark: **성공적으로 거래되었습니다!**`)
    .addFields([
    { name: '코인 이름', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(name)), inline: true },
    { name: '코인 가격', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(price.toString())), inline: true }
])
    .addFields([
    { name: '거래 개수', value: (0, discord_js_1.blockQuote)((0, discord_js_1.bold)(amount.toString())), inline: true },
    { name: '총 수익', value: (0, discord_js_1.blockQuote)(`${price * amount}`), inline: true },
    { name: '현재 포인트', value: (0, discord_js_1.blockQuote)(point.toString()), inline: true }
])
    .setFooter({ text: `거래 시각: ${(0, default_1.getCurrentDate)(now)} ${(0, default_1.getCurrentTime)(now)}` }));
async function coinbuy(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const coinName = args.getString('이름');
    const amount = args.getInteger('수량');
    const userData = await (0, userData_1.getUserData)(interaction.user.id);
    const userCoinData = (await (0, coin_1.getUserCoinData)(interaction.user.id)).find(coin => coin.name === coinName);
    const coinData = (await (0, coin_1.getCoinDataAsName)(coinName));
    const point = userData.point;
    try {
        if (userCoinData.amount <= amount) {
            await (0, coin_1.removeUserCoin)(interaction.user.id, coinData.id, userCoinData.amount);
            await (0, userData_1.addUserPoint)(interaction.user.id, coinData.price * userCoinData.amount);
            coin_1.userCoinIo.emit('update', {
                amount: 0,
                point: point + coinData.price * userCoinData.amount,
                coinId: coinData.id,
            });
            return await interaction.editReply({ embeds: [youSelledCoin(coinData.name, userCoinData.amount, coinData.price, point, new Date())] });
        }
        else if (userCoinData.amount > amount) {
            await (0, coin_1.removeUserCoin)(interaction.user.id, coinData.id, amount);
            await (0, userData_1.addUserPoint)(interaction.user.id, coinData.price * amount);
        }
        coin_1.userCoinIo.emit('update', {
            amount: userCoinData.amount - amount,
            point: point + coinData.price * amount,
            coinId: coinData.id,
        });
        return await interaction.editReply({ embeds: [youSelledCoin(coinData.name, amount, coinData.price, point, new Date())] });
    }
    catch {
        return await interaction.editReply({ embeds: [coin_1.errorOccurredWhileTrading] });
    }
}
exports.default = coinbuy;
