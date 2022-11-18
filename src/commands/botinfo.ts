import { EmbedBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { client } from ".."
import { BOT_COLOR, env } from "../lib"
import * as DiscordJS from "discord.js"

const getUptime = () => {
    const uptime = process.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor(uptime / 3600) % 24
    const minutes = Math.floor(uptime / 60) % 60
    const seconds = Math.floor(uptime) % 60

    return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`
}

const botInfoEmbed = () => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':clipboard: Seren 정보')
        .setDescription(`**Serendipity, Seren | 편하고 즐거운 디스코드 서버를 위한 봇**`)
        .addFields(
            { name: '버전', value: `> ${env.VERSION}/${env.BUILD_DATE}`, inline: true },
            { name: '사용 통계', value: `> ${client.guilds.cache.size}개의 서버 / ${client.users.cache.size}명의 사용자`, inline: true },
            { name: 'Seren Community', value: `> [커뮤니티 참여하기](https://discord.gg/NwUgqS4vmC)`, inline: true },
            { name: '기타', value: `> Github : [Seren DevTeam](https://github.com/Seren-DevTeam)\n> DIscordJS 버전 : ${DiscordJS.version}\n> 업타임 : ${getUptime()}` }
        )
        .setFooter({ text: 'Developed by Seren DevTeam / Netpy.kr' })
}

export default async function botinfo(interaction: ChatInputCommandInteraction) {
    return interaction.editReply({ embeds: [botInfoEmbed()] })
}
