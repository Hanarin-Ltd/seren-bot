import { Statistic } from "@prisma/client"
import prisma from "../prisma"

export const getTodayStatistics = async () => {
    const data = await prisma.statistic.findFirst({ orderBy: { id: 'desc' }, take: 1 })
    return data ? data : await prisma.statistic.create({ data: {} })
}

export const updateTodayStatistics = async (type: keyof Statistic, data: number | ((prev: number) => number)) => {
    const todayStatistics = await getTodayStatistics()
    if (typeof data === 'number') {
        await prisma.statistic.update({ where: { id: todayStatistics.id }, data: { [type]: data } })
    } else {
        await prisma.statistic.update({ where: { id: todayStatistics.id }, data: { [type]: data(todayStatistics[type] as number) } })
    }
}
