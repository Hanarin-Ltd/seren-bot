import { CoinData } from "@prisma/client"
import { blockQuote, bold, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { BOT_COLOR } from "../lib"
import { getCoinData, getPriceInfo } from "../utils/coin"

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

export default async function coinprice(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const args = interaction.options
    const coinId = parseInt(args.getString('이름')!)

    const coinData = await getCoinData(coinId)
    await interaction.editReply({ embeds: [priceEmbed(coinData!)] })
}
