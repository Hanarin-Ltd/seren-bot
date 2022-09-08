import { GuildMember, PartialGuildMember, userMention } from "discord.js"
import { logToSQL, BOT_COLOR } from "./lib"
import { getChannel } from "./utils/discord"
import { getGuildOption } from "./utils/guildOption"
import { getGuildLogSetting, log } from "./utils/log"

export const welcome = async (member: GuildMember) => {
    const permission = await getGuildOption(member.guild.id)
    const logSetting = await getGuildLogSetting(member.guild.id)
    if (!permission) return
    if (!permission.welcomeMessageEnabled) return

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

    logSetting?.userCreate && log({
        content: `새로운 멤버 : ${member.user.username}`,
        rawContent: `새로운 멤버 : ${userMention(member.id)}`,
        guild: member.guild,
        type: 'userCreate'
    })
}

export const goodbye = async (member: GuildMember | PartialGuildMember) => {
    const permission = await getGuildOption(member.guild.id)
    const logSetting = await getGuildLogSetting(member.guild.id)
    if (!permission) return
    if (!permission.goodbyeMessageEnabled) return

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

    logSetting?.userDelete && log({
        content: `멤버 나감 : ${member.user.username}`,
        rawContent: `멤버 나감 : ${userMention(member.id)}`,
        guild: member.guild,
        type: 'userDelete'
    })
}
