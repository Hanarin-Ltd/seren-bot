import { ChatInputCommandInteraction } from "discord.js"

export default async function coinbuy(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const args = interaction.options
    const coinId = parseInt(args.getString('이름')!)
    const amount = args.getInteger('수량')!
}
