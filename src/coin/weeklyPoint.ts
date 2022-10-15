import { CronJob } from 'cron'
import { addUserPoint, getUserDataPlanList } from '../utils/userData'

export const serenPlanList = ['Free', 'Serendard', 'Seren Pass'] as const

export default function startWeeklyPoint() {
    const weeklyPoint = new CronJob('0 0 * * 0', async () => {
        console.log(`Weekly point job started at ${new Date().toString()}`)
        serenPlanList.forEach(async plan => {
            const userIdList = await getUserDataPlanList(plan)
            userIdList.forEach(async userId => {
                addUserPoint(userId, plan === 'Free' ? 20000 : plan === 'Serendard' ? 50000 : 100000)
            })
        })
    }, null, true, 'Asia/Seoul')

    weeklyPoint.start()
}
