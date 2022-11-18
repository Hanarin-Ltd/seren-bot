import { Guild, GuildMember, PartialGuildMember, PermissionFlagsBits, userMention } from "discord.js"
import prisma from "../prisma"
import { updateRoleCache } from "./discord"
import { getGuildLogSetting, log } from "./log"
import { addMemberData, updateMemberData } from "./memberData"
import { getGuildModRole } from "./role"
import { addUserModGuild, addUserOwnedGuild, removeUserModGuild } from "./userData"

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
    const exist = await prisma.memberData.findMany({ where: { guildId: guild.id, mod: true, userId: member.id } })
    if (exist.length > 0) return
    await addUserModGuild(member.id, guild.id)
    await updateMemberData(member)
    log({
        content: `관리자 임명됨 : ${member.user.username}`,
        rawContent: `관리자 임명됨 : ${userMention(member.id)}`,
        guild,
        type: 'addMod'
    })
}

export const removeMod = async (guild: Guild, member: GuildMember) => {
    await addMemberData(member)
    await updateMemberData(member)
    await removeUserModGuild(member.id, guild.id)
    log({
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
    if (member.user.bot) return false
    if (member.guild.ownerId === member.id) return true

    const modRoleList = (await getGuildModRole(member.guild)).map(b => b.id)
    const memberRoleList = member.roles.cache.map(r => r.id)

    return modRoleList.some(r => memberRoleList.includes(r))
}

export const updateAllMod = async (guild: Guild) => {
    await addMod(guild, await guild.fetchOwner())
    await addUserModGuild(guild.ownerId, guild.id)
    await addUserOwnedGuild(guild.ownerId, guild.id)
    await updateRoleCache(guild)
    guild.roles.cache.forEach(role => {
        if (role.permissions.has(PermissionFlagsBits.Administrator)) {
            role.members.forEach(async member => {
                if (member.user.bot) return
                await addMod(guild, member)
                await addUserModGuild(member.id, guild.id)
            })
        } else {
            role.members.forEach(async member => {
                if (await hasModRole(member)) return
                await removeMod(guild, member)
                await removeUserModGuild(member.id, guild.id)
            })
        }
    })
}
