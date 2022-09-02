import { GuildMember, PermissionFlagsBits } from "discord.js"
import { prisma } from "../lib"
import { addMemberData } from "./memberData"

export const getModList = async (guildId: string) => {
    const modList = await prisma.memberData.findMany({ where: {
        guildId,
        mod: true
    } })
    return modList
}

export const addMod = async (guildId: string, member: GuildMember) => {
    try {
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: { mod: true },
        })
        member.permissions.add(PermissionFlagsBits.ManageGuild)
    } catch {
        await addMemberData(member)
        await addMod(guildId, member)
    }
}

export const removeMod = async (guildId: string, member: GuildMember) => {
    try {
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: { mod: false }
        })
        member.permissions.add(PermissionFlagsBits.ManageGuild)
    } catch {
        await addMemberData(member)
        removeMod(guildId, member)
    }
}