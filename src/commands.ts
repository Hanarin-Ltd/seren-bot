import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"

const commandsFile = {
    '핑': 'ping',
    '도움말': 'help',
    '정보': 'info',
    '금지어': 'blockword',
    '관리자': 'mod',
    '리스트': 'list',
    '경고': 'warning',
    '안녕': 'hello',
    '차단': 'ban',
    '역할': 'role',
    '로그': 'log',
    '코인': 'coin',
    '코인가격': 'coinprice',
    '코인구매': 'coinbuy',
    '코인판매': 'coinsell',
    '내코인': 'mycoin',
    '코인댓글': 'coincomment',
}

type command = keyof typeof commandsFile

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
            .setDescription('임명 / 해임')
            .addChoices(
                { name: '임명', value: 'add' },
                { name: '해임', value: 'remove' }
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
        .setName('로그')
        .setDescription('로그를 설정합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(setting =>
            setting.setRequired(true)
            .setName('설정')
            .setDescription('활성화 / 비활성화')
            .addChoices(
                { name: '활성화', value: 'on' },
                { name: '비활성화', value: 'off' }
            )
            .setRequired(true)
        )
        .addStringOption(type =>
            type.setName('종류')
            .setDescription('설정할 로그 타입')
            .addChoices(
                { name: '멤버 입장', value: 'userCreate' },
                { name: '멤버 퇴장', value: 'userDelete' },
                { name: '관리자 임명', value: 'addMod' },
                { name: '관리자 해임', value: 'removeMod' },
                { name: '명령어 사용', value: 'useCommand' },
                { name: '금지어 사용', value: 'useBlockword' },
                { name: '금지어 추가', value: 'addBlockword' },
                { name: '금지어 제거', value: 'removeBlockword' },
                { name: '메세지 삭제', value: 'removeMessage' },
                { name: '레벨업', value: 'levelUp' },
                { name: '역할 부여', value: 'addRoleToMember' },
                { name: '역할 삭제', value: 'removeRoleToMember' },
                { name: '차단 추가', value: 'addBan' },
                { name: '차단 삭제', value: 'removeBan' },
                { name: '경고 추가', value: 'getWarning' },
                { name: '경고 삭제', value: 'removeWarning' },
            )
            .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('코인')
        .setDescription('코인게임이 참가하시겠습니까?')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('코인가격')
        .setDescription('코인 가격을 확인합니다')
        .addStringOption(coin =>
            coin.setName('이름')
            .setDescription('코인 이름을 입력해주세요')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('코인구매')
        .setDescription('코인을 구매합니다')
        .addStringOption(coin =>
            coin.setName('이름')
            .setDescription('코인 이름을 입력해주세요')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addIntegerOption(amount =>
            amount.setName('수량')
            .setDescription('구매할 수량을 입력해주세요')
            .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('코인판매')
        .setDescription('코인을 판매합니다')
        .addStringOption(coin =>
            coin.setName('이름')
            .setDescription('코인 이름을 입력해주세요')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addIntegerOption(amount =>
            amount.setName('수량')
            .setDescription('판매할 수량을 입력해주세요')
            .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('내코인')
        .setDescription('내 코인을 확인합니다')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('코인댓글')
        .setDescription('코인에 댓글을 답니다')
        .addStringOption(coin => 
            coin.setName('이름')
            .setDescription('코인 이름을 입력해주세요')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(comment => 
            comment.setName('댓글')
            .setDescription('댓글을 입력해주세요')
            .setRequired(true)
        )
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

export const usableInDM = ['코인가격', '코인구매', '코인판매', '내코인', '코인댓글', '코인']
export default getCommands
export { getCommandList, getCommandFunction }
