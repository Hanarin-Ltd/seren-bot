import { Guild, Role, PermissionFlagsBits } from "discord.js"
import prisma from "../prisma"
import { updateRoleCache } from "./discord"
import { getGuildLogSetting, log } from './utils/log'

export const addAllGuildRole = async (guild: Guild) => {
    await updateRoleCache(guild)

    await prisma.guildRole.deleteMany({ where: { guildId: guild.id } })
    guild.roles.cache.forEach(async r => {
        await addGuildRole(r)
    })
}

export const addGuildRole = async (role: Role) => {
    if (role.name === '@everyone' || role.name === 'Seren') return
    const logSetting = await getGuildLogSetting(role.guild.id)

    logSetting.createRole && log({
        content: `역할 추가됨 / 이름 : ${role.name}`,
        rawContent: `역할 추가됨 / 이름 : ${role.name}`,
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
    return (await prisma.guildRole.findFirst({ where: { guildId: guild.id, type: 'mod' } }))!
}

export const getGuildRole = async (guild: Guild, roleId: string) => {
    return await prisma.guildRole.findFirst({ where: { guildId: guild.id, id: roleId } })
}

export const removeGuildRole = async (role: Role) => {
    const logSetting = await getGuildLogSetting(role.guild.id)

    logSetting.createRole && log({
        content: `역할 삭제됨 / 이름 : ${role.name}`,
        rawContent: `역할 삭제됨 / 이름 : ${role.name}`,
        guild: role.guild,
        type: 'roleDelete'
    })
    return await prisma.guildRole.deleteMany({ where: { guildId: role.guild.id, id: role.id } })
}

export const modifyGuildRole = async (oldRole: Role, newRole: Role) => {
    const logSetting = await getGuildLogSetting(role.guild.id)

    logSetting.createRole && log({
        content: `역할 편집됨 / 이름 : ${role.name}`,
        rawContent: `역할 편집됨 / 이름 : ${role.name}`,
        guild: role.guild,
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
    role.setPermissions(PermissionFlagsBits.Administrator)
    return await prisma.guildRole.update({
        where: { id: role.id },
        data: { type: 'mod' }
    })
}