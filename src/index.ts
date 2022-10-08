import 'dotenv/config'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname+'../.env' })

export const env = process.env

import { ChannelType, Client, GatewayIntentBits, GuildMember, userMention } from 'discord.js'
import { getCommandFunction, usableInDM } from './commands'
import { scanMessage } from './Commands/blockword'
import guildSetting from './guildSetting'
import { goodbye, welcome } from './welcome'
import openAPIServer from './guildApi'
import { BOT_COLOR } from './lib'
import { addGuildChannel, removeGuildChannel, modifyGuildChannel } from './utils/channel'
import { addSlashCommands, errorMessage } from './utils/default'
import { getChannel, getGuildOwner } from './utils/discord'
import { addOrUpdateGuildData, getGuildData, removeGuildData } from './utils/guildData'
import { addMemberData, removeMemberData, updateMemberData } from './utils/memberData'
import { addMod, removeMod } from './utils/mod'
import { addBan, getBanListFromAPI, removeBan, updateBanListCache } from './utils/ban'
import { getGuildOption } from './utils/guildOption'
import { someoneHasBan, someoneHasUnban } from './Commands/ban'
import { getGuildModRole, getGuildRole } from './utils/role'
import { getGuildLogSetting, log } from './utils/log'
import { addMemberExp, checkLevelUp } from './utils/level'
import { coinNameAutoComplete, ownedCoinAutoComplete } from './utils/coin'
import coinGame from './coin/coin'
import { addUserData, getUserData } from './utils/userData'

export const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessageTyping
] })

client.on('ready', async () => {
	console.log(`Logged in as ${client.user?.tag}!`)
    console.log(`Version: ${env.VERSION} / Build: ${env.BUILD_DATE}`)
    openAPIServer()
    coinGame()
    client.user!.setActivity('/안녕 , /도움말')

    await addSlashCommands()
})

client.on('messageCreate', async (message) => {
    try {
        if (!message.guild) return
        if (!message.member) return
        if (message.author.bot) return
        if (!message.channel || message.channel.type !== ChannelType.GuildText) return
        scanMessage(message)
        await addMemberExp(message.member!, 10)
        await checkLevelUp(message.member!, message.channel)

        const exist = await getUserData(message.author.id)
        if (!exist) await addUserData(message.author.id)
    } catch { return }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isAutocomplete()) {
        switch (interaction.commandName) {
            case '코인가격': { coinNameAutoComplete(interaction); break }
            case '코인구매': { coinNameAutoComplete(interaction); break }
            case '코인판매': { ownedCoinAutoComplete(interaction); break }
            case '코인댓글': { coinNameAutoComplete(interaction); break }
        }
    }
    else if (interaction.isChatInputCommand()) {
        if (usableInDM.includes(interaction.commandName) && !interaction.channel) {
            try {
                return getCommandFunction()[interaction.commandName](interaction)
            } catch (error: any) {
                console.log(error)
                return interaction.reply({ embeds: [errorMessage()] })
            }
        } else {
            if (!(await getGuildData(interaction.guild!.id))!.isSettingComplete) {
                await interaction.reply({ embeds: [{ color: BOT_COLOR, title: ':warning: 설정이 완료되지 않았습니다!', description: '기본 설정을 완료한뒤 봇을 사용할 수 있습니다.' }] })
                return
            }
        
            const logSetting = await getGuildLogSetting(interaction.guild!.id)
        
            try {
                getCommandFunction()[interaction.commandName](interaction)
                logSetting?.useCommand && log({
                    content: `명령어 사용 : ${interaction.member!.user.username} / 사용한 명령어 : ${interaction.commandName}`,
                    rawContent: `명령어 사용 : ${interaction.member} / 사용한 명령어 : ${interaction.commandName}`,
                    guild: interaction.guild!,
                    type: 'useCommand'
                })
                await addMemberExp(interaction.member! as GuildMember, 5)
                if (interaction.channel!.isDMBased()) return
                if (interaction.channel!.type !== ChannelType.GuildText) return
                await checkLevelUp(interaction.member! as GuildMember, interaction.channel!)
            } catch (error: any) {
                console.log(error)
                interaction.reply({ embeds: [errorMessage()] })
            }
        }
    }
})

client.on('guildCreate', async (guild) => {
    await removeGuildData(guild.id)
    await addMod(guild, await getGuildOwner(guild))
    guildSetting(guild)
    guild.roles.everyone.permissions.remove('MentionEveryone')
})

client.on('guildDelete', async (guild) => {
    try {
        removeGuildData(guild.id)
    } catch (error: any) {
        console.log(error)
    }
})

client.on('guildMemberAdd', async (member) => {
    await addMemberData(member)
    await welcome(member)
})

