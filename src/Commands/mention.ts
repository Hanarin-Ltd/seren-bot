import { ChatInputCommandInteraction, CacheType, Message, EmbedBuilder, userMention, GuildMember } from "discord.js"
import { BOT_COLOR } from "../lib"
import { noPermissionMessage } from "../utils/default"
import { updateMemberCache, getThisGuild, isGuildModerator } from "../utils/discord"
import { isMentionBlock, removeMentionBlock, addMentionBlock } from "../utils/mentionBlock"
import { giveWarning } from "../utils/warning"

const youCantMention = () => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':no_entry_sign: 멘션을 보낼 수 없습니다!')
        .setDescription('서버 관리자가 당신이 멘션을 보낼 수 없도록 설정하였습니다.')
}

const sorryForGhostPing = (server: string, user: string) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':ghost: 고스트 핑이 발생했습니다!')
        .setDescription('멘션 금지 유저가 당신을 멘션하여 봇이 메세지를 삭제했습니다. 이로 인해 고스트 핑이 발생한점에 대해서 사과드립니다. :man_bowing:')
        .addFields(
            { name: '서버', value: `**> ${server}**`, inline: true },
            { name: '멘션한 사용자', value: `**> ${userMention(user)}**`, inline: true }
        )
}

export default async function mention(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply()
    await updateMemberCache(interaction.guild!)

    const args = interaction.options
    const thisGuild = await getThisGuild(interaction)
    const guildId = thisGuild.id
    const member = args.getMember('멤버')! as GuildMember

    if (!await isGuildModerator(thisGuild, interaction.member! as GuildMember)) {
        await interaction.editReply({ embeds: [noPermissionMessage()] })
        return
    }

    if (await isGuildModerator(thisGuild, args.getMember('멤버')! as GuildMember)) {
        await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 서버 관리자를 설정할 수 없습니다' }] })
        return
    }

    if (args.getString('설정') === 'allow') {
        if (!await isMentionBlock(guildId, member)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 이미 허용된 멤버입니다.' }] })
            return
        }

        await removeMentionBlock(guildId, member)
    }
    else if (args.getString('설정') === 'block') {
        if (await isMentionBlock(guildId, member)) {
            await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 이미 금지된 멤버입니다.' }] })
            return
        }

        await addMentionBlock(thisGuild, member)
    }

    await interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }] })
}

export const scanMention = async (message: Message) => {
    if (await isMentionBlock(message.guildId!, message.member!) && (message.mentions.everyone || message.mentions.members?.size! > 0)) {
        await message.delete()
        await message.author.send({ embeds: [youCantMention()] })
        await giveWarning(message.guildId!, message.member!)
        
        if (message.mentions.members?.size! > 0) {
            message.mentions.members?.forEach(async member => {
                if (member.id === message.author.id) return
                
                member.send({ embeds: [sorryForGhostPing(message.guild!.name, message.author.id)] })
            })
        }
    }
}
