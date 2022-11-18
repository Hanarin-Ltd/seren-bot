import { GuildLogSetting } from "@prisma/client"
import { AutocompleteInteraction, EmbedBuilder, Guild } from "discord.js"
import { BOT_COLOR } from "../lib"
import prisma from "../prisma"
import { chunkArray, getCurrentDate, getCurrentTime } from "./default"
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

export const log = async ({ content, guild, type }: { content: string, guild: Guild, type: keyof GuildLogSetting }) => {
    const option = await getGuildOption(guild.id)
    const logSetting = await getGuildLogSetting(guild.id)
    if (!option || !option.logEnabled || !logSetting || !logSetting[type]) return
    const logChannel = await getChannel(guild, option.logChannelId)
    if (!logChannel) return
    const createdAt = new Date()
    if (logChannel.isTextBased()) logChannel.send({ embeds: [logEmbed(content, createdAt)] })
    return await prisma.guildLog.create({
        data: {
            guildId: guild.id,
            content,
            type,
            createdAt
        }
    })
}

export const logName: { [key: string]: string } = {
    'userCreate': '멤버 입장',
    'userDelete': '멤버 퇴장',
    'addMod': '관리자 임명',
    'removeMod': '관리자 해임',
    'useCommand': '명령어 사용',
    'useBlockword': '금지어 사용',
    'addBlockword': '금지어 추가',
    'removeBlockword': '금지어 제거',
    'removeMessage': '메세지 삭제',
    'levelUp': '레벨업',
    'addRoleToMember': '멤버에게 역할 부여',
    'removeRoleToMember': '멤버에게 역할 제거',
    'roleCreate': '역할 생성',
    'roleDelete': '역할 삭제',
    'roleUpdate': '역할 수정',
    'addBan': '멤버 차단(밴)',
    'removeBan': '멤버 차단 해제(언밴)',
    'getWarning': '경고 추가',
    'removeWarning': '경고 제거',
    'threadCreate': '스레드 생성',
    'threadDelete': '스레드 삭제',
    'threadMemberUpdate': '스레드 멤버 변동',
    'threadUpdate': '스레드 수정',
    'emojiCreate': '이모지 생성',
    'emojiDelete': '이모지 삭제',
    'emojiUpdate': '이모지 수정',
    'guildScheduledEventCreate': '이벤트 생성',
    'guildScheduledEventDelete': '이벤트 삭제',
    'guildScheduledEventUpdate': '이벤트 수정',
    'guildScheduledEventUserAdd': '멤버가 이벤트 참가',
    'guildScheduledEventUserRemove': '멤버가 이벤트 퇴장',
    'inviteCreate': '초대링크 생성',
    'inviteDelete': '초대링크 삭제',
}

export const logTypeAutoComplete = async (interaction: AutocompleteInteraction) => {
    if (!interaction.guildId) return
    const logSetting = await getGuildLogSetting(interaction.guildId!)
    if (!logSetting) return

    let filtered: string[] = []
    const logType = Object.keys(logSetting).filter(key => typeof logSetting[key as keyof GuildLogSetting] === 'boolean')
    const focused = interaction.options.getFocused().toLowerCase()
    filtered = [
        ...filtered,
        ...logType.filter(log => logName[log].toLowerCase().includes(focused)),
        ...logType.filter(log => log.toLowerCase().includes(focused))
    ].slice(0, 25)
    await interaction.respond(
        filtered.length > 0 ? filtered.map(log => ({ name: logName[log], value: log })) : []
    )
}
