import { GuildOption } from "@prisma/client"
import { prisma } from "../lib"

export const getGuildOption = async (guildId: string) => {
    return await prisma.guildOption.findUnique({ where: { guildId } })
}

export const setDefaultGuildOption = async (guildId: string) => {
    return await prisma.guildOption.create({
        data: {
            guildId
        }
    })
}

export const modifyGuildOption = async (data: GuildOption) => {
    return await prisma.guildOption.update({
        where: { guildId: data.guildId },
        data
    })
}