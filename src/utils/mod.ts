import { Guild, GuildMember, PartialGuildMember, userMention } from "discord.js"
import prisma from "../prisma"
import { getGuildLogSetting, log } from "./log"
import { addMemberData, updateMemberData } from "./memberData"
import { getGuildModRole } from "./role"
import { addUserModGuild, removeUserModGuild } from "./userData"

export const getModList = async (guildId: string) => {
    const modList = await prisma.memberData.findMany({ where: {
        guildId,
        mod: true
    } })
    return modList
}

export const getGuildListThatUserMod = async (userId: string) => {
    const modList = await prisma.memberData.findMany({ where: {
        userId,
        mod: true
    } })
    return modList.map(m => m.guildId)
}

export const addMod = async (guild: Guild, member: GuildMember) => {
    const logSetting = await getGuildLogSetting(guild.id)
    const exist = await prisma.memberData.findMany({ where: { guildId: guild.id, mod: true, userId: member.id } })
    if (exist.length > 0) return
    await addUserModGuild(member.id, guild.id)
    await updateMemberData(member)
    logSetting?.addMod && log({
        content: `관리자 임명됨 : ${member.user.username}`,
        rawContent: `관리자 임명됨 : ${userMention(member.id)}`,
        guild,
        type: 'addMod'
    })
}

export const removeMod = async (guild: Guild, member: GuildMember) => {
    const logSetting = await getGuildLogSetting(guild.id)
    await addMemberData(member)
    await updateMemberData(member)
    await removeUserModGuild(member.id, guild.id)
    logSetting?.removeMod && log({
        content: `관리자 해임됨 : ${member.user.username}`,
        rawContent: `관리자 해임됨 : ${userMention(member.id)}`,
        guild,
        type: 'removeMod'
    })
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

export const hasModRole = async (member: GuildMember | PartialGuildMember) => {
    const modRoleList = (await getGuildModRole(member.guild)).map(b => b.id)
    const memberRoleList = member.roles.cache.map(r => r.id)

    return modRoleList.some(r => memberRoleList.includes(r))
}
