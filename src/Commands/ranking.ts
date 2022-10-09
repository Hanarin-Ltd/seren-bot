import { ChatInputCommandInteraction, EmbedBuilder, userMention } from "discord.js"
import fetch from "node-fetch"
import { BOT_COLOR } from "../lib"
import prisma from "../prisma"
import { deferReply, errorMessage } from "../utils/default"
import { getMemberExp } from "../utils/level"

const rankingEmbed = (option: string, data: { username: string, tag: string, value: number }[]) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(`:trophy: ${option} 랭킹`)
    .setDescription(
        `\n${data.map((d, i: number) => `#${i + 1}  **${d.username}(${d.tag})** : **${option === '레벨' ? 'Lv.' : ''}${d.value}**${option === '포인트' ? '포인트' : ''}`
    ).join('\n')}`)

export default async function ranking(interaction: ChatInputCommandInteraction) {
    await deferReply(interaction)

    const option = interaction.options.getString('종류', true)
     
    try {
        if (option === 'point') {
            const data = await fetch('http://localhost:3000/api/rank/point').then(res => res.json())
            return await interaction.editReply({ embeds: [rankingEmbed('포인트', data.map((d: any) => ({ ...d, value: d.point })))] })
        }
        else if (option === 'level') {
            const data = await prisma.memberData.findMany({ orderBy: { level: 'desc' }, take: 10, where: { guildId: interaction.guildId! } })
            const levelData = data.map(d => ({
                username: d.username,
                tag: d.tag,
                value: d.level
            }))
            return await interaction.editReply({ embeds: [rankingEmbed('레벨', levelData) ]})
        }
    } catch {
        return await interaction.editReply({ embeds: [errorMessage()] })
    }
}