client.on('guildMemberRemove', async (member) => {
    if (member.id === client.user?.id) return
    await removeMemberData(member)

    await updateBanListCache(member.guild)
    const banList = (await getBanListFromAPI(member.guild)).map(m => m.user.id)

    if (banList.includes(member.id)) {
        try {
            const option = (await getGuildOption(member.guild.id))!
            const channel = (await getChannel(member.guild, option.banChannelId))!
            const logSetting = await getGuildLogSetting(member.guild.id)
    
            await addBan(member.guild.id, member as GuildMember, '알 수 없음')
    
            if (!channel || !channel.isTextBased()) return
            option.banMessageEnabled && channel.send({ embeds: [someoneHasBan(member.user.username, '알 수 없음')] })
            logSetting?.addBan && log({
                content: `차단 추가됨 : ${member.user.username}`,
                rawContent: `차단 추가됨 : ${userMention(member.user.id)}`,
                guild: member.guild,
                type: 'addBan'
            })
        } catch (e) {
            console.log(e)
        }
        return
    }
    await goodbye(member)
})

client.on('channelCreate', async (channel) => {
    if (channel.isDMBased()) return
    
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

client.on('guildBanAdd', async (banMember) => {
    if (banMember.user.id === client.user?.id) return
    try {
        const thisGuild = banMember.guild
        const option = (await getGuildOption(thisGuild.id))!
        const logSetting = await getGuildLogSetting(thisGuild.id)
        const channel = await getChannel(thisGuild, option.banChannelId)

        logSetting?.addBan && log({
            content: `차단 추가됨 : ${banMember.user.username}`,
            rawContent: `차단 추가됨 : ${userMention(banMember.user.id)}`,
            guild: thisGuild,
            type: 'addBan'
        })

        if (!channel || !channel.isTextBased()) return
        option.banMessageEnabled && channel.send({ embeds: [someoneHasBan(banMember.user.username, banMember.reason || '공개되지 않음')] })
    } catch (e) { console.log(e) }
})

client.on('guildBanRemove', async (banMember) => {
    try {
        const thisGuild = banMember.guild
        const option = (await getGuildOption(thisGuild.id))!
        const logSetting = await getGuildLogSetting(thisGuild.id)
        const channel = await getChannel(thisGuild, option.banChannelId)

        await removeBan(thisGuild.id, banMember.user.id)

        logSetting?.removeBan && log({
            content: `차단 해제됨 : ${banMember.user.username}`,
            rawContent: `차단 해제됨 : ${userMention(banMember.user.id)}`,
            guild: thisGuild,
            type: 'removeBan'
        })

        if (!channel || !channel.isTextBased()) return
        option.unbanMessageEnabled && channel.send({ embeds: [someoneHasUnban(banMember.user.username, banMember.reason || '공개되지 않음')] })

    } catch (e) { console.log(e) }
})

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.user.id === client.user?.id) return
    console.log('updated')

    await updateMemberData(newMember)
    try {
        const modRoleId = (await getGuildModRole(newMember.guild)).id
        const thisGuild = oldMember.guild

        if (newMember.roles.cache.has(modRoleId)) {
            await addMod(thisGuild, newMember)
        } else if (!newMember.roles.cache.has(modRoleId)) {
            await removeMod(thisGuild, newMember)
        }

        const logSetting = (await getGuildLogSetting(newMember.guild.id))!
        const oldRoles = oldMember.roles.cache.map(r => r.id)
        const newRoles = newMember.roles.cache.map(r => r.id)

        const deletedRole = oldRoles.filter(r => !newRoles.includes(r))
        const addedRole = newRoles.filter(r => !oldRoles.includes(r))

        deletedRole.forEach(async id => {
            const role = (await getGuildRole(thisGuild, id))!
            logSetting?.removeRoleToMember && log({
                content: `역할 제거됨 : ${newMember.user.username} / 제거된 역할 : ${role.name}`,
                rawContent: `역할 제거됨 : ${userMention(newMember.id)} / 제거된 역할 : ${role.name}`,
                guild: thisGuild,
                type: 'removeRoleToMember'
            })
        })
        addedRole.forEach(async id => {
            const role = (await getGuildRole(thisGuild, id))!
            logSetting?.addRoleToMember && log({
                content: `역할 추가됨 : ${newMember.user.username} / 추가된 역할 : ${role.name}`,
                rawContent: `역할 추가됨 : ${userMention(newMember.id)} / 추가된 역할 : ${role.name}`,
                guild: thisGuild,
                type: 'addRoleToMember'
            })
        })
    } catch {
        return
    }
})

client.on('guildUpdate', async (oldGuild, newGuild) => {
    await addOrUpdateGuildData(newGuild)
})

client.on('messageDelete', async (message) => { 
    try {
        if (!message.guild) return
        const logSetting = await getGuildLogSetting(message.guildId!)
        logSetting?.removeMessage && log({
            content: `메세지 삭제됨 / 메세지 작성자 : ${message.member!.user.username} / 내용 : ${message.content || '알 수 없음 (null)'}`,
            rawContent: `메세지 삭제됨 / 메세지 작성자 : ${userMention(message.member!.id)} / 내용 : ${message.content || '알 수 없음 (null)'}`,
            guild: message.guild,
            type: 'removeMessage'
        })
    } catch { return }
})

client.login(env.BOT_TOKEN)
