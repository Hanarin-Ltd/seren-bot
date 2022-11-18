import { ChatInputCommandInteraction, EmbedBuilder, Guild } from "discord.js"
import { BOT_COLOR, env } from "../lib"

const dashboardEmbed = (guild: Guild) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(`:tools:  ${guild.name} 대시보드`)
    .setDescription(`대시보드를 통해 봇의 설정을 변경할 수 있습니다.`)
    .addFields(
        { name: '링크', value: `> ${env.SITE}/dashboard/${guild.id}` }
    )
    .setURL(`${env.SITE}/dashboard/${guild.id}`)
    .setTimestamp()

export default async function dashboard(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return
    const guild = interaction.guild

    interaction.editReply({ embeds: [dashboardEmbed(guild)] })
}
