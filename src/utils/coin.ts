import { AutocompleteInteraction, EmbedBuilder } from "discord.js"
import prisma from "../prisma"
import { abs, getRandomInt, getRandomItem, isSameArray } from "./default"
import randomWords from 'random-words'
import { BOT_COLOR, env, WEB_PORT } from "../lib"
import { Server } from "socket.io"
import { createServer } from "http"
import { client } from ".."
import fetch from "node-fetch"
import { sendDM } from "./discord"
import { updateTodayBotStatistics } from "./statistics"

const cmp = (n1: number, n2: number) => n1 >= n2 ? 1 : -1

const IO_PORT = env.NODE_ENV === 'production' ? 7428 : 5878 as const

export const userCoinIo = new Server(createServer(), {
    cors: {
        origin: [env.SITE!]
    }
}).listen(IO_PORT)

export const makeNewCoin = async () => {
    const name = randomWords(1)[0].toUpperCase()
    const price = getRandomInt(1000, 10000)

    const data = await prisma.coinData.create({ data: {
        name,
        price,
    } })
    const priceInfo = getPriceInfo(data.priceHistory)
    await fetch(`http://localhost:${WEB_PORT}/api/coin/price`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'create',
            ...data,
            priceHistory: data.priceHistory.slice(-50),
            priceDiff: priceInfo.priceDiff,
            diffPercent: priceInfo.diffPercent.toFixed(2),
            secret: env.BOT_TOKEN
        })
    })
}

export const deleteCoin = async (id: number) => {
    const users = await prisma.userCoinData.findMany({ where: { coinId: id } })
    const coin = (await prisma.coinData.findUnique({ where: { id } }))!
    await prisma.coinData.delete({ where: { id } })
    await prisma.userCoinData.deleteMany({ where: { coinId: id } })
    users.forEach(async u => {
        const user = await client.users.fetch(u.userId)
        await sendDM(u.userId, { embeds: [{
            color: BOT_COLOR,
            title: `:cry: 아쉽게도 ${user.username} 님의 ${coin.name}이(가) 삭제되었습니다.`,
            description: `코인의 가격이 0원 이하로 내려가면 자동으로 삭제됩니다.`
        }] })
    })
    await fetch(`http://localhost:${WEB_PORT}/api/coin/price`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'delete',
            id,
            secret: env.BOT_TOKEN,
        })
    })
    
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

export const getCoinData = async (id: number) => {
    return await prisma.coinData.findFirst({ where: { id } })
}

export const getCoinDataAsName = async (name: string) => {
    const list = await getCoinList()
    return list.find(c => c.name.toLowerCase() === name.toLowerCase())
}

export const getUserCoinData = async (userId: string) => {
    return await prisma.userCoinData.findMany({ where: { userId } })
}

// Algorithm Made by @smartwe, Refactored by @cottons-kr
export const updateCoinPrice = async (id: number) => {
    const coin = await getCoinData(id)
    if (!coin) return
    const data = coin.priceHistory
    let dataLength = data.length
    if (dataLength === 0) {
        dataLength++
        data.push(coin.price)
    }

    const priceHistory: number[] = []
    for (let i = 0; i < dataLength - 1; i++) {
        let diffPercent = 0
        let diff = cmp(data[i], data[i+1]) * abs(data[i+1] - data[i])
        if (diff === 0) diffPercent = 0
        else diffPercent = cmp(data[i+1], data[i]) * (abs(diff / data[i] * 100) % 100)
        priceHistory.push(diffPercent)
    }
    let c1 = []
    let c2 = []
    const randomPer = getRandomInt(abs(abs(priceHistory[dataLength - 2] - 60)), abs(priceHistory[dataLength - 2]))
    if (priceHistory[dataLength-2] >= 0) 
        c1 = getRandomItem([1, 2], [randomPer, abs(100 - randomPer)])
    else
        c1 = getRandomItem([1, 2], [abs(100 - randomPer), randomPer])
    c2 = getRandomItem([1, 2, 3], [99, 0.8, 0.2])
    let amt = 0
    if (isSameArray(c2, [1])) amt = getRandomInt(1, 300)
    else if (isSameArray(c2, [2])) amt = getRandomInt(300, 800)
    else amt = getRandomInt(800, 1350)

    if (isSameArray(c1, [1])) {
        return await prisma.coinData.update({ where: { id }, data: {
            price: data[dataLength-1] + amt,
            priceHistory: [...data, data[dataLength-1] + amt]
        } })
    } else {
        if ((data[dataLength-1] - amt) <= 0) {
            return await deleteCoin(id)
        }
        return await prisma.coinData.update({ where: { id }, data: {
            price: data[dataLength-1] - amt,
            priceHistory: [...data, data[dataLength-1] - amt]
        } })
    }
}

export const coinNameAutoComplete = async (interaction: AutocompleteInteraction) => {
    const coins = await getCoinList()
    const focused = interaction.options.getFocused().toLowerCase()
    const filtered = coins.filter(c => c.name.toLowerCase().includes(focused))
    await interaction.respond(
        filtered.length > 0 ? filtered.map(c => ({ name: `${c.name} - ${c.price}pt`, value: c.name })).slice(0, 25) : []
    )
}

export const ownedCoinAutoComplete = async (interaction: AutocompleteInteraction) => {
    const coins = await getOwnedCoinList(interaction.user.id)
    const focused = interaction.options.getFocused().toLowerCase()
    const filtered = coins.filter(c => c.name.toLowerCase().includes(focused))
    await interaction.respond(
        filtered.length > 0 ? filtered.map(c => ({ name: `${c.name} - ${c.price}`, value: c.name })).slice(0, 25) : []
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
    const priceDiff = cmp(data[dataLength-1], data[dataLength-2]) * abs(data[dataLength - 1] - data[dataLength - 2])
    const diffPercent = abs(priceDiff / data[dataLength-2] * 100)
    return {
        lastLowPrice: lmin,
        lastHighPrice: lmax,
        diffPercent: cmp(data[dataLength - 1], data[dataLength - 2]) * (diffPercent % 100),
        priceDiff,
    }
}

export const addCoinComment = async (coinId: number, userId: string, content: string) => {
    const coinData = await getCoinData(coinId)
    if (!coinData) return false
    updateTodayBotStatistics('todayCoinComment', prev => prev + 1)
    return await fetch(`http://localhost:${WEB_PORT}/api/coin/comment`, {
        method: 'POST',
        body: JSON.stringify({
            coinId,
            userId,
            content,
            secret: env.BOT_TOKEN
        })
    }).then(res => res.json())
}

export const errorOccurredWhileTrading = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':x: **오류가 발생했습니다**')
    .setDescription('**잠시 후 다시 시도해주세요, 거래는 취소되었습니다.**')
