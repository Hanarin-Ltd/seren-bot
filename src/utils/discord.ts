import { Guild, GuildMember, ChatInputCommandInteraction, MessagePayload, BaseMessageOptions, User } from "discord.js"
import client from ".."
import { getModList } from "./mod"

export const updateMemberCache = async (guild: Guild) => {
    await guild.members.fetch().catch(err => {
        console.log(err)
    })
}

export const updateChannelCache = async (guild: Guild) => {
    await guild.channels.fetch().catch(err => {
        console.log(err)
    })
}

export const updateRoleCache = async (guild: Guild) => {
    await guild.roles.fetch().catch(err => {
        console.log(err)
    })
}

export const updateGuildCache = async (guild: Guild) => {
    await guild.fetch().catch(err => {
        console.log(err)
    })
}

export const isGuildOwner = async (guild: Guild, member: GuildMember) => {
    return (await guild.fetchOwner()!).id === member.id
}

export const isGuildModerator = async (guild: Guild, member: GuildMember) => {
    return (await getModList(guild.id)).filter(mod => mod.userId === member.id).length > 0
}

export const getThisGuild = async (interaction: ChatInputCommandInteraction) => {
    return interaction.client.guilds.cache.get(interaction.guildId!)!
}

export const getGuildOwner = async (guild: Guild) => {
    return await guild.fetchOwner()!
}

export const getUser = async (interaction: ChatInputCommandInteraction, id: string) => {
    const data = await interaction.client.users.fetch(id)
    return data
}

export const getMember = async (guild: Guild, id: string) => {
    await updateMemberCache(guild)
    return guild.members.cache.get(id)
}

export const sendDM = async (userId: string, message: string | MessagePayload | BaseMessageOptions) => {
    try {
        await client.users.cache.get(userId)?.send(message)
    } catch { return }
}

export const getChannel = async (guild: Guild, channelId: string) => {
    return guild.channels.cache.get(channelId)
}

export const isGuildMember = async (guild: Guild, user: User) => {
    return guild.members.cache.has(user.id)
}

export const isCommunity = (guild: Guild) => {
    return guild.features?.includes('COMMUNITY')
}
