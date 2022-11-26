import { codeBlock, EmbedBuilder, Message } from "discord.js"
import { BOT_COLOR } from "../../lib"
import adminData from "./data.json"

export default async function adminCommand(message: Message) {
    if (!message.author.id || !message.content.startsWith(adminData.prefix)) return
    
    const adminIdList = adminData.admin
    if (!adminIdList.includes(message.author.id)) return

    const args = message.content.split(' ')
    const commandName = args[0].slice(adminData.prefix.length)
    const commandArgs = args.slice(1)

    try {
        const command = require(`../../commands/admin/${commandName}`).default
        return command(commandArgs, message)
    } catch (e) {
        if (!(e instanceof Error)) return
        console.log(e.stack)
        await message.reply({ embeds: [
            new EmbedBuilder()
                .setColor(BOT_COLOR)
                .setTitle(':no_entry_sign: 에러 발생')
                .setFields({ name: '에러 내용', value: codeBlock(e.message) })
                .setTimestamp()
                .toJSON()
        ] })
    }
}
