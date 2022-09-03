import { GuildPermission } from "@prisma/client"
import prisma from "../prisma"

export const getGuildPermission = async (guildId: string) => {
    return await prisma.guildPermission.findUnique({ where: { guildId } })
}

export const setDefaultGuildPermission = async (guildId: string) => {
    return await prisma.guildPermission.create({
        data: {
            guildId
        }
    })
}

export const modifyGuildPermission = async (data: GuildPermission) => {
    return await prisma.guildPermission.update({
        where: { guildId: data.guildId },
        data
    })
}