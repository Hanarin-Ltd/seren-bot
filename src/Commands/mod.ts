import { ChatInputCommandInteraction, CacheType, GuildMember } from "discord.js"
import { updateMemberCache, getThisGuild, BOT_COLOR, isGuildOwner, addMod, removeMod, noPermissionMessage, isGuildModerator } from "../lib"

export default async function mod(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply()

    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const guildId = thisGuild.id
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
        
        await addMod(guildId, target)
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

       await removeMod(guildId, target)
    }

    await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }] })
}
