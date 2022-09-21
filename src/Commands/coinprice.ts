import { CoinData } from "@prisma/client"
import { blockQuote, bold, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { BOT_COLOR } from "../lib"
import { getCoinData } from "../utils/coin"

const getPriceInfo = (data: CoinData) => {
    const lastPrice = data.priceHistory[data.priceHistory.length - 2]
    const isDown = lastPrice > data.price
    const priceDiff = Math.abs(data.price - lastPrice)
    const priceDiffPercent = Math.floor((priceDiff / lastPrice) * 100)
    return `${data.price}포인트 (${isDown ? '▼' : '▲'} ${priceDiff})`
}

const getDiffPercent = (data: CoinData) => {
    const lastPrice = data.priceHistory[data.priceHistory.length - 2]
    const priceDiff = Math.abs(data.price - lastPrice)
    return Math.floor((priceDiff / lastPrice) * 100)
}

const priceEmbed = (data: CoinData) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':coin: 코인 가격')
        .setFields([
            { name: '이름', value: blockQuote(bold(data.name)), inline: true },
            { name: '가격', value: blockQuote(bold(getPriceInfo(data))), inline: true },
            { name: '변동폭', value: blockQuote(bold(`${getDiffPercent(data)}%`)), inline: true },
        ])
}

export default async function coinprice(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const args = interaction.options
    const coinId = parseInt(args.getString('이름')!)

    const coinData = await getCoinData(coinId)

    await interaction.editReply({ embeds: [priceEmbed(coinData)] })
}
