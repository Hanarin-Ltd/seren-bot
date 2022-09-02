import { ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, MessageOptions, MessagePayload, MessageType, PartialGuildMember, PermissionFlagsBits, REST, Routes, User, GuildChannel, GuildBasedChannel, Role } from 'discord.js'
import getCommands from './commands'
import { env } from '.'
import { Account, GuildOption, GuildPermission, MemberData, PrismaClient, GuildChannel as PGuildChannel } from '@prisma/client'
import * as bcrypt from 'bcrypt'

export const prisma = new PrismaClient()
const BOT_TOKEN: string = env.BOT_TOKEN!
export const rest = new REST({ version: '10' }).setToken(BOT_TOKEN)

// ===== Variables ===== //

export const BOT_COLOR = 0x8ed5fa
export const FILTERING_MESSAGE_TYPE = [MessageType.Default, MessageType.Reply]

// ===== Default ===== //

export const addSlashCommands = async () => {
    try {
        await rest.put(Routes.applicationCommands(env.BOT_ID!), { body: getCommands() })
    } catch (error) {
        console.error(error)
    }
}

export const getCurrentTime = (now: Date = new Date()) => {
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
}

export const getCurrentDate = (now: Date = new Date()) => {
    return `${now.getFullYear()}/${now.getMonth().toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`
}

export const errorMessage = () => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':x: 오류가 발생했습니다!')
}

export const noPermissionMessage = () => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':no_entry_sign: 권한이 없습니다.')
}

export const completeSuccessfullyMessage = () => {
    return { color: BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' }
}

export const makeRandomString = (length: number) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i<length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
   }
   return result
}

export const toJSON = (obj: any) => {
    return JSON.stringify(obj)
}

export const toObject = (string: string) => {
    return JSON.parse(string)
}

// ===== Discord API ===== //

export const updateMemberCache = async (guild: Guild) => {
    await guild.members.fetch().catch(err => {
        logToSQL(err)
        console.log(err)
    })
}

export const updateChannelCache = async (guild: Guild) => {
    await guild.channels.fetch().catch(err => {
        logToSQL(err)
        console.log(err)
    })
}

export const updateRoleCache = async (guild: Guild) => {
    await guild.roles.fetch().catch(err => {
        logToSQL(err)
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
    const data = await interaction.client.rest.get(Routes.user(id))
    return data
}

export const getMember = async (guild: Guild, id: string) => {
    await updateMemberCache(guild)
    return guild.members.cache.get(id)
}

export const sendDM = async (interaction: ChatInputCommandInteraction, message: string | MessagePayload | MessageOptions) => {
    await interaction.client.users.cache.get(interaction.user.id)?.send(message)
}

export const getChannel = async (guild: Guild, channelId: string) => {
    return guild.channels.cache.get(channelId)
}

export const isGuildMember = async (guild: Guild, user: User) => {
    return guild.members.cache.has(user.id)
}

// ===== SQL ===== //

export const getMemberData = async (memberId: string) => {
    const result = await prisma.memberData.findFirst({ where: { userId: memberId } })
    return result ? result : {} as MemberData
}

export const addMemberData = async (member: GuildMember) => {
    const exist = await prisma.memberData.findFirst({ where: { userId: member.id, guildId: member.guild.id } })
    if (exist) return

    await prisma.memberData.create({
        data: {
            userId: member.id,
            guildId: member.guild.id,
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            joinedAt: member.joinedAt ? member.joinedAt : new Date(),
            isOwner: (await getGuildOwner(member.guild)).id === member.id
        }
    })
}

export const removeMemberData = async (member: GuildMember | PartialGuildMember) => {
    await prisma.memberData.deleteMany({ where: { guildId: member.guild.id, userId: member.id } })
}

export const getModList = async (guildId: string) => {
    const modList = await prisma.memberData.findMany({ where: {
        guildId,
        mod: true
    } })
    return modList
}

export const addMod = async (guildId: string, member: GuildMember) => {
    try {
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: { mod: true },
        })
        member.permissions.add(PermissionFlagsBits.ManageGuild)
    } catch {
        await addMemberData(member)
        await addMod(guildId, member)
    }
}

