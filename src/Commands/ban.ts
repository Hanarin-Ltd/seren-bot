import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, User } from "discord.js"
import { BOT_COLOR } from "../lib"
import { addBan, removeBan } from "../utils/ban"
import { noPermissionMessage, errorMessage, completeSuccessfullyMessage, deferReply } from "../utils/default"
import { getThisGuild, getUser, getMember, isGuildModerator, getChannel, updateMemberCache } from "../utils/discord"
import { getGuildOption } from "../utils/guildOption"

export const someoneHasBan = (name: string, reason: string | null) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(`:no_entry: ${name}이(가) 차단되었습니다.`)
        .setDescription(`사유: ${reason ? reason : '공개하지 않음'}`)
        .setTimestamp()
}

export const someoneHasUnban = (name: string, reason: string | null) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(`:white_check_mark: ${name}이(가) 차단 해제되었습니다.`)
        .setDescription(`사유: ${reason ? reason : '공개하지 않음'}`)
        .setTimestamp()
}

export default async function ban(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const setting = args.getString('설정')!
    const targetUser = await getUser(interaction, args.getString('아이디')!) as User
    const targetMember = await getMember(thisGuild, args.getString('아이디')!)
    const reason = args.getString('사유')!
    const permission = await getGuildOption(thisGuild.id)

    await deferReply(interaction)

    if (!await isGuildModerator(thisGuild, interaction.member! as GuildMember)) {
        return await interaction.editReply({ embeds: [noPermissionMessage()] })
    }
    if (!targetUser) {
        return await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':warning: ID가 유효하지 않습니다!' }] })
    }
    if (!permission) {
        return await interaction.editReply({ embeds: [errorMessage()] })
    }

    const channel = await getChannel(thisGuild, setting === 'add' ? permission.banChannelId : permission.unbanChannelId)
    if (setting === 'add') {
        if (!targetMember) {
            return await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':warning: ID가 유효하지 않습니다!' }] })
        }
        if (await isGuildModerator(thisGuild, targetMember)) {
            return await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry: 관리자는 차단할 수 없습니다.' }] })
        }
        if (thisGuild.bans.cache.has(targetUser.id)) {
            return await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':x: 이미 차단된 사용자입니다!' }] })
        }

        await thisGuild.bans.create(targetMember, { reason: reason ? reason : '공개하지 않음' })
        await addBan(thisGuild.id, targetMember, reason)
        await interaction.editReply({ embeds: [completeSuccessfullyMessage()] })
    } else if (setting === 'remove') {
        try {
            await updateMemberCache(thisGuild)
            await thisGuild.members.unban(targetUser.id, reason ? reason : '공개하지 않음')
            await removeBan(thisGuild.id, targetUser.id)
            await interaction.editReply({ embeds: [completeSuccessfullyMessage()] })
        } catch (e) {
            console.log(e)
            return await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':x: 차단되지 않은 사용자입니다!' }] })
        }
    }
}
