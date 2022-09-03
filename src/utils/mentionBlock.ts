import { Guild, GuildMember } from "discord.js"
import prisma from "../prisma"
import { addMemberData } from "./memberData"

export const getMentionBlockList = async (guildId: string) => {
    const result = await prisma.memberData.findMany({ where: {
        guildId,
        mentionBlock: true
    } })
    return result
}

export const addMentionBlock = async (guild: Guild, member: GuildMember) => {
    try {
        await prisma.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mentionBlock: true },
        })
        member.permissions.remove('MentionEveryone')
    } catch {
        await addMemberData(member)
    }
}

export const removeMentionBlock = async (guildId: string, member: GuildMember) => {
    member.permissions.add('MentionEveryone')
    await prisma.memberData.updateMany({
        where: { guildId, userId: member.id },
        data: { mentionBlock: false }
    })
}

export const isMentionBlock = async (guildId: string, member: GuildMember) => {
    const mentionBlockList = await getMentionBlockList(guildId)
    return mentionBlockList.some(m => m.userId === member.id)
}
