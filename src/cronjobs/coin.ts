import { CronJob } from "cron"
import { serenPlanList } from "../coin/weeklyPoint"
import { getUserDataPlanList, getUserData, addUserPoint, getAllUserIdList, setUserGambleCount } from "../utils/userData"

export default function startCoinCronJob() {
    const weeklyPoint = new CronJob('0 0 * * 0', async () => {
        console.log(`Weekly point job started at ${new Date().toString()}`)
        for (const plan of serenPlanList) { // foreach는 성능이 떨어짐
            const userIdList = await getUserDataPlanList(plan)
            userIdList.forEach(async userId => {
                const userData = await getUserData(userId)
                if (!userData) return
                if (userData.point >= 30000) return
                addUserPoint(userId, plan === 'Free' ? 6000 : plan === 'Serendard' ? 12000 : 20000)
                // TODO : 가입한 유저에게만 전송
                // await sendDM(userId, { embeds: [youGotPoint(plan, userData.point)] })
            })
        }
    }, null, true, 'Asia/Seoul')
    const resetGambleCount = new CronJob('0 0 * * *', async () => {
        console.log(`Reset gamble count job started at ${new Date().toString()}`)
        const userIdList = await getAllUserIdList()
        for (const userId of userIdList) {
            await setUserGambleCount(userId, 0)
        }
    }, null, true, 'Asia/Seoul')

    weeklyPoint.start()
    resetGambleCount.start()
}