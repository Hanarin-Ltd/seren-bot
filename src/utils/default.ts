import { Routes, EmbedBuilder, blockQuote, ChatInputCommandInteraction, User } from "discord.js"
import getCommands, { alwaysEphemeral, Command } from "../commands"
import { rest, BOT_COLOR, env } from "../lib"
import { getGuildOption } from "./guildOption"

export const addSlashCommands = async () => {
    try {
        await rest.put(Routes.applicationCommands(env.BOT_ID!), { body: getCommands() })
    } catch (error) {
        console.error(error)
    }
}

export const getCurrentTime = (now: Date = new Date()) => {
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
}

export const getCurrentDate = (now: Date = new Date()) => {
    return `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`
}

export const errorMessage = (content?: string) => {
    if (!content) {
        return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':x: 오류가 발생했습니다!')
    } else {
        return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':x: 오류가 발생했습니다!')
        .setFields([
            { name: '오류 내용', value: blockQuote(content) }
        ])
    }
}

export const noPermissionMessage = () => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':no_entry_sign: 권한이 없습니다.')
}

export const completeSuccessfullyMessage = (author: User, content?: string) => {
    return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle(':white_check_mark: 성공적으로 처리되었습니다.')
        .setDescription(content || '아무문제 없어요!')
        .setTimestamp(new Date())
        .setAuthor({
            name: author.tag,
            iconURL: author.displayAvatarURL()
        })
}

export const makeRandomString = (length: number) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i<length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
   }
   return result
}

export const toJSON = (obj: any) => {
    return JSON.stringify(obj)
}

export const toObject = (string: string) => {
    return JSON.parse(string)
}

export const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomItem = (array: any[], weights?: number[]) => {
    if (!weights) {
        return [array[getRandomInt(0, array.length - 1)]]
    }
    let sum = 0
    for (const weight of weights) {
        sum += weight
    }
    const random = getRandomInt(0, sum)
    let current = 0
    for (const weight of weights) {
        current += weight
        if (random <= current) {
            return [array[weights.indexOf(weight)]]
        }
    }
    return []
}

export const abs = (number: number) => Math.abs(number)

export const isSameArray = (a: any[],b: any[]) => {
    if (a instanceof Array && b instanceof Array) {
        if (a.length!=b.length)
            return false
        for(let i = 0; i < a.length; i++)
            if (!isSameArray(a[i],b[i]))
                return false
        return true
    } else {
        return a==b
    }
}

export const deferReply = async (interaction: ChatInputCommandInteraction) => {
    if (interaction.deferred || interaction.replied) return
    if (alwaysEphemeral.includes(interaction.commandName as Command)) return await interaction.deferReply({ ephemeral: true })
    if (!interaction.guildId) return await interaction.deferReply()
    
    const option = await getGuildOption(interaction.guildId)
    if (!option) return await interaction.deferReply()

    if (option.setCommandMessageAsEphemeral) return await interaction.deferReply({ ephemeral: true })
    else return await interaction.deferReply()
}

export function chunkArray<T>(array: T[], n: number) {
    const chunkLength = Math.max(array.length/n ,1)
    const chunks = []
    for (let i = 0; i < n; i++) {
        if(chunkLength*(i+1)<=array.length)chunks.push(array.slice(chunkLength*i, chunkLength*(i+1)))
    }
    return chunks
}
