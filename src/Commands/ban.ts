import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, User } from "discord.js"
import { addBan, BOT_COLOR, completeSuccessfullyMessage, errorMessage, getChannel, getGuildData, getGuildOption, getGuildPermission, getMember, getThisGuild, getUser, isGuildModerator, logToSQL, noPermissionMessage, removeBan, updateMemberCache } from "../lib"

const someoneHasBan = (name: string, reason: string | null) => {
    return new EmbedBuilder()
        .setTitle(`:no_entry: ${name}이(가) 차단되었습니다.`)
        .setDescription(`사유: ${reason ? reason : '공개하지 않음'}`)
        .setTimestamp()
}

const someoneHasUnban = (name: string, reason: string | null) => {
    return new EmbedBuilder()
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

    await interaction.deferReply()

    if (!await isGuildModerator(thisGuild, interaction.member! as GuildMember)) {
        await interaction.editReply({ embeds: [noPermissionMessage()] })
        return
    }

    if (!targetUser) {
        await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':warning: ID가 유효하지 않습니다!' }] })
        return
    }

    if (!permission) {
        await interaction.editReply({ embeds: [errorMessage()] })
        return
    }

    const channel = await getChannel(thisGuild, permission.banChannelId)
    if (setting === 'add') {
        if (!targetMember) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':warning: ID가 유효하지 않습니다!' }] })
            return
        }
    
        if (await isGuildModerator(thisGuild, targetMember)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry: 관리자는 차단할 수 없습니다.' }] })
            return
        }

        if (thisGuild.bans.cache.has(targetUser.id)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':x: 이미 차단된 사용자입니다!' }] })
            return
        }

        await thisGuild.bans.create(targetMember, { reason: reason ? reason : '공개하지 않음' })
        await addBan(thisGuild.id, targetMember, reason)
        await interaction.editReply({ embeds: [completeSuccessfullyMessage()] })

        if (!channel) {
            logToSQL(`Error: Can't get the Channel / guildId : ${thisGuild.id} / channelId : ${permission.welcomeChannelId}`)
            return
        }
        if (channel.isTextBased()) {
            channel.send({
                embeds: [someoneHasBan(targetMember.user.username, reason)]
            })
        }
    } else if (setting === 'remove') {
        try {
            await updateMemberCache(thisGuild)
            await thisGuild.members.unban(targetUser.id, reason ? reason : '공개하지 않음')
            await removeBan(thisGuild.id, targetUser.id)
            await interaction.editReply({ embeds: [completeSuccessfullyMessage()] })

            if (!channel) {
                logToSQL(`Error: Can't get the Channel / guildId : ${thisGuild.id} / channelId : ${permission.welcomeChannelId}`)
                return
            }
            if (channel.isTextBased()) {
                channel.send({
                    embeds: [someoneHasUnban(targetUser.username, reason)]
                })
            }
        } catch (e) {
            console.log(e)
            logToSQL(e as string)
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':x: 차단되지 않은 사용자입니다!' }] })
            return
        }
    }
}
