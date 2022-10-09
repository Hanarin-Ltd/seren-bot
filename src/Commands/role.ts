import { ChatInputCommandInteraction, GuildMember, Role } from "discord.js"
import { BOT_COLOR } from "../lib"
import { noPermissionMessage, completeSuccessfullyMessage, deferReply } from "../utils/default"
import { isGuildModerator } from "../utils/discord"
import { getGuildModRole } from "../utils/role"

export default async function role(interaction: ChatInputCommandInteraction) {
    await deferReply(interaction)

    if (!await isGuildModerator(interaction.guild!, interaction.member as GuildMember)) return interaction.editReply({ embeds: [noPermissionMessage()] })

    const args = interaction.options
    const setting = args.getString('설정')!
    const role = args.getRole('역할')! as Role
    const target = args.getMember('멤버')! as GuildMember
    const thisGuild = interaction.guild!

    try {
        if (setting === 'add') {
            if (role.name === (await getGuildModRole(thisGuild))?.name) 
                return interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':x: 관리자 역할은 추가할 수 없습니다.', description: '/관리자 명령어를 써주세요.' }] })
            if (target.roles.cache.has(role.id))
                return interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 이미 부여된 역할입니다.' }] })

            await target.roles.add(role)
    
        }
        else if (setting === 'remove') {
            if (role.name === (await getGuildModRole(thisGuild))?.name) 
                return interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':x: 관리자 역할은 제거할 수 없습니다.', description: '/관리자 명령어를 써주세요.' }] })
            if (!target.roles.cache.has(role.id))return interaction.editReply({ embeds: [{ color: BOT_COLOR, title: ':no_entry_sign: 부여되지 않은 역할입니다.' }] })
            
            await target.roles.remove(role)
        }

        await interaction.editReply({ embeds: [completeSuccessfullyMessage()] })
    } catch (e) {
        await interaction.editReply({ embeds: [{
            color: BOT_COLOR,
            title: ':no_entry_sign: 오류가 발생했습니다!',
            description: '역할과 관련된 권한 오류가 발생했습니다. Seren의 역할을 맨위에  위치시켜 주세요. (관리자보다 높아야 됩니다)'
        }] })
    }
}
