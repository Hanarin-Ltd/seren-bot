import { CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import getCommands from "../commands"
import { BOT_COLOR } from "../lib"
import { updateMemberCache, sendDM } from "../utils/discord"

const helpMessage = () => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':scroll: 도움말')
        .addFields(
            getCommands().filter(cmd => !cmd.dm_permission).map(command => {
                if (!command.dm_permission) {  }
                return { name: `- **${command.name}**`, value: command.description }
            })
        )
}

export default async function help(interaction: ChatInputCommandInteraction<CacheType>) {
    await updateMemberCache(interaction.guild!)

    await interaction.deferReply()

    try {
        await sendDM(interaction, { embeds: [helpMessage()] })
        await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':incoming_envelope: DM으로 도움말이 전송되었습니다!', description: 'DM을 확인해주세요.' }] })
    } catch {
        await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: DM을 전송할 수 없습니다!' }] })
    }
}
