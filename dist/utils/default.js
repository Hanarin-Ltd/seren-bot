"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameArray = exports.abs = exports.getRandomItem = exports.getRandomInt = exports.toObject = exports.toJSON = exports.makeRandomString = exports.completeSuccessfullyMessage = exports.noPermissionMessage = exports.errorMessage = exports.getCurrentDate = exports.getCurrentTime = exports.addSlashCommands = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const commands_1 = __importDefault(require("../commands"));
const lib_1 = require("../lib");
const addSlashCommands = async () => {
    try {
        await lib_1.rest.put(discord_js_1.Routes.applicationCommands(__1.env.BOT_ID), { body: (0, commands_1.default)() });
    }
    catch (error) {
        console.error(error);
    }
};
exports.addSlashCommands = addSlashCommands;
const getCurrentTime = (now = new Date()) => {
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
};
exports.getCurrentTime = getCurrentTime;
const getCurrentDate = (now = new Date()) => {
    return `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
};
exports.getCurrentDate = getCurrentDate;
const errorMessage = (content) => {
    if (!content) {
        return new discord_js_1.EmbedBuilder()
            .setColor(lib_1.BOT_COLOR)
            .setTitle(':x: 오류가 발생했습니다!');
    }
    else {
        return new discord_js_1.EmbedBuilder()
            .setColor(lib_1.BOT_COLOR)
            .setTitle(':x: 오류가 발생했습니다!')
            .setFields([
            { name: '오류 내용', value: (0, discord_js_1.blockQuote)(content) }
        ]);
    }
};
exports.errorMessage = errorMessage;
const noPermissionMessage = () => {
    return new discord_js_1.EmbedBuilder()
        .setColor(lib_1.BOT_COLOR)
        .setTitle(':no_entry_sign: 권한이 없습니다.');
};
exports.noPermissionMessage = noPermissionMessage;
const completeSuccessfullyMessage = () => {
    return { color: lib_1.BOT_COLOR, title: ':white_check_mark: 성공적으로 처리되었습니다.' };
};
exports.completeSuccessfullyMessage = completeSuccessfullyMessage;
const makeRandomString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.makeRandomString = makeRandomString;
const toJSON = (obj) => {
    return JSON.stringify(obj);
};
exports.toJSON = toJSON;
const toObject = (string) => {
    return JSON.parse(string);
};
exports.toObject = toObject;
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.getRandomInt = getRandomInt;
const getRandomItem = (array, weights) => {
    if (!weights) {
        return [array[(0, exports.getRandomInt)(0, array.length - 1)]];
    }
    let sum = 0;
    for (const weight of weights) {
        sum += weight;
    }
    const random = (0, exports.getRandomInt)(0, sum);
    let current = 0;
    for (const weight of weights) {
        current += weight;
        if (random <= current) {
            return [array[weights.indexOf(weight)]];
        }
    }
    return [];
};
exports.getRandomItem = getRandomItem;
const abs = (number) => Math.abs(number);
exports.abs = abs;
const isSameArray = (a, b) => {
    if (a instanceof Array && b instanceof Array) {
        if (a.length != b.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (!(0, exports.isSameArray)(a[i], b[i]))
                return false;
        return true;
    }
    else {
        return a == b;
    }
};
exports.isSameArray = isSameArray;
