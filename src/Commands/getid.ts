import { ChatInputCommandInteraction } from "discord.js"
import { BOT_COLOR } from "../lib"
import { deferReply, completeSuccessfullyMessage } from "../utils/default"

export default async function getId(interaction: ChatInputCommandInteraction) {
    await deferReply(interaction)

    const args = interaction.options
    const target = args.getUser('유저', true)

    await interaction.editReply({ embeds: [{
        color: BOT_COLOR,
        title: `:information_source: ${target.tag}의 ID`,
        description: `**${target.id}**`,
        footer: { text: 'ID는 노출되어도 괜찮습니다.' }
    }] })
}
