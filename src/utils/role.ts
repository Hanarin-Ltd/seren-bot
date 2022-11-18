import { Guild, Role, inlineCode, PermissionFlagsBits } from "discord.js"
import prisma from "../prisma"
import { updateRoleCache } from "./discord"
import { getGuildLogSetting, log } from "./log"


export const addAllGuildRole = async (guild: Guild) => {
    await updateRoleCache(guild)

    await prisma.guildRole.deleteMany({ where: { guildId: guild.id } })
    guild.roles.cache.forEach(async r => {
        await addGuildRole(r)
    })
}

export const addGuildRole = async (role: Role) => {
    if (role.name === '@everyone' || role.name === 'Seren') return

    log({
        content: `역할 추가됨 / 이름 : ${role.name}`,
        guild: role.guild,
        type: 'roleCreate'
    })
    return await prisma.guildRole.createMany({ data: {
        id: role.id,
        name: role.name,
        guildId: role.guild.id,
        type: 'any'
    }, skipDuplicates: true })
}

export const getGuildModRole = async (guild: Guild) => {
    const contained = await prisma.guildRole.findMany({ where: { guildId: guild.id, type: 'mod' } })
    const modRole = guild.roles.cache.filter(r => r.permissions.has(PermissionFlagsBits.Administrator))
    return [...contained, ...modRole.map(r => ({ id: r.id, name: r.name, guildId: r.guild.id, type: 'mod' }))]
}

export const getGuildRole = async (guild: Guild, roleId: string) => {
    return await prisma.guildRole.findFirst({ where: { guildId: guild.id, id: roleId } })
}

export const removeGuildRole = async (role: Role) => {
    log({
        content: `역할 삭제됨 / 이름 : ${inlineCode(role.name)}`,
        guild: role.guild,
        type: 'roleDelete'
    })
    return await prisma.guildRole.deleteMany({ where: { guildId: role.guild.id, id: role.id } })
}

export const modifyGuildRole = async (oldRole: Role, newRole: Role) => {
    log({
        content: `역할 편집됨 / 이름 : ${newRole.name}`,
        guild: newRole.guild,
        type: 'roleUpdate'
    })
    return await prisma.guildRole.updateMany({
        where: { guildId: oldRole.guild.id, id: oldRole.id },
        data: {
            name: newRole.name,
            guildId: newRole.guild.id,
        }
    })
}

export const setRoleToMod = async (role: Role) => {
    return await prisma.guildRole.updateMany({
        where: { id: role.id },
        data: { type: 'mod' }
    })
}