export const removeMod = async (guildId: string, member: GuildMember) => {
    try {
        await addMemberData(member)
        await prisma.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: { mod: false }
        })
        member.permissions.add(PermissionFlagsBits.ManageGuild)
    } catch {
        await addMemberData(member)
        removeMod(guildId, member)
    }
}

export const getBlockwordList = async (guildId: string)=> {
    const result = await prisma.blockword.findFirst({ where: {
        guildId
    } })
    return result ? result.word : []
}

export const setDefaultBlockword = async (guildId: string) => {
    return await prisma.blockword.create({
        data: {
            guildId,
        }
    })
}

export const addBlockword = async (guildId: string, word: string) => {
    await prisma.blockword.updateMany({
        where: { guildId },
        data: { word: [...await getBlockwordList(guildId), word] },
    })
}

export const removeBlockword = async (guildId: string, word: string) => {
    const wordList = await getBlockwordList(guildId)
    if (!wordList.includes(word)) return

    wordList.splice(wordList.indexOf(word), 1)
    await prisma.blockword.updateMany({
        where: { guildId },
        data: { word: word  }
    })
}

export const checkIsBlockword = async (guildId: string, word: string) => {
    const blockwordList = await getBlockwordList(guildId)
    return blockwordList.some(w => JSON.stringify(w) === JSON.stringify(word))
}

export const getUserData = async (userId: string) => {
    const result = await prisma.userData.findUnique({ where: { id: userId } })
    return result ? result : {}
}

export const getMentionBlockList = async (guildId: string) => {
    const result = await prisma.memberData.findMany({ where: {
        guildId,
        mentionBlock: true
    } })
    return result
}

export const addMentionBlock = async (guild: Guild, member: GuildMember) => {
    try {
        await prisma.memberData.updateMany({
            where: { guildId: guild.id, userId: member.id },
            data: { mentionBlock: true },
        })
        member.permissions.remove('MentionEveryone')
    } catch {
        await addMemberData(member)
    }
}

export const removeMentionBlock = async (guildId: string, member: GuildMember) => {
    member.permissions.add('MentionEveryone')
    await prisma.memberData.updateMany({
        where: { guildId, userId: member.id },
        data: { mentionBlock: false }
    })
}

export const isMentionBlock = async (guildId: string, member: GuildMember) => {
    const mentionBlockList = await getMentionBlockList(guildId)
    return mentionBlockList.some(m => m.userId === member.id)
}

export const getBanList = async (guildId: string) => {
    const result = await prisma.guildBan.findMany({ where: { guildId } })
    return result
}

export const getBannedGuildList = async (userId: string) => {
    const result = await prisma.userData.findUnique({ where: { id: userId } })
    return result ? result.bannedGuild : []
}

export const addBan = async (guildId: string, member: GuildMember, reason: string) => {
    await prisma.guildBan.create({
        data: {
            userId: member.id,
            guildId,
            username: member.user.username,
            nickname: member.nickname ? member.nickname : member.user.username,
            tag: member.user.tag,
            reason: reason
        }
    })

    const list =  [...await getBannedGuildList(member.user.id), guildId]
    await prisma.userData.upsert({
        where: { id: member.user.id },
        update: { bannedGuild: list },
        create: {
            id: member.id,
            username: member.user.username,
            tag: member.user.tag,
            profileImg: member.displayAvatarURL(),
            bannedGuild: list
        }
    })
}

export const removeBan = async (guildId: string, userId: string) => {
    await prisma.guildBan.deleteMany({ where: { guildId, userId } })

    const bannedGuild = await getBannedGuildList(userId)
    if (!bannedGuild.includes(guildId)) return
    bannedGuild.splice(bannedGuild.indexOf(guildId), 1)
    
    await prisma.userData.update({
        where: { id: userId },
        data: { bannedGuild: bannedGuild }
    })
}

export const getWarning = async (guildId: string, memberId: string) => {
    const result = await prisma.memberData.findFirst({ where: {
        guildId,
        userId: memberId,
    } })
    return result ? result.warning : 0
}

export const getWarningList = async (guildId: string) => {
    const data = await prisma.memberData.findMany({ where: { guildId } })
    return data.filter(m => m.warning > 0)
}

