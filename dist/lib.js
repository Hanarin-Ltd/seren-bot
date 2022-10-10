"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILTERING_MESSAGE_TYPE = exports.BOT_COLOR = exports.rest = void 0;
const discord_js_1 = require("discord.js");
const _1 = require(".");
const BOT_TOKEN = _1.env.BOT_TOKEN;
exports.rest = new discord_js_1.REST({ version: '10' }).setToken(BOT_TOKEN);
// ===== Variables ===== //
exports.BOT_COLOR = 0x8ed5fa;
exports.FILTERING_MESSAGE_TYPE = [discord_js_1.MessageType.Default, discord_js_1.MessageType.Reply];
