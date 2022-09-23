import { CoinData } from "@prisma/client"
import { AutocompleteInteraction, EmbedBuilder } from "discord.js"
import prisma from "../prisma"
import { getRandomInt } from "./default"
import randomWords from 'random-words'
import { BOT_COLOR } from "../lib"

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

export const getOwnedCoinList = async (userId: string) => {
    const userCoinData = await getUserCoinData(userId)
    const filtered = userCoinData.filter(async d => await getCoinData(d.coinId))
    return Promise.all(filtered.map(async d => (await getCoinData(d.coinId))!))
}

export const getOwnedCoin = async (userId: string, coinId: number) => {
    const userCoinData = await getUserCoinData(userId)
    return userCoinData.find(d => d.coinId === coinId)
}

export const getCoinData = async (id: number) => (
    await prisma.coinData.findFirst({ where: { id } })
)

export const getUserCoinData = async (userId: string) => {
    return await prisma.userCoinData.findMany({ where: { userId } })
}

export const updateCoinPrice = async (id: number) => {
    const coin = await getCoinData(id)
    if (!coin) return
    const priceRange = getRandomInt(10, 1000)
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
    const coins = await getOwnedCoinList(interaction.user.id)
    const focused = interaction.options.getFocused()
    const filtered = coins.filter(c => c.name.startsWith(focused))
    await interaction.respond(
        filtered.length > 0 ? filtered.map(c => ({ name: `${c.name} - ${c.price}`, value: c.id.toString() })) : []
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
        const coinData = (await getCoinData(coinId))!
        return await prisma.userCoinData.createMany({ data: {
            userId, coinId, amount, createdAt,
            name: coinData.name,
            value: coinData.price * amount
        } })
    }
}

export const removeUserCoin = async (userId: string, coinId: number, amount: number) => {
    const userData = await getOwnedCoin(userId, coinId)
    if (!userData) return false
    if (amount >= userData.amount) {
        return await prisma.userCoinData.deleteMany({ where: { userId, coinId } })
    }
    return await prisma.userCoinData.updateMany({
        where: { userId, coinId },
        data: { amount: userData.amount - amount }
    })
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
    const priceDiff = cmp(data[dataLength-1], data[dataLength-2]) * Math.abs(data[dataLength - 1] - data[dataLength - 2])
    const diffPercent = Math.abs(priceDiff / data[dataLength-2] * 100)
    return {
        lastLowPrice: lmin,
        lastHighPrice: lmax,
        diffPercent: cmp(data[dataLength - 1], data[dataLength - 2]) * (diffPercent % 100),
        priceDiff,
    }
}

export const errorOccurredWhileTrading = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':x: **오류가 발생했습니다**')
    .setDescription('**잠시 후 다시 시도해주세요, 거래는 취소되었습니다.**')
