import { CoinData } from "@prisma/client"
import { getCoinList, makeNewCoin, updateCoinPrice } from "../utils/coin"

type CoinGameEvent = 'start' | 'end' | 'addcoin' | 'removecoin' | 'updateprice' | 'buy' | 'sell'

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
