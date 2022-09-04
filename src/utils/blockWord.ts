import { Guild } from "discord.js"
import prisma from "../prisma"
import { getGuildLogSetting, log } from "./log"

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

export const addBlockword = async (guild: Guild, word: string) => {
    const logSetting = await getGuildLogSetting(guild.id)
    await prisma.blockword.updateMany({
        where: { guildId: guild.id },
        data: { word: [...await getBlockwordList(guild.id), word] },
    })
    logSetting?.addBlockword && log(`금지어 추가됨 : ${word}`, guild, 'addBlockword')
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
    logSetting?.removeBlockword && log(`금지어 제거됨 : ${word}`, guild, 'removeBlockword')
}

export const checkIsBlockword = async (guildId: string, word: string) => {
    const blockwordList = await getBlockwordList(guildId)
    return blockwordList.some(w => JSON.stringify(w) === JSON.stringify(word))
}