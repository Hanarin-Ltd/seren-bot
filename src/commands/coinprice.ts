import { CoinData } from "@prisma/client"
import { blockQuote, bold, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { BOT_COLOR } from "../lib"
import { getCoinDataAsName, getPriceInfo } from "../utils/coin"

const parsePrice = (data: CoinData) => {
    const lastPrice = data.priceHistory[data.priceHistory.length - 2]
    const isDown = lastPrice > data.price
    const priceDiff = Math.abs(data.price - lastPrice)
    return `${data.price}포인트 (${isDown ? '▼' : '▲'} ${priceDiff})`
}

const priceEmbed = (data: CoinData) => {
    const priceInfo = getPriceInfo(data.priceHistory)
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':coin: 코인 가격')
        .setFields([
            { name: '이름', value: blockQuote(bold(data.name)), inline: true },
            { name: '가격', value: blockQuote(bold(parsePrice(data))), inline: true },
            { name: '변동폭', value: blockQuote(bold(`${priceInfo.diffPercent.toFixed(2)}%`)), inline: true },
        ])
}

const coinNotFound = () => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':grey_question: **코인을 찾을 수 없습니다**')
    .setDescription('없는 코인이거나 오타가 있을 수 있습니다. 다시 한번 확인해주세요!')

export default async function coinprice(interaction: ChatInputCommandInteraction) {
    const args = interaction.options
    const coinName = args.getString('이름')!

    const coinData = await getCoinDataAsName(coinName)
    if (!coinData) return await interaction.editReply({ embeds: [coinNotFound()] })
    await interaction.editReply({ embeds: [priceEmbed(coinData!)] })
}
