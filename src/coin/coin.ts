import { getCoinList, makeNewCoin, updateCoinPrice } from "../utils/coin"

export default async function coinGame() {
    console.log('Coin Game Started')

    const coins = await getCoinList()
    if (coins.length === 0) {
        for (let i = 0; i < 10; i++) {
            makeNewCoin()
        }
    }

    setInterval(async () => {
        coins.forEach(async coin => updateCoinPrice(coin.id))
    }, 3000)
}
