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

export const deleteCoin = async (id: number) => {
    await prisma.coinData.delete({ where: { id } })
    await prisma.userCoinData.deleteMany({ where: { coinId: id } })

    await makeNewCoin()
}

export const getCoinList = async () => {
    return await prisma.coinData.findMany()
}

export const getCoinData = async (id: number) => {
    const exist = await prisma.coinData.findFirst({ where: { id } })
    return exist ? exist : {} as CoinData
}

export const getUserCoinData = async (userId: string) => {
    return await prisma.userCoinData.findMany({ where: { userId } })
}

export const updateCoinPrice = async (id: number) => {
    const coin = await getCoinData(id)
    const priceRange = Math.floor(coin.price * (7.5 / 100))
    const currentStatus = getRandomInt(0, 1) > 0
    const price = currentStatus ? coin.price + getRandomInt(1, priceRange) : coin.price - getRandomInt(1, priceRange)

    if (price <= 0) {
        return await deleteCoin(id)
    }

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
        filtered.length > 0 ? filtered.map(c => ({ name: `${c.name} - ${c.price}pt`, value: c.id.toString() })) : []
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

export const addUserCoin = async (userId: string, coinId: number, amount: number, createdAt: Date) => {
    const userData = await prisma.userCoinData.findFirst({ where: { userId, coinId } })
    if (userData) {
        return await prisma.userCoinData.updateMany({
            where: { userId, coinId },
            data: { amount: userData.amount + amount, createdAt }
        })
    } else {
        const coinData = await getCoinData(coinId)
        return await prisma.userCoinData.createMany({ data: {
            userId, coinId, amount, createdAt,
            name: coinData.name,
            value: coinData.price * amount
        } })
    }
}

// Algorithm Made by @smartwe, Refactored by @cottons-kr
export const getPriceInfo = (data: number[]) => {
    const cmp = (n1: number, n2: number) => n1 >= n2 ? 1 : -1
    const dataLength = data.length
    let max: number = 0
    let min: number = 0
    let lmax: number = 0
    let lmin: number = 0

    for (let i = 0; i < dataLength + 1; i++) {
        if (i === 0) {
            max = data[i]
            min = data[i]
            continue
        }
        if (i === dataLength) {
            if (data[i-1] >= data[i-2]) {
                lmax = data[i-1]
                break
            } else break
        }
        if (data[i] >= max) max = data[i]
        else {
            lmax = data[i-1]
            max = 0
        }
        if (data[i] <= min) min = data[i]
        else {
            lmin = data[i-1]
            min = Infinity
        }
    }
    const priceDiff = cmp(data[dataLength-1], data[dataLength-2]) * (data[dataLength - 1] - data[dataLength - 2])
    const diffPercent = data[dataLength-1] / data[dataLength-2] * 100
    return {
        lastLowPrice: lmin,
        lastHighPrice: lmax,
        diffPercent: cmp(data[dataLength - 1], data[dataLength - 2]) * (diffPercent % 100),
        priceDiff,
    }
}
