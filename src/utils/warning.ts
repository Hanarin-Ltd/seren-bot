import { EmbedBuilder, GuildMember, userMention } from "discord.js"
import { BOT_COLOR } from "../lib"
import prisma from "../prisma"
import { addBan } from "./ban"
import { sendDM } from "./discord"
import { getGuildOption } from "./guildOption"
import { getGuildLogSetting, log } from "./log"
import { getMemberData, addMemberData } from "./memberData"
import { updateTodayBotStatistics, updateTodayGuildStatistics, updateTodayMemberStatistics } from "./statistics"

export const getWarning = async (guildId: string, memberId: string) => {
    const result = await prisma.memberData.findFirst({ where: {
        guildId,
        userId: memberId,
    } })
    return result ? result.warning : 0
}

export const getGuildWarnings = async (guildId: string) => {
    const result = await prisma.memberData.findMany({ select: { warning: true }, where: { guildId } })
    return result.reduce((acc, cur) => acc + cur.warning, 0)
}

export const getWarningList = async (guildId: string) => {
    const data = await prisma.memberData.findMany({ where: { guildId } })
    return data.filter(m => m.warning > 0)
}

const youGotWarningEmbed = (guildName: string, received: number, total: number) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':warning: 경고를 받았습니다!')
    .setFields(
        { name: '서버', value: `> **${guildName}**`, inline: true },
        { name: '받은 경고 수', value: `> **${received}**`, inline: true },
        { name: '현재 경고 수', value: `> **${total}**`, inline: true },
    )
    .setTimestamp()

export const giveWarning = async (guildId: string, member: GuildMember, num = 1) => {
    const exist = await getMemberData(member.guild.id, member.id)
    const option = await getGuildOption(guildId)
    const afterWarning = exist ? exist.warning + num : num

    if (!exist) await addMemberData(member)
    await prisma.memberData.updateMany({
        where: { guildId, userId: member.id },
        data: {
            warning: afterWarning,
        }
    })
    log({
        content: `경고 추가 멤버 : ${member.user.username} / 갯수 : ${num}개`,
        guild: member.guild!,
        type: 'getWarning'
    })
    await sendDM(member.id, { embeds: [youGotWarningEmbed(member.guild.name, num, afterWarning)] })

    if (option?.warningLimit && afterWarning >= option.warningLimit && member.bannable) {
        member.ban()
        await addBan(guildId, member, `경고 누적으로 인한 차단 (${afterWarning}개)`)
    }

    await updateTodayBotStatistics('totalWarning', prev => prev += num)
    await updateTodayGuildStatistics(guildId, 'todayWarnings', prev => prev += num)
    await updateTodayMemberStatistics(guildId, member.id, 'todayWarnings', prev => prev += num)
}

export const removeWarning = async (guildId: string, member: GuildMember, num = 1) => {
    const warningCount = await getWarning(guildId, member.id)
    await prisma.memberData.updateMany({
        where: { guildId, userId: member.id },
        data: {
            warning: num >= warningCount ? 0 : warningCount - num
        }
    })
    log({
        content: `경고 제거 멤버 : ${member.user.username} / 갯수 : ${num >= warningCount ? warningCount : num}개`,
        guild: member.guild!,
        type: 'removeWarning'
    })

    await updateTodayMemberStatistics(guildId, member.id, 'todayWarnings', prev => prev >= num ? prev - num : 0)
}

export const resetWarning = async (guildId: string, memberId: string) => {
    await prisma.memberData.updateMany({
        where: { guildId, userId: memberId },
        data: {
            warning: 0
        }
    })

    await updateTodayMemberStatistics(guildId, memberId, 'todayWarnings', 0)
}

export const setWarningLimit = async (guildId: string, count: number) => {
    return await prisma.guildOption.update({
        where: { guildId },
        data: {
            warningLimit: count
        }
    })
}
