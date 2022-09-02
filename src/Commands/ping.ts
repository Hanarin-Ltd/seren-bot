import { CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { BOT_COLOR } from "../lib";
import { getCurrentTime } from "../utils/default";

const message = (latency: number, apiLatency:number, timestamp: string, responce: string) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':ping_pong: 핑 테스트')
        .setDescription(`\n**지연시간 : ${latency}ms ｜ API 지연시간 : ${apiLatency}ms**`)
        .addFields(
            { name: '전송 시각', value: `> ${timestamp}`, inline: true },
            { name: '반응 시각', value: `> ${responce}`, inline: true  },
            { name: '\n기준 시간대', value: '> KST (UTC+09)', inline: true }
        )
        .setFooter({ text: '서버 상태 :  🔵 매우 좋음' })
}

export default async function ping(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply()
    const date = getCurrentTime(interaction.createdAt)
    const responce = getCurrentTime()
    await interaction.editReply({ embeds: [message(Date.now() - interaction.createdTimestamp, Math.round(interaction.client.ws.ping), date, responce)] })
}
