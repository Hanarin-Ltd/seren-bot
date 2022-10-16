import { CoinData } from "@prisma/client"
import fetch from "node-fetch"
import { env } from ".."
import { getCoinList, getPriceInfo, makeNewCoin, updateCoinPrice } from "../utils/coin"

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
        this.coins = await getCoinList()
        if (this.coins.length < 10) {
            for (let i = this.coins.length; i < 10; i++) {
                await this.addCoin()
            }
        }
        for (const coin of this.coins) {
            await updateCoinPrice(coin.id)
            const priceInfo = getPriceInfo(coin.priceHistory)
            fetch('http://localhost:3000/api/coin/price', {
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
        this.interval = setInterval(() => this.updateCoinPrice(), 3000)
    }
}

export default async function coinGame() {
    const coinGame = new CoinGame()
    coinGame.start()
    console.log('Coin Game Started')
}
