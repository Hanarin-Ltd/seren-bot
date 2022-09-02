import { ApplicationCommandPermissionType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"

const commandsFile = {
    '핑': 'ping',
    '도움말': 'help',
    '정보': 'info',
    '금지어': 'blockword',
    '관리자': 'mod',
    '리스트': 'list',
    '멘션': 'mention',
    '경고': 'warning',
    '안녕': 'hello',
    '차단': 'ban',
    '역할': 'role'
}

type command = '핑' | '도움말' | '정보' | '금지어' | '관리자' | '리스트' | '멘션' | '경고' | '안녕' | '차단' | '역할'

const commands =  [
    new SlashCommandBuilder()
        .setName('핑')
        .setDescription('봇 응답시간을 테스트합니다')
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('도움말')
        .setDescription('봇 명령어 리스트를 출력합니다')
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('정보')
        .setDescription('서버의 자세한 정보를 알려줍니다')
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('리스트')
        .setDescription('관리자 / 금지어 목록을 출력합니다')
        .setDMPermission(false)
        .addStringOption(content => 
            content.setName('내용')
            .setDescription('리스트를 출력할 내용을 선택합니다')
            .addChoices(
                { name: '관리자', value: 'mod' },
                { name: '금지어', value: 'blockword' },
                { name: '멘션', value: 'mention' },
                { name: '경고', value: 'warning' },
                { name: '차단', value: 'ban' }
            )
            .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('안녕')
        .setDescription('봇에게 인사를 건네보세요!')
        .setDMPermission(false)
        .toJSON(),
    

    new SlashCommandBuilder()
        .setName('금지어')
        .setDescription('금지어를 관리합니다')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(setting => 
            setting.setName('설정')
            .setDescription('추가 / 제거')
            .addChoices(
                { name: '추가', value: 'add' },
                { name: '제거', value: 'remove' }
            )
            .setRequired(true)
        )
        .addStringOption(content =>
            content.setName('금지어')
            .setDescription('금지할 단어를 입력하세요')
            .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('역할')
        .setDescription('사용자의 역할을 관리합니다')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageGuild)
        .addStringOption(setting =>
            setting.setName('설정')
            .setDescription('부여/삭제')
            .addChoices(
                { name: '부여', value: 'add' },
                { name: '삭제', value: 'remove' }
            )
            .setRequired(true)
        )
        .addRoleOption(role =>
            role.setName('역할')
            .setDescription('부여할 역할')
            .setRequired(true)
        )
        .addUserOption(target =>
            target.setName('멤버')
            .setDescription('설정할 멤버')
            .setRequired(true)
        ),
    new SlashCommandBuilder()
            .setName('멘션')
            .setDescription('멘션 금지 유저를 관리합니다')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDMPermission(false)
            .addStringOption(setting =>
                    setting.setName('설정')
                    .setDescription('허용 / 금지')
                    .addChoices(
                        { name: '허용', value: 'allow' },
                        { name: '금지', value: 'block' }
                    )
                    .setRequired(true)
            )
            .addUserOption(target => 
                target.setName('멤버')
                .setDescription('설정할 멤버')
                .setRequired(true)    
            )
            .toJSON(),
    new SlashCommandBuilder()
        .setName('경고')
        .setDescription('경고를 관리합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(setting => 
            setting.setName('설정')
            .setDescription('추가 / 제거')
            .addChoices(
                { name: '추가', value: 'add' },
                { name: '제거', value: 'remove' }
            )
            .setRequired(true)
        )
        .addUserOption(target => 
            target.setName('멤버')
            .setDescription('설정할 멤버')
            .setRequired(true)    
        )
        .addNumberOption(count => 
            count.setName('갯수')
            .setDescription('설정할 갯수 (기본값 : 1)')
            .setRequired(false)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('차단')
        .setDescription('차단 유저를 관리합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(setting =>
            setting.setName('설정')
            .setDescription('추가 / 해제')
            .addChoices(
                { name: '추가', value: 'add' },
                { name: '해제', value: 'remove' }
            )
            .setRequired(true)
        )
        .addStringOption(target =>
            target.setName('아이디')
            .setDescription('설정할 멤버 ID')
            .setRequired(true)
        )
        .addStringOption(reason => 
            reason.setName('사유')
            .setDescription('차단 사유')
        ),

    new SlashCommandBuilder()
        .setName('관리자')
        .setDescription('관리자를 설정합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(setting => 
            setting.setRequired(true)
            .setName('설정')
            .setDescription('추가 / 제거')
            .addChoices(
                { name: '추가', value: 'add' },
                { name: '제거', value: 'remove' }
            )
            .setRequired(true)
        )
        .addUserOption(target => 
            target.setName('멤버')
            .setDescription('설정할 멤버')
            .setRequired(true)    
        )
        .toJSON()
]

const getCommands = (): any[] => {
    return commands
}

const getCommandList = (): command[] => {
    return getCommands().map(command => command.name)
}

const getCommandFunction = (): any => {
    const returnValue: any = {}
    getCommandList().forEach(command => {
        returnValue[command] = require(`./Commands/${commandsFile[command]}`).default
    })
    return returnValue
}

export default getCommands
export { getCommandList, getCommandFunction }
