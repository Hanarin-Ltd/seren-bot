import { GuildMember, PartialGuildMember, userMention } from "discord.js"
import { BOT_COLOR } from "./lib"
import { getChannel } from "./utils/discord"
import { getGuildOption } from "./utils/guildOption"
import { getGuildLogSetting, log } from "./utils/log"

export const welcome = async (member: GuildMember) => {
    const permission = await getGuildOption(member.guild.id)
    const logSetting = await getGuildLogSetting(member.guild.id)

    logSetting?.userCreate && log({
        content: `새로운 멤버 : ${member.user.username}`,
        rawContent: `새로운 멤버 : ${userMention(member.id)}`,
        guild: member.guild,
        type: 'userCreate'
    })

    if (!permission) return
    if (!permission.welcomeMessageEnabled) return

    const channel = await getChannel(member.guild, permission.welcomeChannelId)
    if (!channel) {
        console.log(`Error: Can't get the Channel / guildId : ${member.guild.id} / channelId : ${permission.welcomeChannelId}`)
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
        console.log(`TypeError: Unpredictable Type / guildId : ${member.guild.id} / channelId : ${permission.welcomeChannelId}`)
        return
    }
}

export const goodbye = async (member: GuildMember | PartialGuildMember) => {
    const permission = await getGuildOption(member.guild.id)
    const logSetting = await getGuildLogSetting(member.guild.id)

    logSetting?.userDelete && log({
        content: `멤버 나감 : ${member.user.username}`,
        rawContent: `멤버 나감 : ${userMention(member.id)}`,
        guild: member.guild,
        type: 'userDelete'
    })

    if (!permission) return
    if (!permission.goodbyeMessageEnabled) return

    const channel = await getChannel(member.guild, permission.goodbyeChannelId)
    if (!channel) {
        console.log(`Error: Can't get the Channel / guildId : ${member.guild.id} / channelId : ${permission.goodbyeChannelId}`)
        return
    }

    if (channel.isTextBased()) {
        channel.send({
            embeds: [{ color: BOT_COLOR, title: permission.goodbyeMessage
                .replaceAll('{user}', member.user.username)
                .replaceAll('{server}', member.guild.name)
            }]
        })
    } else {
        console.log(`TypeError: Unpredictable Type / guildId : ${member.guild.id} / channelId : ${permission.goodbyeChannelId}`)
        return
    }
}
