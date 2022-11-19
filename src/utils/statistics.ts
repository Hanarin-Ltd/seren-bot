import { GuildChannelStatistic, GuildInviteStatistic, GuildStatistic, MemberStatistic, Statistic } from "@prisma/client"
import fetch from "node-fetch"
import { env } from "process"
import { WEB_PORT } from "../lib"
import prisma from "../prisma"

export const getTodayBotStatistics = async () => {
    const data = await prisma.statistic.findFirst({ orderBy: { id: 'desc' }, take: 1 })
    return data ? data : await prisma.statistic.create({ data: {} })
}

export const updateTodayBotStatistics = async (type: keyof Statistic, data: number | ((prev: number) => number)) => {
    const todayStatistics = await getTodayBotStatistics()
    const changedData = typeof data === 'number' ? data : data(todayStatistics[type] as number)

    const updatedStatistics = await prisma.statistic.update({ where: { id: todayStatistics.id }, data: { [type]: changedData } })

    if (type === 'todayUsedPoint') {
        fetch(`http://localhost:${WEB_PORT}/api/statistics/point`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                today: updatedStatistics.todayUsedPoint,
                secret: env.BOT_TOKEN
            })
        })
    }
}

export const getTodayGuildStatistics = async (guildId: string) => {
    const data = await prisma.guildStatistic.findFirst({ where: { guildId }, orderBy: { uniqueId: 'desc' }, take: 1 })
    return data ? data : await prisma.guildStatistic.create({ data: { guildId } })
}

export const updateTodayGuildStatistics = async (guildId: string, type: keyof GuildStatistic, data: number | ((prev: number) => number)) => {
    const todayStatistics = await getTodayGuildStatistics(guildId)
    const changedData = typeof data === 'number' ? data : data(todayStatistics[type] as number)

    await prisma.guildStatistic.update({ where: { uniqueId: todayStatistics.uniqueId }, data: { [type]: changedData } })
}


export const getTodayMemberStatistics = async (guildId: string, userId: string) => {
    const data = await prisma.memberStatistic.findFirst({ where: { guildId, userId }, orderBy: { uniqueId: 'desc' }, take: 1 })
    return data ? data : await prisma.memberStatistic.create({ data: { guildId, userId } })
}

export const updateTodayMemberStatistics = async (guildId: string, userId: string, type: keyof MemberStatistic, data: number | ((prev: number) => number)) => {
    const todayStatistics = await getTodayMemberStatistics(guildId, userId)
    const changedData = typeof data === 'number' ? data : data(todayStatistics[type] as number)

    await prisma.memberStatistic.update({ where: { uniqueId: todayStatistics.uniqueId }, data: { [type]: changedData } })
}

export const getTodayChannelStatistics = async (guildId: string, channelId: string) => {
    const data = await prisma.guildChannelStatistic.findFirst({ where: { guildId, channelId }, orderBy: { uniqueId: 'desc' }, take: 1 })
    return data ? data : await prisma.guildChannelStatistic.create({ data: { guildId, channelId } })
}

export const updateTodayChannelStatistics = async (guildId: string, channelId: string, type: keyof GuildChannelStatistic, data: number | ((prev: number) => number)) => {
    const todayStatistics = await getTodayChannelStatistics(guildId, channelId)
    const changedData = typeof data === 'number' ? data : data(todayStatistics[type] as number)

    await prisma.guildChannelStatistic.update({ where: { uniqueId: todayStatistics.uniqueId }, data: { [type]: changedData } })
}

export const getTodayInviteStatistics = async (guildId: string, inviteCode: string) => {
    const data = await prisma.guildInviteStatistic.findFirst({ where: { guildId, inviteCode }, orderBy: { uniqueId: 'desc' }, take: 1 })
    return data ? data : await prisma.guildInviteStatistic.create({ data: { guildId, inviteCode } })
}

export const updateTodayInviteStatistics = async (guildId: string, inviteCode: string, type: keyof GuildInviteStatistic, data: number | ((prev: number) => number)) => {
    const todayStatistics = await getTodayInviteStatistics(guildId, inviteCode)
    const changedData = typeof data === 'number' ? data : data(todayStatistics[type] as number)

    await prisma.guildInviteStatistic.update({ where: { uniqueId: todayStatistics.uniqueId }, data: { [type]: changedData } })
}
