import { GuildOption } from "@prisma/client"
import prisma from "../prisma"

export const getGuildOption = async (guildId: string) => {
    return await prisma.guildOption.findUnique({ where: { guildId } })
}

export const setDefaultGuildOption = async (guildId: string, initial: any = {}) => {
    const exist = await prisma.guildOption.findUnique({ where: { guildId } })
    if (exist) return exist
    return await prisma.guildOption.create({
        data: {
            guildId,
            ...initial
        }
    })
}

export const modifyGuildOption = async (data: GuildOption) => {
    return await prisma.guildOption.update({
        where: { guildId: data.guildId },
        data
    })
}