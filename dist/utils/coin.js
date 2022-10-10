"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorOccurredWhileTrading = exports.addCoinComment = exports.getPriceInfo = exports.removeUserCoin = exports.addUserCoin = exports.ownedCoinAutoComplete = exports.coinNameAutoComplete = exports.updateCoinPrice = exports.getUserCoinData = exports.getCoinDataAsName = exports.getCoinData = exports.getOwnedCoin = exports.getOwnedCoinList = exports.getCoinList = exports.deleteCoin = exports.makeNewCoin = exports.userCoinIo = void 0;
const discord_js_1 = require("discord.js");
const prisma_1 = __importDefault(require("../prisma"));
const default_1 = require("./default");
const random_words_1 = __importDefault(require("random-words"));
const lib_1 = require("../lib");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const __1 = require("..");
const node_fetch_1 = __importDefault(require("node-fetch"));
const cmp = (n1, n2) => n1 >= n2 ? 1 : -1;
exports.userCoinIo = new socket_io_1.Server((0, http_1.createServer)(), {
    cors: {
        origin: [__1.env.SITE]
    }
}).listen(7428);
const makeNewCoin = async (server) => {
    const name = (0, random_words_1.default)(1)[0].toUpperCase();
    const price = (0, default_1.getRandomInt)(1000, 10000);
    const data = await prisma_1.default.coinData.create({ data: {
            name,
            price,
        } });
    const priceInfo = (0, exports.getPriceInfo)(data.priceHistory);
    server.emit('create', {
        ...data,
        priceHistory: data.priceHistory.slice(-50),
        priceDiff: priceInfo.priceDiff,
        diffPercent: priceInfo.diffPercent.toFixed(2)
    });
};
exports.makeNewCoin = makeNewCoin;
const deleteCoin = async (id, server) => {
    await prisma_1.default.coinData.delete({ where: { id } });
    await prisma_1.default.userCoinData.deleteMany({ where: { coinId: id } });
    await (0, exports.makeNewCoin)(server);
};
exports.deleteCoin = deleteCoin;
const getCoinList = async () => {
    return await prisma_1.default.coinData.findMany();
};
exports.getCoinList = getCoinList;
const getOwnedCoinList = async (userId) => {
    const userCoinData = await (0, exports.getUserCoinData)(userId);
    const filtered = userCoinData.filter(async (d) => await (0, exports.getCoinData)(d.coinId));
    return Promise.all(filtered.map(async (d) => (await (0, exports.getCoinData)(d.coinId))));
};
exports.getOwnedCoinList = getOwnedCoinList;
const getOwnedCoin = async (userId, coinId) => {
    const userCoinData = await (0, exports.getUserCoinData)(userId);
    return userCoinData.find(d => d.coinId === coinId);
};
exports.getOwnedCoin = getOwnedCoin;
const getCoinData = async (id) => {
    return await prisma_1.default.coinData.findFirst({ where: { id } });
};
exports.getCoinData = getCoinData;
const getCoinDataAsName = async (name) => {
    const list = await (0, exports.getCoinList)();
    return list.find(c => c.name.toLowerCase() === name.toLowerCase());
};
exports.getCoinDataAsName = getCoinDataAsName;
const getUserCoinData = async (userId) => {
    return await prisma_1.default.userCoinData.findMany({ where: { userId } });
};
exports.getUserCoinData = getUserCoinData;
// Algorithm Made by @smartwe, Refactored by @cottons-kr
const updateCoinPrice = async (id, server) => {
    const coin = await (0, exports.getCoinData)(id);
    if (!coin)
        return;
    const data = coin.priceHistory;
    let dataLength = data.length;
    if (dataLength === 0) {
        dataLength++;
        data.push(coin.price);
    }
    const priceHistory = [];
    for (let i = 0; i < dataLength - 1; i++) {
        let diffPercent = 0;
        let diff = cmp(data[i], data[i + 1]) * (0, default_1.abs)(data[i + 1] - data[i]);
        if (diff === 0)
            diffPercent = 0;
        else
            diffPercent = cmp(data[i + 1], data[i]) * ((0, default_1.abs)(diff / data[i] * 100) % 100);
        priceHistory.push(diffPercent);
    }
    let c1 = [];
    let c2 = [];
    const randomPer = (0, default_1.getRandomInt)((0, default_1.abs)((0, default_1.abs)(priceHistory[dataLength - 2] - 60)), (0, default_1.abs)(priceHistory[dataLength - 2]));
    if (priceHistory[dataLength - 2] >= 0)
        c1 = (0, default_1.getRandomItem)([1, 2], [randomPer, (0, default_1.abs)(100 - randomPer)]);
    else
        c1 = (0, default_1.getRandomItem)([1, 2], [(0, default_1.abs)(100 - randomPer), randomPer]);
    c2 = (0, default_1.getRandomItem)([1, 2, 3], [99, 0.8, 0.2]);
    let amt = 0;
    if ((0, default_1.isSameArray)(c2, [1]))
        amt = (0, default_1.getRandomInt)(1, 300);
    else if ((0, default_1.isSameArray)(c2, [2]))
        amt = (0, default_1.getRandomInt)(300, 800);
    else
        amt = (0, default_1.getRandomInt)(800, 1350);
    if ((0, default_1.isSameArray)(c1, [1])) {
        return await prisma_1.default.coinData.update({ where: { id }, data: {
                price: data[dataLength - 1] + amt,
                priceHistory: [...data, data[dataLength - 1] + amt]
            } });
    }
    else {
        if ((data[dataLength - 1] - amt) <= 0) {
            await prisma_1.default.coinData.deleteMany({ where: { id } });
            await prisma_1.default.userCoinData.deleteMany({ where: { coinId: id } });
            server.emit('delete', id);
            return await (0, exports.makeNewCoin)(server);
        }
        return await prisma_1.default.coinData.update({ where: { id }, data: {
                price: data[dataLength - 1] - amt,
                priceHistory: [...data, data[dataLength - 1] - amt]
            } });
    }
};
exports.updateCoinPrice = updateCoinPrice;
const coinNameAutoComplete = async (interaction) => {
    const coins = await (0, exports.getCoinList)();
    const focused = interaction.options.getFocused().toLowerCase();
    const filtered = coins.filter(c => c.name.toLowerCase().startsWith(focused));
    await interaction.respond(filtered.length > 0 ? filtered.map(c => ({ name: `${c.name} - ${c.price}pt`, value: c.name })) : []);
};
exports.coinNameAutoComplete = coinNameAutoComplete;
const ownedCoinAutoComplete = async (interaction) => {
    const coins = await (0, exports.getOwnedCoinList)(interaction.user.id);
    const focused = interaction.options.getFocused().toLowerCase();
    const filtered = coins.filter(c => c.name.toLowerCase().startsWith(focused));
    await interaction.respond(filtered.length > 0 ? filtered.map(c => ({ name: `${c.name} - ${c.price}`, value: c.name })) : []);
};
exports.ownedCoinAutoComplete = ownedCoinAutoComplete;
const addUserCoin = async (userId, coinId, amount, createdAt) => {
    const userData = await prisma_1.default.userCoinData.findFirst({ where: { userId, coinId } });
    if (userData) {
        return await prisma_1.default.userCoinData.updateMany({
            where: { userId, coinId },
            data: { amount: userData.amount + amount, createdAt }
        });
    }
    else {
        const coinData = (await (0, exports.getCoinData)(coinId));
        return await prisma_1.default.userCoinData.createMany({ data: {
                userId, coinId, amount, createdAt,
                name: coinData.name,
            } });
    }
};
exports.addUserCoin = addUserCoin;
const removeUserCoin = async (userId, coinId, amount) => {
    const userData = await (0, exports.getOwnedCoin)(userId, coinId);
    if (!userData)
        return false;
    if (amount >= userData.amount) {
        return await prisma_1.default.userCoinData.deleteMany({ where: { userId, coinId } });
    }
    return await prisma_1.default.userCoinData.updateMany({
        where: { userId, coinId },
        data: { amount: userData.amount - amount }
    });
};
exports.removeUserCoin = removeUserCoin;
// Algorithm Made by @smartwe, Refactored by @cottons-kr
const getPriceInfo = (data) => {
    const dataLength = data.length;
    let max = 0;
    let min = 0;
    let lmax = 0;
    let lmin = 0;
    for (let i = 0; i < dataLength + 1; i++) {
        if (i === 0) {
            max = data[i];
            min = data[i];
            continue;
        }
        if (i === dataLength) {
            if (data[i - 1] >= data[i - 2]) {
                lmax = data[i - 1];
                break;
            }
            else
                break;
        }
        if (data[i] >= max)
            max = data[i];
        else {
            lmax = data[i - 1];
            max = 0;
        }
        if (data[i] <= min)
            min = data[i];
        else {
            lmin = data[i - 1];
            min = Infinity;
        }
    }
    const priceDiff = cmp(data[dataLength - 1], data[dataLength - 2]) * (0, default_1.abs)(data[dataLength - 1] - data[dataLength - 2]);
    const diffPercent = (0, default_1.abs)(priceDiff / data[dataLength - 2] * 100);
    return {
        lastLowPrice: lmin,
        lastHighPrice: lmax,
        diffPercent: cmp(data[dataLength - 1], data[dataLength - 2]) * (diffPercent % 100),
        priceDiff,
    };
};
exports.getPriceInfo = getPriceInfo;
const addCoinComment = async (coinId, userId, content) => {
    const coinData = await (0, exports.getCoinData)(coinId);
    if (!coinData)
        return false;
    return await (0, node_fetch_1.default)('http://localhost:3000/api/coin/comment', {
        method: 'POST',
        body: JSON.stringify({
            coinId,
            userId,
            content,
            secret: __1.env.BOT_TOKEN
        })
    }).then(res => res.json());
};
exports.addCoinComment = addCoinComment;
exports.errorOccurredWhileTrading = new discord_js_1.EmbedBuilder()
    .setColor(lib_1.BOT_COLOR)
    .setTitle(':x: **오류가 발생했습니다**')
    .setDescription('**잠시 후 다시 시도해주세요, 거래는 취소되었습니다.**');
