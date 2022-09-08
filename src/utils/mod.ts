import { Guild, GuildMember, PermissionFlagsBits, userMention } from "discord.js"
import prisma from "../prisma"
import { getGuildLogSetting, log } from "./log"
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
        const logSetting = await getGuildLogSetting(guild.id)
        const exist = await prisma.memberData.findMany({ where: { guildId: guild.id, mod: true, userId: member.id } })
        if (exist.length > 0) return
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mod: true },
        })
        member.roles.add((await getGuildModRole(guild))!.id)
        logSetting?.addMod && log({
            content: `관리자 임명됨 : ${member.user.username}`,
            rawContent: `관리자 임명됨 : ${userMention(member.id)}`,
            guild,
            type: 'addMod'
        })
    } catch {
        await addMemberData(member)
        await addMod(guild, member)
    }
}

export const removeMod = async (guild: Guild, member: GuildMember) => {
    try {
        const logSetting = await getGuildLogSetting(guild.id)
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mod: false }
        })
        member.roles.remove((await getGuildModRole(guild))!.id)
        logSetting?.removeMod && log({
            content: `관리자 해임됨 : ${member.user.username}`,
            rawContent: `관리자 해임됨 : ${userMention(member.id)}`,
            guild,
            type: 'removeMod'
        })
    } catch {
        await addMemberData(member)
        removeMod(guild, member)
    }
}

export const updateGuildMod = async (guildId: string, data: any) => {
    const oldModList = (await prisma.memberData.findMany({ where: { guildId, mod: true } })).map(b => b.userId)
    const newModList = data.mod.map((b: { userId: any }) => b.userId)
    oldModList.forEach(async id => {
        if (newModList.includes(id)) return
        await prisma.memberData.updateMany({
            where: { guildId, userId: id, mod: true },
            data: { mod: false }
        })
    })
}
