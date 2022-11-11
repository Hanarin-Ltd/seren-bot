import { MessageType, REST } from 'discord.js'
import 'dotenv/config'
import * as dotenv from 'dotenv'

export const env = dotenv.config().parsed as ENV
export const rest = new REST({ version: '10' }).setToken(env.BOT_TOKEN)

// ===== Variables ===== //
export const WEB_PORT = env.NODE_ENV === 'production' ? 3000 : 5848
export const BOT_COLOR = 0x8ed5fa as const
export const FILTERING_MESSAGE_TYPE = [MessageType.Default, MessageType.Reply]

// ===== Log System ===== //
