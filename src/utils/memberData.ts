import { MemberData } from "@prisma/client"
import { GuildMember, PartialGuildMember } from "discord.js"
import prisma from "../prisma"
import { getGuildOwner } from "./discord"

export const getMemberData = async (guildId: string, memberId: string) => {
    return await prisma.memberData.findFirst({ where: { userId: memberId, guildId } })
}

export const addMemberData = async (member: GuildMember) => {
    const exist = await prisma.memberData.findFirst({ where: { userId: member.id, guildId: member.guild.id } })
    if (exist) return

    await prisma.memberData.create({
        data: {
            userId: member.id,
            guildId: member.guild.id,
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            joinedAt: member.joinedAt ? member.joinedAt : new Date(),
            isOwner: (await getGuildOwner(member.guild)).id === member.id
        }
    })
}

export const removeMemberData = async (member: GuildMember | PartialGuildMember) => {
    await prisma.memberData.deleteMany({ where: { guildId: member.guild.id, userId: member.id } })
}

export const updateMemberData = async (member: GuildMember) => {
    await prisma.memberData.updateMany({
        where: { guildId: member.guild.id, userId: member.id },
        data: {
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            joinedAt: member.joinedAt ? member.joinedAt : new Date(),
            isOwner: (await getGuildOwner(member.guild)).id === member.id
        }
    })
}
