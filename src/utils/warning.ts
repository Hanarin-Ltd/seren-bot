import { GuildMember } from "discord.js"
import prisma from "../prisma"
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
    try {
        await prisma.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: {
                warning: exist.warning + num
            }
        })
    } catch {
        await addMemberData(member)
        await giveWarning(guildId, member, num)
    }
}

export const removeWarning = async (guildId: string, memberId: string, num = 1) => {
    await prisma.memberData.updateMany({
        where: { guildId, userId: memberId },
        data: {
            warning: (await getWarning(guildId, memberId))! - num
        }
    })
}