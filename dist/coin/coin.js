"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const __1 = require("..");
const coin_1 = require("../utils/coin");
const coinIo = new socket_io_1.Server((0, http_1.createServer)(), {
    cors: {
        origin: [__1.env.SITE]
    }
});
class CoinGame {
    constructor(coins = [], interval = null) {
        this.coins = coins;
        this.interval = interval;
    }
    async addCoin() {
        await (0, coin_1.makeNewCoin)(coinIo);
        this.coins = await (0, coin_1.getCoinList)();
    }
    async updateCoinPrice() {
        if (this.coins.length === 0) {
            for (let i = 0; i < 10; i++) {
                await this.addCoin();
            }
        }
        for (const coin of this.coins) {
            await (0, coin_1.updateCoinPrice)(coin.id, coinIo);
            const priceInfo = (0, coin_1.getPriceInfo)(coin.priceHistory);
            coinIo.emit('price', {
                ...coin,
                priceHistory: coin.priceHistory.slice(-50),
                priceDiff: priceInfo.priceDiff,
                diffPercent: priceInfo.diffPercent.toFixed(2)
            });
        }
        this.coins = await (0, coin_1.getCoinList)();
    }
    async start() {
        this.coins = await (0, coin_1.getCoinList)();
        this.interval = setInterval(() => this.updateCoinPrice(), 3000);
    }
}
async function coinGame() {
    const coinGame = new CoinGame();
    coinGame.start();
    coinIo.listen(7777);
    console.log('Coin Game Started');
}
exports.default = coinGame;
