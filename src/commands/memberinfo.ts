import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, Presence, User } from "discord.js"
import { BOT_COLOR } from "../lib"
import { getCurrentDate } from "../utils/default"
import { getMemberLevel } from "../utils/level"
import { getUserData } from "../utils/userData"

const notFoundEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':x: 404 유저를 찾을 수 없습니다!')
    .setDescription('유저를 찾을 수 없습니다. 유저가 서버에 있지 않거나, 유저가 존재하지 않습니다.')
    .setTimestamp()

const getStatusString = (presence: Presence) => {
    switch (presence.status) {
        case 'online':
            return '🟢 온라인'
        case 'idle':
            return '🟡 자리 비움'
        case 'dnd':
            return '🔴 다른 용무 중'
        case 'offline':
            return '⚫ 오프라인'
        default:
            return '⚫ 오프라인'
    }
}

const memberInfoEmbed = async (member: GuildMember) => {
    const user = member.user
    const memberLevel = await getMemberLevel(member)
    const userData = await getUserData(user.id)
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setTitle(`:information_source: ${member.displayName}님의 정보`)
        .setFields(
            { name: '상태', value: `> **${member.presence ? getStatusString(member.presence) : '⚫ 오프라인'}**`, inline: false },
            { name: '레벨', value: `> **Lv.${memberLevel}**`, inline: false },
            { name: '포인트', value: `> **${userData ? userData.point : '알 수 없음'}**`, inline: false },
            { name: '태그', value: `> ${user.tag}`, inline: true },
            { name: '계정 생성일', value: `> ${getCurrentDate(user.createdAt)}`, inline: true },
            { name: '봇 여부', value: `> ${user.bot ? '네' : '아니오'}`, inline: true },
            { name: '서버 참가일', value: `> ${member.joinedAt ? getCurrentDate(member.joinedAt) : '알 수 없음'}`, inline: true },
            { name: '서버 부스팅', value: `> ${member.premiumSince ? getCurrentDate(member.premiumSince) : '아니오'}`, inline: true },
        )
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .setTimestamp()
}

export default async function memberinfo(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return await interaction.editReply({ embeds: [notFoundEmbed] })

    const targetUser = interaction.options.getUser('멤버')
    if (!targetUser) return await interaction.editReply({ embeds: [notFoundEmbed] })

    const targetMember = interaction.guild.members.cache.get(targetUser.id)
    if (!targetMember) return await interaction.editReply({ embeds: [notFoundEmbed] })

    await interaction.editReply({ embeds: [await memberInfoEmbed(targetMember)] })
}
