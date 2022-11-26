import { CoinData } from "@prisma/client"
import fetch from "node-fetch"
import { env, WEB_PORT } from "../lib"
import { getCoinList, getPriceInfo, makeNewCoin, updateCoinPrice } from "../utils/coin"

const MAX_COIN_COUNT = 70

class CoinGame {
    constructor(
        public coins: CoinData[] = [],
        private interval: NodeJS.Timeout | null = null,
    ) {}

    async addCoin() {
        await makeNewCoin()
        this.coins = await getCoinList()
    }

    private async updateCoin() {
        this.coins = await getCoinList()
        if (this.coins.length < MAX_COIN_COUNT) {
            for (let i = this.coins.length; i < MAX_COIN_COUNT; i++) {
                await this.addCoin()
            }
        }
        for (const coin of this.coins) {
            await updateCoinPrice(coin.id)
            const priceInfo = getPriceInfo(coin.priceHistory)
            fetch(`http://localhost:${WEB_PORT}/api/coin/price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'price',
                    ...coin,
                    priceHistory: coin.priceHistory.slice(-50),
                    priceDiff: priceInfo.priceDiff,
                    diffPercent: priceInfo.diffPercent.toFixed(2),
                    secret: env.BOT_TOKEN
                })
            })
        }
        this.coins = await getCoinList()
    }

    async start() {
        this.coins = await getCoinList()
        this.interval = setInterval(() => this.updateCoin(), 3000)
    }
}

export default async function coinGame() {
    const coinGame = new CoinGame()
    coinGame.start()
    console.log('Coin Game Started')
}
