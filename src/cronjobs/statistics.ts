import { CronJob } from "cron"
import { client } from ".."
import prisma from "../prisma"
import { getBanListFromSQL } from "../utils/ban"
import { getAllGuildChannelIdList } from "../utils/channel"
import { getAllGuildIdList, getGuildAllInvite } from "../utils/discord"
import { getAllMemberIdList } from "../utils/memberData"
import { getTodayBotStatistics, getTodayChannelStatistics, getTodayGuildStatistics, getTodayMemberStatistics, updateTodayBotStatistics } from "../utils/statistics"
import { getGuildWarnings } from "../utils/warning"

export default function startStatisticsCronJob() {
    const botStatistics = new CronJob('0 0 * * *', async () => {
        console.log(`Statistics job started at ${new Date().toString()}`)

        const todayStatistics = await getTodayBotStatistics()
        await updateTodayBotStatistics('totalGuilds', client.guilds.cache.size)
        await updateTodayBotStatistics('totalUsers', client.users.cache.size)

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
    }, null, true, 'Asia/Seoul')

    const guildStatisticsPerDay = new CronJob('0 0 * * *', async () => {
        console.log(`Guild Statistics per Day job started at ${new Date().toString()}`)
        const allGuildIdList = await getAllGuildIdList()
        for (const guildId of allGuildIdList) {
            const guild = client.guilds.cache.get(guildId)
            if (!guild) continue
            const guildStatistics = await getTodayGuildStatistics(guildId)
            await prisma.guildStatistic.create({ data: {
                guildId,
                totalUsers: guild.memberCount,
                totalUsedCommands: guildStatistics.totalUsedCommands + guildStatistics.todayUsedCommands,
                totalWarnings: await getGuildWarnings(guildId),
                totalBans: await getBanListFromSQL(guildId).then(list => list.length),
            } })
        }
    }, null, true, 'Asia/Seoul')

    const memberStatisticsPerDay = new CronJob('0 0 * * *', async () => {
        console.log(`Member Statistics per Day job started at ${new Date().toString()}`)
        const allGuildIdList = await getAllGuildIdList()
        for (const guildId of allGuildIdList) {
            const guild = client.guilds.cache.get(guildId)
            if (!guild) continue
            const memberIdList = await getAllMemberIdList(guildId)
            for (const memberId of memberIdList) {
                const memberStatistics = await getTodayMemberStatistics(guildId, memberId)
                await prisma.memberStatistic.create({ data: {
                    guildId,
                    userId: memberId,
                    totalUsedCommands: memberStatistics.totalUsedCommands + memberStatistics.todayUsedCommands,
                    totalWarnings: memberStatistics.totalWarnings + memberStatistics.todayWarnings,
                } })
            }
        }
    }, null, true, 'Asia/Seoul')

    const channelStatisticsPerDay = new CronJob('0 0 * * *', async () => {
        console.log(`Channel Statistics per Day job started at ${new Date().toString()}`)
        const allGuildIdList = await getAllGuildIdList()
        for (const guildId of allGuildIdList) {
            const guild = client.guilds.cache.get(guildId)
            if (!guild) continue
            const channelIdList = await getAllGuildChannelIdList(guildId)
            for (const channelId of channelIdList) {
                const channelStatistics = await getTodayChannelStatistics(guildId, channelId)
                await prisma.guildChannelStatistic.create({ data: {
                    guildId,
                    channelId,
                    totalMessages: channelStatistics.totalMessages + channelStatistics.todayMessages,
                } })
            }
        }
    }, null, true, 'Asia/Seoul')

    const inviteStatistics = new CronJob('0 0 * * *', async () => {
        console.log(`Invite Statistics job started at ${new Date().toString()}`)
        const allGuildIdList = await getAllGuildIdList()
        for (const guildId of allGuildIdList) {
            const guild = client.guilds.cache.get(guildId)
            if (!guild) continue
            const inviteList = await getGuildAllInvite(guild)
            for (const invite of inviteList) {
                await prisma.guildInviteStatistic.create({ data: {
                    guildId,
                    inviteCode: invite.code,
                    totalUses: invite.uses || 0,
                } })
            }
        }
    }, null, true, 'Asia/Seoul')
    
    botStatistics.start()
    guildStatisticsPerDay.start()
    memberStatisticsPerDay.start()
    channelStatisticsPerDay.start()
    inviteStatistics.start()
}
