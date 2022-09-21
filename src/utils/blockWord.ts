import { Guild } from "discord.js"
import prisma from "../prisma"
import { getGuildLogSetting, log } from "./log"

export const getBlockwordList = async (guildId: string): Promise<string[]> => {
    try {
        const result = await prisma.blockword.findFirst({ where: {
            guildId
        } })
        return result ? result.word : []
    } catch { return getBlockwordList(guildId) }
}

export const setDefaultBlockword = async (guildId: string) => {
    return await prisma.blockword.create({
        data: {
            guildId,
        }
    })
}

export const addBlockword = async (guild: Guild, word: string) => {
    try {
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
    } catch { addBlockword(guild, word) }
}

export const removeBlockword = async (guild: Guild, word: string) => {
    try {
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
    } catch { removeBlockword(guild, word) }
}

export const checkIsBlockword = async (guildId: string, word: string) => {
    const blockwordList = await getBlockwordList(guildId)
    return blockwordList.some(w => JSON.stringify(w) === JSON.stringify(word))
}