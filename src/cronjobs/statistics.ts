import { CronJob } from "cron"
import { client } from ".."
import prisma from "../prisma"
import { getTodayStatistics, updateTodayStatistics } from "../utils/statistics"

export default function startStatisticsCronJob() {
    const statistics = new CronJob('0 0 * * *', async () => {
        console.log(`Statistics job started at ${new Date().toString()}`)

        const todayStatistics = await getTodayStatistics()
        await updateTodayStatistics('totalGuilds', client.guilds.cache.size)
        await updateTodayStatistics('totalUsers', client.users.cache.size)

        await prisma.statistic.create({ data: {
            totalGuilds: client.guilds.cache.size,
            totalUsers: client.users.cache.size,
            totalVote: todayStatistics.totalVote,
            totalVoteOptions: todayStatistics.totalVoteOptions,
            totalWarning: todayStatistics.totalWarning,
            totalUsedPoint: todayStatistics.totalUsedPoint + todayStatistics.todayUsedPoint,
            totalUsedCommand: todayStatistics.totalUsedCommand + todayStatistics.todayUsedCommand,
            totalGambleCount: todayStatistics.totalGambleCount + todayStatistics.todayGambleCount,
        } })
    })
    
    statistics.start()
}
