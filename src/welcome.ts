import { GuildMember, PartialGuildMember } from "discord.js"
import { BOT_COLOR, getChannel, getGuildOption, logToSQL } from "./lib"

export const welcome = async (member: GuildMember) => {
    const permission = await getGuildOption(member.guild.id)
    if (!permission) return

    const channel = await getChannel(member.guild, permission.welcomeChannelId)
    if (!channel) {
        logToSQL(`Error: Can't get the Channel / guildId : ${member.guild.id} / channelId : ${permission.welcomeChannelId}`)
        return
    }

    if (channel.isTextBased()) {
        channel.send({
            embeds: [{ color: BOT_COLOR, title: permission.welcomeMessage
                .replace('{user}', member.user.username)
                .replace('{server}', member.guild.name)
            }]
        })
    } else {
        logToSQL(`TypeError: Unpredictable Type / guildId : ${member.guild.id} / channelId : ${permission.welcomeChannelId}`)
        return
    }
}

export const goodbye = async (member: GuildMember | PartialGuildMember) => {
    const permission = await getGuildOption(member.guild.id)
    if (!permission) return

    const channel = await getChannel(member.guild, permission.goodbyeChannelId)
    if (!channel) {
        logToSQL(`Error: Can't get the Channel / guildId : ${member.guild.id} / channelId : ${permission.goodbyeChannelId}`)
        return
    }

    if (channel.isTextBased()) {
        channel.send({
            embeds: [{ color: BOT_COLOR, title: permission.goodbyeMessage
                .replace('{user}', member.user.username)
                .replace('{server}', member.guild.name)
            }]
        })
    } else {
        logToSQL(`TypeError: Unpredictable Type / guildId : ${member.guild.id} / channelId : ${permission.goodbyeChannelId}`)
        return
    }
}
