import { CronJob } from 'cron'
import { EmbedBuilder } from 'discord.js'
import { BOT_COLOR } from '../lib'
import { sendDM } from '../utils/discord'
import { addUserPoint, getAllUserIdList, getUserData, getUserDataPlanList, setUserGambleCount } from '../utils/userData'

export const serenPlanList = ['Free', 'Serendard', 'Seren Pass'] as const

const youGotPoint = (plan: SerenPlan, point: number) => {
    const planPoint = plan === 'Free' ? 6000 : plan === 'Serendard' ? 12000 : 20000
    return (
        new EmbedBuilder()
            .setColor(BOT_COLOR)
            .setTitle(':gift: 포인트 선물!')
            .setDescription('매주 일요일 0시마다 포인트를 선물해드려요!')
            .addFields(
                { name: '현재 플랜', value: `> **${plan}**`, inline: true },
                { name: '선물받은 포인트', value: `> **${planPoint}**`, inline: true },
                { name: '현재 포인트', value: `> **${point + planPoint}**`, inline: true }
            )
    )
}

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
    })

    weeklyPoint.start()
    resetGambleCount.start()
}
