"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lib_1 = require("../lib");
const default_1 = require("../utils/default");
const message = (latency, apiLatency, timestamp, responce) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':ping_pong: 핑 테스트')
        .setDescription(`\n**지연시간 : ${latency}ms ｜ API 지연시간 : ${apiLatency}ms**`)
        .addFields({ name: '전송 시각', value: `> ${timestamp}`, inline: true }, { name: '반응 시각', value: `> ${responce}`, inline: true }, { name: '\n기준 시간대', value: '> KST (UTC+09)', inline: true })
        .setFooter({ text: '서버 상태 :  🔵 매우 좋음' });
};
async function ping(interaction) {
    await interaction.deferReply();
    const date = (0, default_1.getCurrentTime)(interaction.createdAt);
    const responce = (0, default_1.getCurrentTime)();
    await interaction.editReply({ embeds: [message(Date.now() - interaction.createdTimestamp, Math.round(interaction.client.ws.ping), date, responce)] });
}
exports.default = ping;
