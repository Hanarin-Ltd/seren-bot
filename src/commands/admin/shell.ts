import { codeBlock, EmbedBuilder, Message, User } from "discord.js"
import child from 'child_process'
import { BOT_COLOR } from "../../lib"

const shellEmbed = (content: string, user: User) => new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(':desktop:  셸 실행')
    .setDescription(codeBlock(content))
    .setTimestamp()
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })

export default async function(args: string[], message: Message) {
    const command = args.reduce((a, b) => `${a} ${b}`)
    let processOutput = `$ ${command}\n`

    const reply = await message.reply({ embeds: [shellEmbed(processOutput, message.author)] }) 

    try {
        const process = child.spawn(command, { shell: true })
        process.stdout.on('data', data => {
            processOutput += `${data.toString()}\n`
            reply.edit({ embeds: [shellEmbed(processOutput, message.author)] })
        })
        process.stderr.on('data', data => {
            processOutput += `${data.toString()}\n`
            reply.edit({ embeds: [shellEmbed(processOutput, message.author)] })
        })
        process.on('close', code => {
            processOutput += `Exit code: ${code}`
            reply.edit({ embeds: [shellEmbed(processOutput, message.author)] })
        })
    } catch (e) {
        if (!(e instanceof Error)) return
        processOutput += '에러가 발생했습니다. \n'
        reply.edit({ embeds: [shellEmbed(processOutput, message.author)] })
    }
}
