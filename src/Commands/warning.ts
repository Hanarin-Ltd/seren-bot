import { ChatInputCommandInteraction, GuildMember } from "discord.js"
import { completeSuccessfullyMessage } from "../utils/default"
import { getThisGuild } from "../utils/discord"
import { giveWarning, removeWarning } from "../utils/warning"

export default async function warning(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const targetMember = args.getMember('멤버')! as GuildMember
    const option = args.getString('설정', true)
    const warningAmount = args.getNumber('갯수')
    const thisGuild = await getThisGuild(interaction)

    if (option === 'add') {
        await giveWarning(thisGuild.id, targetMember, warningAmount ? warningAmount : 1)
    } else if (option === 'remove') {
        await removeWarning(thisGuild.id, targetMember, warningAmount ? warningAmount : 1)
    }

    await  interaction.editReply({ embeds: [completeSuccessfullyMessage(interaction.user)] })
}
