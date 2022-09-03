import 'dotenv/config'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname+'../.env' })

export const env = process.env

import { Client, GatewayIntentBits, GuildMember } from 'discord.js'
import { getCommandFunction } from './commands'
import { scanMessage } from './Commands/blockword'
import { scanMention } from './Commands/mention'
import guildSetting from './guildSetting'
import { goodbye, welcome } from './welcome'
import openSocketServer from './socket'
import { BOT_COLOR, logToSQL } from './lib'
import { addGuildChannel, removeGuildChannel, modifyGuildChannel } from './utils/channel'
import { addSlashCommands, errorMessage } from './utils/default'
import { getChannel, getGuildOwner } from './utils/discord'
import { getGuildData, removeGuildData } from './utils/guildData'
import { addMemberData, removeMemberData } from './utils/memberData'
import { addMentionBlock } from './utils/mentionBlock'
import { addMod, removeMod } from './utils/mod'
import { addBan, getBanListFromAPI, removeBan, updateBanListCache } from './utils/ban'
import { getGuildOption } from './utils/guildOption'
import { someoneHasBan, someoneHasUnban } from './Commands/ban'
import { getGuildModRole } from './utils/role'

export const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans
] })

client.on('ready', async () => {
	console.log(`Logged in as ${client.user?.tag}!`)
    console.log(`Version: ${env.VERSION} / Build: ${env.BUILD_DATE}`)
    openSocketServer()
    client.user!.setActivity('/안녕 , /도움말')

    await addSlashCommands()
})

client.on('messageCreate', async (message) => {
    if (!message.guildId) return

    scanMessage(message)
    scanMention(message)
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return
    if (!(await getGuildData(interaction.guild!.id))!.isSettingComplete) {
        await interaction.reply({ embeds: [{ color: BOT_COLOR, title: ':warning: 설정이 완료되지 않았습니다!', description: '기본 설정을 완료한뒤 봇을 사용할 수 있습니다.' }] })
        return
    }

    try {
        getCommandFunction()[interaction.commandName](interaction)
    } catch (error: any) {
        console.log(error)
        logToSQL(error)
        interaction.reply({ embeds: [errorMessage()] })
    }
})

client.on('guildCreate', async (guild) => {
    await removeGuildData(guild.id)
    await addMod(guild, await getGuildOwner(guild))
    guildSetting(guild)
})

client.on('guildDelete', async (guild) => {
    try {
        removeGuildData(guild.id)
    } catch (error: any) {
        console.log(error)
        logToSQL(error)
    }
})

client.on('guildMemberAdd', async (member) => {
    await addMemberData(member)
    await addMentionBlock(member.guild, member)
    await welcome(member)
})

client.on('guildMemberRemove', async (member) => {
    await removeMemberData(member)

    await updateBanListCache(member.guild)
    const banList = (await getBanListFromAPI(member.guild)).map(m => m.user.id)

    if (banList.includes(member.id)) {
        try {
            const option = (await getGuildOption(member.guild.id))!
            const channel = (await getChannel(member.guild, option.banChannelId))!
    
            await addBan(member.guild.id, member as GuildMember, '알 수 없음')
    
            if (!channel || !channel.isTextBased()) return
            option.banMessageEnabled && channel.send({ embeds: [someoneHasBan(member.user.username, '알 수 없음')] })
        } catch (e) {
            console.log(e)
            logToSQL(e)
        }
        return
    }
    await goodbye(member)
})

client.on('channelCreate', async (channel) => {
    await addGuildChannel(channel)
})

client.on('channelDelete', async (channel) => {
    if (channel.isDMBased()) return

    await removeGuildChannel(channel)
})

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (oldChannel.isDMBased() || newChannel.isDMBased()) return

    await modifyGuildChannel(oldChannel, newChannel)
})

client.on('guildBanRemove', async (banMember) => {
    try {
        const option = (await getGuildOption(banMember.guild.id))!
        const channel = (await getChannel(banMember.guild, option.unbanChannelId))!

        await removeBan(banMember.guild.id, banMember.user.id)

        if (!channel || !channel.isTextBased()) return
        option.unbanMessageEnabled && channel.send({ embeds: [someoneHasUnban(banMember.user.username, banMember.reason || '공개되지 않음')] })
    } catch (e) {
        logToSQL(e)
    }
})

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const modRoleId = (await getGuildModRole(newMember.guild)).id
    const thisGuild = oldMember.guild
    if (newMember.roles.cache.has(modRoleId)) {
        await addMod(thisGuild, newMember)
    } else if (!newMember.roles.cache.has(modRoleId)) {
        await removeMod(thisGuild, newMember)
    }
})

client.login(env.BOT_TOKEN)
