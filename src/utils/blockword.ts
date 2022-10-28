import { EmbedBuilder, Guild, GuildMember, Message, userMention } from "discord.js"
import { compareTwoStrings } from "string-similarity"
import { BOT_COLOR, FILTERING_MESSAGE_TYPE } from "../lib"
import prisma from "../prisma"
import { isGuildModerator } from "./discord"
import { getGuildData } from "./guildData"
import { getGuildOption, setDefaultGuildOption } from "./guildOption"
import { getGuildLogSetting, log } from "./log"
import { giveWarning } from "./warning"

export const getBlockwordList = async (guildId: string) => {
    const result = await prisma.blockword.findFirst({ where: {
        guildId
    } })
    return result ? result.word : []
}

export const getBlockwordDisabledChannel = async (guildId: string) => {
    const result = await prisma.guildOption.findFirst({ where: { guildId } })
    return result ? result.blockwordDisabledChannelId : ''
}

export const setDefaultBlockword = async (guildId: string, word: string[] = []) => {
    const exist = await prisma.blockword.findFirst({ where: { guildId } })
    if (exist) return
    return await prisma.blockword.create({
        data: {
            guildId,
            word
        }
    })
}

export const addBlockword = async (guild: Guild, word: string) => {
    const logSetting = await getGuildLogSetting(guild.id)
    await prisma.blockword.updateMany({
        where: { guildId: guild.id },
        data: { word: [...await getBlockwordList(guild.id), word] },
    })
    logSetting?.addBlockword && log({
        content: `금지어 추가됨 : ${word}`,
        rawContent: `금지어 추가됨 : ${word}`,
        guild,
        type: 'addBlockword'
    })
}

export const removeBlockword = async (guild: Guild, word: string) => {
    const wordList = await getBlockwordList(guild.id)
    const logSetting = await getGuildLogSetting(guild.id)
    if (!wordList.includes(word)) return

    wordList.splice(wordList.indexOf(word), 1)
    await prisma.blockword.updateMany({
        where: { guildId: guild.id },
        data: { word: word  }
    })
    logSetting?.removeBlockword && log({
        content: `금지어 제거됨 : ${word}`,
        rawContent: `금지어 제거됨 : ${word}`,
        guild,
        type: 'removeBlockword'
    })
}

export const checkIsBlockword = async (guildId: string, word: string) => {
    const blockwordList = await getBlockwordList(guildId)
    return blockwordList.some(w => JSON.stringify(w) === JSON.stringify(word))
}

const youUsedBlockword = (word: string[]) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':no_entry: 금지어를 사용하셨습니다.')
        .setDescription('경고가 추가됐습니다. 경고 10번시 서버에서 차단됩니다.')
        .addFields(
            { name: '사용한 금지어', 'value': word.join(', ') }
        )
}

export const scanMessage = async (message: Message) => {
    if (!FILTERING_MESSAGE_TYPE.includes(message.type)) return
    if (message.content.length < 1) return
    if (!message.channelId || !message.guildId) return

    let option = await getGuildOption(message.guildId)
    if (!option) option = await setDefaultGuildOption(message.guildId)

    if (!option.checkModsMessage) {
        if (await isGuildModerator(message.guild!, message.author as unknown as GuildMember)) return
    }

    const thisGuild = message.guild!
    const guildId = thisGuild.id
    const data = await getGuildData(guildId)
    const blockwordDisabledChannel = await getBlockwordDisabledChannel(guildId)
    if (!data) return
    if (option.useBlockwordDisabledChannel && message.channelId === blockwordDisabledChannel) return

    const blockwordList = await getBlockwordList(guildId)
    const catchedWordList: string[] = []
    const logSetting = await getGuildLogSetting(guildId)

    blockwordList.forEach(blockword => {
        const word = blockword.toLowerCase()
        
        if (message.content.toLowerCase().includes(word)) {
            catchedWordList.push(blockword)
            return
        }

        message.content.toLowerCase().split(' ').forEach(word => {
            if (data.isSubscribed && option?.useEnhancedFilter) {
                // TODO: Enhanced Filtering
                // ~/Downloads/al.js
            }
            else {
                if (compareTwoStrings(word, blockword) > 0.8) {
                    catchedWordList.push(blockword)
                    return
                }
            }
        })
    })

    if (catchedWordList.length > 0) {
        await message.delete()
        await message.author.send({ embeds: [youUsedBlockword(catchedWordList)] })
        await giveWarning(guildId, message.member!)
        logSetting?.useBlockword && await log({
            content: `금지어 사용 멤버 : ${message.member!.user.username} / 사용 금지어 : ${catchedWordList.join(', ')}`,
            rawContent: `금지어 사용 멤버 : ${userMention(message.member!.id)} / 사용 금지어 : ${catchedWordList.join(', ')}`,
            guild: thisGuild,
            type: 'useBlockword'
        })
    }
}
