import { blockQuote, bold, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import fetch from "node-fetch"
import { env } from "process"
import { BOT_COLOR, WEB_PORT } from "../lib"
import { errorOccurredWhileTrading, getCoinDataAsName, getUserCoinData, removeUserCoin, userCoinIo } from "../utils/coin"
import { getCurrentDate, getCurrentTime } from "../utils/default"
import { addUserPoint, getUserData } from "../utils/userData"

interface CoinSellCommand {
    name: string
    amount: number
    price: number
    point: number
    now: Date
    plan: string
    tax: number
}

const youSelledCoin = (data: CoinSellCommand) => (
    new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setDescription(`:white_check_mark: **성공적으로 거래되었습니다!**`)
        .addFields([
            { name: '코인 이름', value: blockQuote(bold(data.name)), inline: true },
            { name: '코인 가격', value: blockQuote(bold(data.price.toString())), inline: true }
        ])
        .addFields([
            { name: '거래 개수', value: blockQuote(bold(data.amount.toString())), inline: true },
            { name: '총 수익', value: blockQuote(`${data.price * data.amount - data.tax}`), inline: true },
            { name: '수수료', value: blockQuote(`${data.plan === 'Free' ? 10 : data.plan === 'Serendard' ? 6 : 2}% (${data.tax}pt)`), inline: true },
            { name: '현재 포인트', value: blockQuote(data.point.toString()), inline: true }
        ])
        .setFooter({ text: `거래 시각: ${getCurrentDate(data.now)} ${getCurrentTime(data.now)}` })
)

export default async function coinbuy(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const coinName = args.getString('이름')!
    const amount = args.getInteger('수량')!

    const userData = await getUserData(interaction.user.id)
    const userCoinData = (await getUserCoinData(interaction.user.id)).find(coin => coin.name === coinName)!
    const coinData = (await getCoinDataAsName(coinName))!

    if (!userData) return await interaction.editReply({ embeds: [errorOccurredWhileTrading] })
    const point = userData.point
    const taxPercent = userData.currentPlan === 'Free' ? 0.1 : userData.currentPlan === 'Serendard' ? 0.06 : 0.02
    const sellTime = new Date()
    let tax = 0

    try {
        if (userCoinData.amount <= amount) {
            tax = Math.floor(coinData.price * userCoinData.amount * taxPercent)
            await removeUserCoin(interaction.user.id, coinData.id, userCoinData.amount)
            await addUserPoint(interaction.user.id, coinData.price * userCoinData.amount - tax)
            userCoinIo.emit('update', {
                amount: 0,
                point: point + coinData.price * userCoinData.amount - tax,
                coinId: coinData.id,
            })
            return await interaction.editReply({ embeds: [youSelledCoin({
                name: coinData.name,
                amount: userCoinData.amount,
                price: coinData.price,
                point: point + coinData.price * userCoinData.amount - tax,
                now: sellTime,
                plan: userData.currentPlan,
                tax: tax
            })] })
        } else if (userCoinData.amount > amount) {
            tax = Math.floor(coinData.price * amount * taxPercent)
            await removeUserCoin(interaction.user.id, coinData.id, amount)
            await addUserPoint(interaction.user.id, coinData.price * amount- tax)
        }
        const res = await fetch(`http://localhost:${WEB_PORT}/api/coin/trade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: userCoinData ? userCoinData.amount - amount : 0,
                point: point + coinData.price * amount,
                coinId: coinData.id,
                secret: env.BOT_TOKEN
            })
        }).then(res => res.json())
        
        if (res.error) return await interaction.editReply({ embeds: [errorOccurredWhileTrading] })
        return await interaction.editReply({ embeds: [youSelledCoin({
            name: coinData.name,
            amount: userCoinData.amount,
            price: coinData.price,
            point: point + coinData.price * userCoinData.amount - tax,
            now: sellTime,
            plan: userData.currentPlan,
            tax: tax
        })] })
    } catch {
        return await interaction.editReply({ embeds: [errorOccurredWhileTrading] })
    }
}
