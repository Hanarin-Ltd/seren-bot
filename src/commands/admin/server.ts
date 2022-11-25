import { EmbedBuilder, Message } from "discord.js"
import { BOT_COLOR } from "../../lib"
import * as os from 'os'
import { getUptime } from "../../utils/default"

export default async function(args: string[], message: Message) {
    const memoryUsage = process.memoryUsage()
    
    await message.reply({ embeds: [
        new EmbedBuilder()
            .setColor(BOT_COLOR)
            .setTitle(':gear:  서버 정보')
            .setFields(
                { name: 'CPU 사용량', value: `> ${os.loadavg()[0]}%` },
                { name: '메모리 사용량', value: `
                    > Heap Used : ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB
                    > Heap Total : ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB
                    > RSS : ${Math.round(memoryUsage.rss / 1024 / 1024)}MB
                ` },
                { name: '업타임', value: `> ${getUptime()}` },
                { name: '플랫폼', value: `> ${os.platform()} ${os.arch()} ${os.release()}` },
                { name: '버전', value: `
                    > Node.js ${process.version}
                    > DiscordJS v${require('discord.js').version}
                ` }
            )
            .setTimestamp()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
    ] })
}
