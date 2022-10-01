import { GuildMember, userMention } from "discord.js"
import prisma from "../prisma"
import { getGuildLogSetting, log } from "./log"
import { getMemberData, addMemberData } from "./memberData"

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
    const exist = await getMemberData(member.id)
    const logSetting = await getGuildLogSetting(guildId)
    try {
        await prisma.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: {
                warning: exist.warning + num
            }
        })
        logSetting?.getWarning && log({
            content: `경고 추가 멤버 : ${member.user.username} / 갯수 : ${num}개`,
            rawContent: `경고 추가 멤버 : ${userMention(member.id)} / 갯수 : ${num}개`,
            guild: member.guild!,
            type: 'getWarning'
        })
    } catch {
        await addMemberData(member)
        await giveWarning(guildId, member, num)
    }
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