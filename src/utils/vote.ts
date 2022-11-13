import prisma from "../prisma"
import { updateTodayStatistics } from "./statistics"

export const makeVote = async (id: string, authorId: string, title: string, description: string, options: string[], setting: VoteSettings) => {
    updateTodayStatistics('totalVoteOptions', prev => prev += 1)
    return await prisma.voteSetting.createMany({ data: {
        id,
        mentionEveryone: setting.mentionEveryone || false,
        hideResult: setting.hideResult || false,
        onlyAdmin: setting.onlyAdmin || false,
        allowChange: setting.allowChange || true,

        authorId,
        title,
        description,
        options,
    } })
}

export const addVote = async (targetId: string, tag: string, userId: string, value: string) => {
    updateTodayStatistics('totalVote', prev => prev += 1)
    return await prisma.voteData.create({ data: {
        targetId,
        voterId: userId,
        voterTag: tag,
        value,
    } })
}

export const updateVote = async (targetId: string, userId: string, value: string) => {
    return await prisma.voteData.updateMany({ where: {
        targetId,
        voterId: userId,
    }, data: {
        value,
    } })
}

export const removeVote = async (id: string) => {
    await prisma.voteSetting.deleteMany({ where: { id } })
    await prisma.voteData.deleteMany({ where: { targetId: id } })
}

export const getVoter = async (targetId: string, userId: string) => {
    return await prisma.voteData.findFirst({ where: {
        targetId,
        voterId: userId,
    } })
}
