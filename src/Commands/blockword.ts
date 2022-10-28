import { ChatInputCommandInteraction, CacheType, GuildMember } from "discord.js"
import { BOT_COLOR } from "../lib"
import { checkIsBlockword, addBlockword, removeBlockword } from "../utils/blockword"
import { deferReply, noPermissionMessage } from "../utils/default"
import { getThisGuild, updateMemberCache, isGuildModerator } from "../utils/discord"

export default async function blockword(interaction: ChatInputCommandInteraction<CacheType>) {
    await deferReply(interaction)
    
    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const guildId = thisGuild.id
    const word = args.getString('금지어')!

    await updateMemberCache(thisGuild)

    if (!await isGuildModerator(thisGuild, interaction.member! as GuildMember)) {
        await interaction.editReply({ embeds: [noPermissionMessage()] })
        return
    }

    if (args.getString('설정') === 'add') {
        if (await checkIsBlockword(guildId, word)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 이미 등록된 금지어입니다.' }] })
            return
        }
        
        await addBlockword(thisGuild, word)
    }
    else if (args.getString('설정') === 'remove') {
        if (!await checkIsBlockword(guildId, word)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 등록된 금지어가 아닙니다.' }] })
            return
        }

        await removeBlockword(thisGuild, word)
    }

    await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }] })
}
