import { bold, ChatInputCommandInteraction, codeBlock, EmbedBuilder } from "discord.js"
import { BOT_COLOR, env } from "../lib"
import { getCoinList, getPriceInfo } from "../utils/coin"

type CoinDataList = {
    name: string
    price: number
    priceDiff: number
    diffPercent: number
}[]

const youJoined = (data: CoinDataList) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setURL(`${env.SITE}/coin`)
    .setTitle(':coin: 이미 코인게임에 참가하셨습니다!')
    .setDescription(bold('Seren이 있는 모든 서버, DM채널, 심지어 웹에서도 코인게임을 즐기실 수 있습니다!'))
    .setFields([
        { name: '현재 가격', value: codeBlock('diff', data.map(d => {
            if (d.priceDiff > 0) return `+ ${d.name}: ${d.price} (+${d.priceDiff})`
            else if (d.priceDiff < 0) return `- ${d.name}: ${d.price} (${d.priceDiff})`
            else return `= ${d.name}: ${d.price}`
        }).join('\n')) }
    ])

export default async function coin(interaction: ChatInputCommandInteraction) {
    const coinList = await getCoinList()
    const coinDataList = coinList.map(c => {
        const priceInfo = getPriceInfo(c.priceHistory)
        return {
            name: c.name,
            price: c.price,
            priceDiff: priceInfo.priceDiff,
            diffPercent: priceInfo.diffPercent,
        }
    }).sort((a, b) => b.price - a.price)
    await interaction.editReply({ embeds: [youJoined(coinDataList)] })
}