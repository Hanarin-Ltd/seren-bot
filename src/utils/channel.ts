import { Guild, GuildChannel, GuildBasedChannel } from "discord.js"
import prisma from "../prisma"
import { updateChannelCache } from "./discord"

export const getGuildChannel = async (guild: Guild) => {
    const result =  await prisma.guildChannel.findFirst({ where: { guildId: guild.id } })
    return result ? result : {} as GuildChannel
}

export const addAllGuildChannel = async (guild: Guild) => {
    await updateChannelCache(guild)

    await prisma.guildChannel.deleteMany({ where: { guildId: guild.id } })
    guild.channels.cache.forEach(async c => {
        await addGuildChannel(c)
    })
}

export const addGuildChannel = async (channel: GuildChannel | GuildBasedChannel) => {
    return await prisma.guildChannel.create({ data: {
        guildId: channel.guildId,
        channelId: channel.id,
        channelName: channel.name,
        channelType: channel.type
    } })
}

export const removeGuildChannel = async (channel: GuildChannel) => {
    return await prisma.guildChannel.deleteMany({ where: { guildId: channel.guildId, channelId: channel.id } })
}

export const modifyGuildChannel = async (oldCh: GuildChannel, newCh: GuildChannel) => {
    return await prisma.guildChannel.updateMany({
        where: { guildId: oldCh.guildId, channelId: oldCh.id },
        data: {
            channelId: newCh.id,
            channelName: newCh.name,
            channelType: newCh.type
        }
    })
}