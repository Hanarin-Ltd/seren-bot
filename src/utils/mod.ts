import { Guild, GuildMember, PermissionFlagsBits } from "discord.js"
import prisma from "../prisma"
import { addMemberData } from "./memberData"
import { getGuildModRole } from "./role"

export const getModList = async (guildId: string) => {
    const modList = await prisma.memberData.findMany({ where: {
        guildId,
        mod: true
    } })
    return modList
}

export const addMod = async (guild: Guild, member: GuildMember) => {
    try {
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mod: true },
        })
        member.roles.add((await getGuildModRole(guild))!.id)
    } catch {
        await addMemberData(member)
        await addMod(guild, member)
    }
}

export const removeMod = async (guild: Guild, member: GuildMember) => {
    try {
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mod: false }
        })
        member.roles.remove((await getGuildModRole(guild))!.id)
    } catch {
        await addMemberData(member)
        removeMod(guild, member)
    }
}