import { GuildMember, userMention } from "discord.js"
import prisma from "../prisma"
import { addBan } from "./ban"
import { getGuildOption } from "./guildOption"
import { getGuildLogSetting, log } from "./log"
import { getMemberData, addMemberData } from "./memberData"
import { updateTodayStatistics } from "./statistics"

export const getWarning = async (guildId: string, memberId: string) => {
    const result = await prisma.memberData.findFirst({ where: {
        guildId,
        userId: memberId,
    } })
    return result ? result.warning : 0
}

export const getWarningList = async (guildId: string) => {
    const data = await prisma.memberData.findMany({ where: { guildId } })
    return data.filter(m => m.warning > 0)
}

export const giveWarning = async (guildId: string, member: GuildMember, num = 1) => {
    const exist = await getMemberData(member.guild.id, member.id)
    const logSetting = await getGuildLogSetting(guildId)
    const option = await getGuildOption(guildId)
    const afterWarning = exist ? exist.warning + num : num

    if (!exist) await addMemberData(member)
    await prisma.memberData.updateMany({
        where: { guildId, userId: member.id },
        data: {
            warning: afterWarning,
        }
    })
    logSetting?.getWarning && log({
        content: `경고 추가 멤버 : ${member.user.username} / 갯수 : ${num}개`,
        rawContent: `경고 추가 멤버 : ${userMention(member.id)} / 갯수 : ${num}개`,
        guild: member.guild!,
        type: 'getWarning'
    })

    if (option?.warningLimit && afterWarning >= option.warningLimit && member.bannable) {
        member.ban()
        await addBan(guildId, member, `경고 누적으로 인한 차단 (${afterWarning}개)`)
    }
    updateTodayStatistics('totalWarning', prev => prev += 1)
}

export const removeWarning = async (guildId: string, member: GuildMember, num = 1) => {
    const logSetting = await getGuildLogSetting(guildId)
    const warningCount = await getWarning(guildId, member.id)
    await prisma.memberData.updateMany({
        where: { guildId, userId: member.id },
        data: {
            warning: num >= warningCount ? 0 : warningCount - num
        }
    })
    logSetting?.getWarning && log({
        content: `경고 제거 멤버 : ${member.user.username} / 갯수 : ${num >= warningCount ? warningCount : num}개`,
        rawContent: `경고 제거 멤버 : ${userMention(member.id)} / 갯수 : ${num >= warningCount ? warningCount : num}개`,
        guild: member.guild!,
        type: 'removeWarning'
    })
}

export const resetWarning = async (guildId: string, memberId: string) => {
    return await prisma.memberData.updateMany({
        where: { guildId, userId: memberId },
        data: {
            warning: 0
        }
    })
}

export const setWarningLimit = async (guildId: string, count: number) => {
    return await prisma.guildOption.update({
        where: { guildId },
        data: {
            warningLimit: count
        }
    })
}
