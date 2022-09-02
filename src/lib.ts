import { MessageType, REST } from 'discord.js'
import { env } from '.'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
const BOT_TOKEN: string = env.BOT_TOKEN!
export const rest = new REST({ version: '10' }).setToken(BOT_TOKEN)

// ===== Variables ===== //

export const BOT_COLOR = 0x8ed5fa
export const FILTERING_MESSAGE_TYPE = [MessageType.Default, MessageType.Reply]

// ===== Log System ===== //

export const logToSQL = async (content: any) => {
    await prisma.errorLog.create({
        data: {
            content
        }
    })
}
