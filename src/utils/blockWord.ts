import { prisma } from "../lib"

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