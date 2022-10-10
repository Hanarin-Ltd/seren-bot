"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsBlockword = exports.removeBlockword = exports.addBlockword = exports.setDefaultBlockword = exports.getBlockwordList = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const log_1 = require("./log");
const getBlockwordList = async (guildId) => {
    const result = await prisma_1.default.blockword.findFirst({ where: {
            guildId
        } });
    return result ? result.word : [];
};
exports.getBlockwordList = getBlockwordList;
const setDefaultBlockword = async (guildId) => {
    return await prisma_1.default.blockword.create({
        data: {
            guildId,
        }
    });
};
exports.setDefaultBlockword = setDefaultBlockword;
const addBlockword = async (guild, word) => {
    const logSetting = await (0, log_1.getGuildLogSetting)(guild.id);
    await prisma_1.default.blockword.updateMany({
        where: { guildId: guild.id },
        data: { word: [...await (0, exports.getBlockwordList)(guild.id), word] },
    });
    (logSetting === null || logSetting === void 0 ? void 0 : logSetting.addBlockword) && (0, log_1.log)({
        content: `금지어 추가됨 : ${word}`,
        rawContent: `금지어 추가됨 : ${word}`,
        guild,
        type: 'addBlockword'
    });
};
exports.addBlockword = addBlockword;
const removeBlockword = async (guild, word) => {
    const wordList = await (0, exports.getBlockwordList)(guild.id);
    const logSetting = await (0, log_1.getGuildLogSetting)(guild.id);
    if (!wordList.includes(word))
        return;
    wordList.splice(wordList.indexOf(word), 1);
    await prisma_1.default.blockword.updateMany({
        where: { guildId: guild.id },
        data: { word: word }
    });
    (logSetting === null || logSetting === void 0 ? void 0 : logSetting.removeBlockword) && (0, log_1.log)({
        content: `금지어 제거됨 : ${word}`,
        rawContent: `금지어 제거됨 : ${word}`,
        guild,
        type: 'removeBlockword'
    });
};
exports.removeBlockword = removeBlockword;
const checkIsBlockword = async (guildId, word) => {
    const blockwordList = await (0, exports.getBlockwordList)(guildId);
    return blockwordList.some(w => JSON.stringify(w) === JSON.stringify(word));
};
exports.checkIsBlockword = checkIsBlockword;
