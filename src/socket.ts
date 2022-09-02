import { prisma } from './lib'
import * as net from 'net'

type Responce = {
    guildId: string,
    changed: string[]
}

const server = net.createServer(client => {
    client.setDefaultEncoding('utf8')
    client.setEncoding('utf8')
    client.setNoDelay(true)
    client.setTimeout(10000)

    client.on('data', async (recv) => {
        const { guildId, changed }: Responce = JSON.parse(recv.toString())

        if (changed.includes('mod')) {
            //const newModList = await prisma.memberData.findMany({ where: { guildId, mod: true } })
        }

        if (changed.includes('ban')) {
        }

        if (changed.includes('mentionBlock')) {
        }
    })
})

export default function openSocketServer() {
    server.listen(7321, () => {
        console.log(`Socket Server is Opened`)
    })
}
