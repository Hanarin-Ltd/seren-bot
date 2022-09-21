import { CoinData, UserCoinData } from "@prisma/client"
import { AutocompleteInteraction } from "discord.js"
import prisma from "../prisma"
import { getRandomInt } from "./default"
import randomWords from 'random-words'

export const makeNewCoin = async () => {
    const name = randomWords(1)[0].toUpperCase()
    const price = getRandomInt(1000, 10000)

    await prisma.coinData.create({ data: {
        name,
        price,
    } })
}

export const getCoinList = async () => {
    return await prisma.coinData.findMany()
}

export const getCoinData = async (id: number) => {
    const exist = await prisma.coinData.findFirst({ where: { id } })
    return exist ? exist : {} as CoinData
}

export const getUserCoinData = async (userId: string) => {
    const exist = await prisma.userCoinData.findFirst({ where: { userId } })
    return exist ? exist : {} as UserCoinData
}

export const updateCoinPrice = async (id: number) => {
    const coin = await getCoinData(id)
    const priceRange = Math.floor(coin.price * (7.5 / 100))
    const currentStatus = getRandomInt(0, 1) > 0
    const price = currentStatus ? coin.price + getRandomInt(1, priceRange) : coin.price - getRandomInt(1, priceRange)

    return await prisma.coinData.update({ where: { id }, data: {
        price,
        priceHistory: [...coin.priceHistory, price]
    } })
}

export const coinNameAutoComplete = async (interaction: AutocompleteInteraction) => {
    const coins = await getCoinList()
    const focused = interaction.options.getFocused()
    const filtered = coins.filter(c => c.name.startsWith(focused))
    await interaction.respond(
        filtered.length > 0 ? filtered.map(c => ({ name: c.name, value: c.id.toString() })) : []
    )
}

export const ownedCoinAutoComplete = async (interaction: AutocompleteInteraction) => {
    const coins = await getCoinList()
    const focused = interaction.options.getFocused()
    const filtered = coins.filter(c => c.name.startsWith(focused))
    await interaction.respond(
        filtered.length > 0 ? filtered.map(c => ({ name: c.name, value: c.id.toString() })) : []
    )
}
