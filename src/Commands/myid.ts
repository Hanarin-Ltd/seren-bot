import { ChatInputCommandInteraction } from "discord.js"
import { BOT_COLOR } from "../lib"

export default async function myId(interaction: ChatInputCommandInteraction) {
    await interaction.editReply({ embeds: [{
        color: BOT_COLOR,
        title: ':information_source: 나의 ID',
        description: `**${interaction.user.id}**`,
        footer: { text: 'ID는 노출되어도 괜찮습니다.' }
    }] })
}
