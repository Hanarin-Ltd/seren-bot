import { Guild } from "discord.js"
import { logToSQL } from "../lib"
import prisma from "../prisma"

export const getGuildData = async (guildId: string) => {
    return await prisma.guildData.findUnique({ where: { guildId } })
}

export const addOrUpdateGuildData = async (guild: Guild) => {
    await prisma.guildData.upsert({
        where: { guildId: guild.id },
        update: {},
        create: {
            guildId: guild.id,
            name: guild.name,
            ownerId: guild.ownerId,
            icon: guild.iconURL() || 'none'
        }
    })
}

export const removeGuildData = async (guildId: string) => {
    try {
        await prisma.guildData.deleteMany({ where: { guildId } })
        await prisma.guildBan.deleteMany({ where: { guildId } })
        await prisma.guildChannel.deleteMany({ where: { guildId } })
        await prisma.guildOption.deleteMany({ where: { guildId } })
        await prisma.guildPermission.deleteMany({ where: { guildId } })
        await prisma.blockword.deleteMany({ where: { guildId } })
        await prisma.memberData.deleteMany({ where: { guildId } })
        await prisma.guildRole.deleteMany({ where: { guildId } })
    } catch (err: any) {
        logToSQL(err)
    }
}