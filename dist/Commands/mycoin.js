"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const coin_1 = require("../utils/coin");
const userData_1 = require("../utils/userData");
const coinEmbed = async (data, point) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':money_mouth: 내 코인')
        .setDescription((0, discord_js_1.bold)(`보유 포인트 : ${point}포인트 / 평가 가치 : ${await data.map(async (c) => {
        const data = await (0, coin_1.getCoinData)(c.coinId);
        if (!data)
            return 0;
        return c.amount * data.price;
    }).reduce(async (a, b) => await a + await b, Promise.resolve(0))}포인트`))
        .addFields(data.length === 0 ?
        [{ name: '보유한 코인이 없습니다', value: '코인을 구매해보세요!' }] :
        data.sort((a, b) => b.amount - a.amount).map(d => ({ name: d.name, value: (0, discord_js_1.blockQuote)(`${d.amount}개`), inline: true })))
        .setFooter({ text: '코인을 구매하려면 /코인구매 명령어를 사용해주세요' });
};
async function coinbuy(interaction) {
    await interaction.deferReply();
    const userCoinData = await (0, coin_1.getUserCoinData)(interaction.user.id);
    const userData = await (0, userData_1.getUserData)(interaction.user.id);
    await interaction.editReply({ embeds: [await coinEmbed(userCoinData, userData.point)] });
}
exports.default = coinbuy;
