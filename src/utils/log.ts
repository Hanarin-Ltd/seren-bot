import { GuildLogSetting } from "@prisma/client"
import { EmbedBuilder, Guild } from "discord.js"
import { BOT_COLOR } from "../lib"
import prisma from "../prisma"
import { getCurrentDate, getCurrentTime } from "./default"
import { getChannel } from "./discord"
import { getGuildOption } from "./guildOption"

export const getGuildLogSetting = async (guildId: string) => {
    return await prisma.guildLogSetting.findUnique({ where: { guildId } })
}

export const setGuildLogSetting = async (guildId: string, initial: any = {}) => {
    const exist = await prisma.guildLogSetting.findUnique({ where: { guildId } })
    if (exist) return exist
    return await prisma.guildLogSetting.create({ data: { guildId, ...initial } })
}

export const modifyGuildLogSetting = async (guildId: string, data: GuildLogSetting) => {
    return await prisma.guildLogSetting.upsert({
        where: { guildId },
        update: data,
        create: { guildId }
    })
}

const logEmbed = (content: string, now: Date) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':pencil: 로그')
        .setDescription(content)
        .setFooter({ text: `${getCurrentDate(now)} ${getCurrentTime(now)}` })
}

export const log = async ({ content, rawContent, guild, type }: { content: string, rawContent: string, guild: Guild, type: keyof GuildLogSetting }) => {
    const option = await getGuildOption(guild.id)
    const logSetting = await getGuildLogSetting(guild.id)
    if (!option || !option.logEnabled || !logSetting || !logSetting[type]) return
    const logChannel = await getChannel(guild, option.logChannelId)
    if (!logChannel) return
    const createdAt = new Date()
    if (logChannel.isTextBased()) logChannel.send({ embeds: [logEmbed(rawContent, createdAt)] })
    return await prisma.guildLog.create({
        data: {
            guildId: guild.id,
            content,
            type,
            rawContent,
            createdAt
        }
    })
}
