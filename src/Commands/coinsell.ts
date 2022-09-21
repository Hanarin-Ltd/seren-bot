import { ChatInputCommandInteraction } from "discord.js"

export default async function coinbuy(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    await interaction.editReply('Not yet implemented')
}
