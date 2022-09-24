import { CoinData } from "@prisma/client"
import { createServer } from "http"
import { Server } from "socket.io"
import { env } from ".."
import { getCoinList, getPriceInfo, makeNewCoin, updateCoinPrice } from "../utils/coin"

const coinIo = new Server(createServer(), {
    cors: {
        origin: [env.SITE!]
    }
})

class CoinGame {
    constructor(
        public coins: CoinData[] = [],
        private interval: NodeJS.Timeout | null = null,
    ) {}

    async addCoin() {
        await makeNewCoin()
        this.coins = await getCoinList()
    }

    private async updateCoinPrice() {
        if (this.coins.length === 0) {
            for (let i = 0; i < 10; i++) {
                await this.addCoin()
            }
        }
        for (const coin of this.coins) {
            await updateCoinPrice(coin.id)
            const priceInfo = getPriceInfo(coin.priceHistory)
            coinIo.emit('price', {
                ...coin,
                priceHistory: coin.priceHistory.slice(-15),
                priceDiff: priceInfo.priceDiff,
                diffPercent: priceInfo.diffPercent.toFixed(2)
            })
        }
        this.coins = await getCoinList()
    }

    async start() {
        this.coins = await getCoinList()
        this.interval = setInterval(() => this.updateCoinPrice(), 3000)
    }
}

export default async function coinGame() {
    const coinGame = new CoinGame()
    coinGame.start()
    coinIo.listen(7777)
    console.log('Coin Game Started')
}
