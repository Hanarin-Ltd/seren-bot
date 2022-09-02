import 'dotenv/config'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname+'../.env' })

export const env = process.env

import { Client, GatewayIntentBits } from 'discord.js'
import { getCommandFunction } from './commands'
import { scanMessage } from './Commands/blockword'
import { scanMention } from './Commands/mention'
import guildSetting from './guildSetting'
import { goodbye, welcome } from './welcome'
import openSocketServer from './socket'
import { BOT_COLOR, logToSQL } from './lib'
import { addGuildChannel, removeGuildChannel, modifyGuildChannel } from './utils/channel'
import { addSlashCommands, errorMessage } from './utils/default'
import { getGuildOwner } from './utils/discord'
import { getGuildData, removeGuildData } from './utils/guildData'
import { addMemberData, removeMemberData } from './utils/memberData'
import { addMentionBlock } from './utils/mentionBlock'
import { addMod } from './utils/mod'

export const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
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
    await addMod(guild.id, await getGuildOwner(guild))
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

client.login(env.BOT_TOKEN)
