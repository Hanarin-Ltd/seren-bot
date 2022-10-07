import { ChannelType, EmbedBuilder, Guild, GuildChannel, GuildMember, GuildTextBasedChannel, userMention } from 'discord.js'
import { BOT_COLOR } from '../lib'
import prisma from '../prisma'
import { getChannel } from './discord'
import { getGuildOption } from './guildOption'
import { getGuildLogSetting, log } from './log'
import { addMemberData, getMemberData } from './memberData'

export const getMemberLevel = async (member: GuildMember) => {
    const result = await prisma.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } })
    return result ? result.level : 1
}

export const getMemberExp = async (member: GuildMember) => {
    const result = await prisma.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } })
    return result ? result.exp : 0
}

export const addMemberExp = async (member: GuildMember, exp: number) => {
    const exist = await prisma.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } })
    if (!exist) await addMemberData(member)
    return await prisma.memberData.updateMany({
        where: { guildId: member.guild.id, userId: member.id },
        data: {
            exp: exist ? exist.exp + exp : exp,
        }
    })
}

export const addMemberLevel = async (member: GuildMember) => {
    const exist = await prisma.memberData.findFirst({ where: { guildId: member.guild.id, userId: member.id } })
    if (!exist) await addMemberData(member)
    return await prisma.memberData.updateMany({
        where: { guildId: member.guild.id, userId: member.id },
        data: {
            level: exist ? exist.level + 1 : 1,
            exp: 0
        }
    })
}

export const checkLevelUp = async (member: GuildMember, channel: GuildTextBasedChannel) => {
    const currentExp = await getMemberExp(member)
    const currentLevel = await getMemberLevel(member)

    if (currentExp <= 0) return false
    
    const afterLevel = currentLevel + 1
    if (currentExp >= currentLevel * 200) {
        const logSetting = await getGuildLogSetting(member.guild.id)
        logSetting?.levelUp && log({
            content: `레벨업 : ${member.user.username} / ${currentLevel} -> ${afterLevel}`,
            rawContent: `레벨업 : ${userMention(member.id)} / ${currentLevel} -> ${afterLevel}`,
            guild: member.guild,
            type: 'levelUp'
        })
        await sendLevelUpMessage(member, channel, currentLevel, afterLevel)
        await addMemberLevel(member)
        return true
    }
    else return false 
}

const levelUpEmbed = async (member: GuildMember, beforeLevel: number | string, afterLevel: number | string) => {
    const content = (await getGuildOption(member.guild.id))!
    const memberData = await getMemberData(member.id)
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(
            content.levelUpMessage
            .replaceAll('{user}', memberData.nickname)
            .replaceAll('{server}', member.guild.name)
            .replaceAll('{beforelevel}', beforeLevel.toString())
            .replaceAll('{afterlevel}', afterLevel.toString())
        )
}

export const sendLevelUpMessage = async (member: GuildMember, channel: GuildTextBasedChannel, beforeLevel: number, afterLevel: number) => {
    const guildId = member.guild.id
    const option = (await getGuildOption(guildId))!
    if (!option.levelUpMessageEnabled) return

    if (option.messageInLevelupChannel) {
        return await channel.send({ embeds: [await levelUpEmbed(member, beforeLevel, afterLevel)] })
    } else{
        const channel = (await getChannel(member.guild, option.levelUpChannelId))!
        return channel.type === ChannelType.GuildText && (
            await channel.send({ embeds: [await levelUpEmbed(member, beforeLevel, afterLevel)] })
        )
    }
}
