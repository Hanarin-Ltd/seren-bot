import { GuildLog } from "@prisma/client"
import prisma from "../prisma"

export const getGuildLogSetting = async (guildId: string) => {
    return await prisma.guildLog.findUnique({ where: { guildId } })
}

export const addGuildLogSetting = async (guildId: string) => {
    return await prisma.guildLog.create({ data: { guildId } })
}

export const modifyGuildLogSetting = async (guildId: string, data: GuildLog) => {
    return await prisma.guildLog.upsert({
        where: { guildId },
        update: data,
        create: { guildId }
    })
}
