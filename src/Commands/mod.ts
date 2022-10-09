import { ChatInputCommandInteraction, CacheType, GuildMember } from "discord.js"
import { BOT_COLOR } from "../lib"
import { deferReply, noPermissionMessage } from "../utils/default"
import { getThisGuild, updateMemberCache, isGuildOwner, isGuildModerator } from "../utils/discord"
import { addMod, removeMod } from "../utils/mod"

export default async function mod(interaction: ChatInputCommandInteraction<CacheType>) {
    await deferReply(interaction)

    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const target = args.getMember('멤버')! as GuildMember

    await updateMemberCache(thisGuild)

    if (!await isGuildOwner(thisGuild, interaction.member! as GuildMember)) {
        await interaction.editReply({ embeds: [noPermissionMessage()] })
        return
    }
    
    if (args.getString('설정') === 'add') {
        if (await isGuildModerator(thisGuild, target)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 이미 등록된 멤버입니다.' }] })
            return
        }
        
        await addMod(thisGuild, target)
    }
    else if (args.getString('설정') === 'remove') {
        if (!await isGuildModerator(thisGuild, target)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 등록된 멤버가 아닙니다.' }] })
            return
        }
        if (await isGuildOwner(thisGuild, target)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 서버 소유자는 항상 관리자입니다' }] })
            return
        }

       await removeMod(thisGuild, target)
    }

    await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }] })
}