export const giveWarning = async (guildId: string, member: GuildMember, num = 1) => {
    const exist = await getMemberData(member.id)
    try {
        await prisma.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: {
                warning: exist.warning + num
            }
        })
    } catch {
        await addMemberData(member)
        await giveWarning(guildId, member, num)
    }
}

export const removeWarning = async (guildId: string, memberId: string, num = 1) => {
    await prisma.memberData.updateMany({
        where: { guildId, userId: memberId },
        data: {
            warning: (await getWarning(guildId, memberId))! - num
        }
    })
}

export const appendAccount = async (account: Account) => {
    try {
        await prisma.account.create({
            data: {
                userId: account.userId,
                guildId: account.guildId,
                password: bcrypt.hashSync(account.password, 10),
                username: account.username,
                tag: account.tag
            }
        })
    } catch { return }
}

export const removeAccount = async (guildId: string) => {
    await prisma.account.deleteMany({ where: { guildId } })
}

export const getGuildData = async (guildId: string) => {
    return await prisma.guildData.findUnique({ where: { guildId } })
}

export const addOrUpdateGuildData = async (guild: Guild) => {
    await prisma.guildData.upsert({
        where: { guildId: guild.id },
        update: {},
        create: {
            guildId: guild.id,
            name: guild.name
        }
    })
}

export const removeGuildData = async (guildId: string) => {
    try {
        await prisma.guildData.deleteMany({ where: { guildId } })
        await prisma.guildBan.deleteMany({ where: { guildId } })
        await prisma.guildChannel.deleteMany({ where: { guildId } })
        await prisma.guildOption.deleteMany({ where: { guildId } })
        await prisma.guildPermission.deleteMany({ where: { guildId } })
        await prisma.blockword.deleteMany({ where: { guildId } })
        await prisma.memberData.deleteMany({ where: { guildId } })
        await prisma.guildRole.deleteMany({ where: { guildId } })
    } catch (err: any) {
        logToSQL(err)
    }
}

export const getGuildPermission = async (guildId: string) => {
    return await prisma.guildPermission.findUnique({ where: { guildId } })
}

export const setDefaultGuildPermission = async (guildId: string) => {
    return await prisma.guildPermission.create({
        data: {
            guildId
        }
    })
}

export const modifyGuildPermission = async (data: GuildPermission) => {
    return await prisma.guildPermission.update({
        where: { guildId: data.guildId },
        data
    })
}

export const getGuildOption = async (guildId: string) => {
    return await prisma.guildOption.findUnique({ where: { guildId } })
}

export const setDefaultGuildOption = async (guildId: string) => {
    return await prisma.guildOption.create({
        data: {
            guildId
        }
    })
}

export const modifyGuildOption = async (data: GuildOption) => {
    return await prisma.guildOption.update({
        where: { guildId: data.guildId },
        data
    })
}

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

export const addAllGuildRole = async (guild: Guild) => {
    await updateRoleCache(guild)

    await prisma.guildRole.deleteMany({ where: { guildId: guild.id } })
    guild.roles.cache.forEach(async r => {
        await addGuildRole(r)
    })
}

export const addGuildRole = async (role: Role) => {
    if (role.name === '@everyone') return
    return await prisma.guildRole.createMany({ data: {
        id: role.id,
        name: role.name,
        guildId: role.guild.id,
    }, skipDuplicates: true })
}

export const getGuildModRole = async (guild: Guild) => {
    return await prisma.guildRole.findFirst({ where: { guildId: guild.id, type: 'mod' } })
}

export const removeGuildRole = async (role: Role) => {
    return await prisma.guildRole.deleteMany({ where: { guildId: role.guild.id, id: role.id } })
}

export const modifyGuildRole = async (oldRole: Role, newRole: Role) => {
    return await prisma.guildRole.updateMany({
        where: { guildId: oldRole.guild.id, id: oldRole.id },
        data: {
            name: newRole.name,
            guildId: newRole.guild.id,
        }
    })
}

export const setRoleToMod = async (role: Role) => {
    role.setPermissions(PermissionFlagsBits.Administrator)
    return await prisma.guildRole.update({
        where: { id: role.id },
        data: { type: 'mod' }
    })
}

// ===== Log System ===== //

export const logToSQL = async (content: any) => {
    await prisma.errorLog.create({
        data: {
            content
        }
    })
}
