import { Statistic } from "@prisma/client"
import fetch from "node-fetch"
import { env } from "process"
import { WEB_PORT } from "../lib"
import prisma from "../prisma"

export const getTodayStatistics = async () => {
    const data = await prisma.statistic.findFirst({ orderBy: { id: 'desc' }, take: 1 })
    return data ? data : await prisma.statistic.create({ data: {} })
}

export const updateTodayStatistics = async (type: keyof Statistic, data: number | ((prev: number) => number)) => {
    const todayStatistics = await getTodayStatistics()
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
