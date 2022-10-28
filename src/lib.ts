import { MessageType, REST } from 'discord.js'
import { env } from '.'

const BOT_TOKEN: string = env.BOT_TOKEN!
export const rest = new REST({ version: '10' }).setToken(BOT_TOKEN)

// ===== Variables ===== //

export const BOT_COLOR = 0x8ed5fa as const
export const FILTERING_MESSAGE_TYPE = [MessageType.Default, MessageType.Reply]
export const WEB_PORT = env.NODE_ENV === 'production' ? 3000 : 5848 as const
