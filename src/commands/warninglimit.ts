import { ChatInputCommandInteraction } from "discord.js"
import { completeSuccessfullyMessage } from "../utils/default"
import { setWarningLimit } from "../utils/warning"

export default async function warningLimit(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const count = args.getNumber('갯수', true)

    await setWarningLimit(interaction.guild!.id, count)
    return await interaction.editReply({ embeds: [completeSuccessfullyMessage(interaction.user, `${count}개로 설정되었습니다.`)] })
}
