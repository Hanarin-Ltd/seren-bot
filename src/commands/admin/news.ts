import { EmbedBuilder } from "@discordjs/builders"
import { codeBlock, Message } from "discord.js"
import { client } from "../.."
import { BOT_COLOR } from "../../lib"
import adminData from "../../utils/admin/data.json"

export default async function(args: string[], message: Message) {
    const noticeChannel = await client.channels.fetch(adminData.noticeChannelId)
    if (!noticeChannel || !noticeChannel.isTextBased()) return

    await noticeChannel.send({ embeds: [
        new EmbedBuilder()
            .setColor(BOT_COLOR)
            .setTitle(':loudspeaker:  공지사항')
            .setDescription(codeBlock(args.reduce((a, b) => `${a} ${b}`)))
            .setTimestamp()
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
    ] })
}
