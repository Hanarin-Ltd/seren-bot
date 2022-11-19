import startCoinCronJob from "./coin"
import startStatisticsCronJob from "./statistics"

export const timeZone = 'Asia/Seoul'

export default function startCronJobs() {
    startCoinCronJob()
    startStatisticsCronJob()
    console.log('All Cron Jobs Started')
}
