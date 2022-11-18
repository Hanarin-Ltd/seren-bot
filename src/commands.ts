import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"

const commandsFile = {
    '핑': 'ping',
    '도움말': 'help',
    '서버정보': 'serverinfo',
    '봇정보': 'botinfo',
    '멤버정보': 'memberinfo',
    '금지어': 'blockword',
    '리스트': 'list',
    '랭킹': 'ranking',
    '경고': 'warning',
    '안녕': 'hello',
    '아이디': 'getid',
    '내아이디': 'myid',
    '차단': 'ban',
    '차단경고갯수': 'warninglimit',
    '역할': 'role',
    '로그': 'log',
    '대시보드': 'dashboard',
    '초대': 'invite',
    '투표': 'vote',
    '코인': 'coin',
    '코인가격': 'coinprice',
    '코인구매': 'coinbuy',
    '코인판매': 'coinsell',
    '내코인': 'mycoin',
    '코인댓글': 'coincomment',
    '포인트전송': 'sendpoint',
    '도박': 'gamble',
    '마이그레이션': 'migration'
}

export type Command = keyof typeof commandsFile

const commands =  [
    new SlashCommandBuilder()
        .setName('핑')
        .setDescription('🏓 봇 응답시간을 테스트합니다')
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('도움말')
        .setDescription('📑 봇 명령어 리스트를 출력합니다')
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('서버정보')
        .setDescription('ℹ️ 서버의 자세한 정보를 알려줍니다')
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('봇정보')
        .setDescription('ℹ️ Seren의 자세한 정보를 알려줍니다')
        .setDMPermission(true)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('멤버정보')
        .setDescription('ℹ️ 멤버의 자세한 정보를 알려줍니다')
        .addUserOption(option =>
            option.setName('멤버')
            .setDescription('멤버를 선택해주세요')
            .setRequired(true)
        )
        .setDMPermission(false)
        .toJSON(), 
    new SlashCommandBuilder()
        .setName('리스트')
        .setDescription('📜 관리자 / 금지어 목록을 출력합니다')
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
        .setDescription('👋 봇에게 인사를 건네보세요!')
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('랭킹')
        .setDescription('📊 랭킹을 출력합니다')
        .setDMPermission(false)
        .addStringOption(content =>
            content.setName('종류')
            .setRequired(true)
            .setDescription('랭킹 종류를 선택합니다')
            .addChoices(
                { name: '포인트', value: 'point' },
                { name: '레벨', value: 'level' },
            )
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('아이디')
        .setDescription('🪪 유저의 아이디를 출력합니다')
        .addUserOption(target =>
            target.setName('유저')
            .setDescription('아이디를 출력할 유저')
            .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('내아이디')
        .setDescription('🪪 자신의 아이디를 출력합니다')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('금지어')
        .setDescription('🤬 금지어를 관리합니다')
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
        .setDescription('🎭 사용자의 역할을 관리합니다')
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
        .setDescription('⚠️ 경고를 관리합니다')
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
        .setDescription('⛔ 차단 유저를 관리합니다')
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
        .setName('차단경고갯수')
        .setDescription('🚫 설정한 경고 갯수에 도달하면 차단합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addNumberOption(count =>
            count.setName('갯수')
            .setDescription('설정할 갯수')
            .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('로그')
        .setDescription('📜 로그를 설정합니다')
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
                { name: '멤버 역할 추가', value: 'addRoleToMember' },
                { name: '멤버 역할 삭제', value: 'removeRoleToMember' },
                { name: '역할 생성', value: 'createRole' },
                { name: '역할 삭제', value: 'deleteRole' },
                { name: '역할 편집', value: 'updateRole' },
                { name: '차단 추가', value: 'addBan' },
                { name: '차단 삭제', value: 'removeBan' },
                { name: '경고 추가', value: 'getWarning' },
                { name: '경고 삭제', value: 'removeWarning' },
                
            )
            .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('대시보드')
        .setDescription('📊 대시보드에 접속합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('투표')
        .setDescription('🗳️ 현재 채널에 투표를 생성합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addBooleanOption(mention =>
            mention.setName('everyone')
            .setDescription('모든 멤버에게 투표를 알립니다. (기본값: X)')
            .setRequired(false)
        )
        .addBooleanOption(hideResult =>
            hideResult.setName('투표현황비공개')
            .setDescription('투표 종료시까지 결과를 볼 수 없습니다. (기본값: X)')
            .setRequired(false)
        )
        .addBooleanOption(onlyAdmin =>
            onlyAdmin.setName('결과비공개')
            .setDescription('투표 종료시 투표 진행자만 결과를 볼 수 있습니다. (기본값: X)')
            .setRequired(false)
        )
        .addBooleanOption(allowChange =>
            allowChange.setName('선택변경')
            .setDescription('투표 종료시까지 선택을 변경할 수 있습니다. (기본값 : O)')
            .setRequired(false)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('코인')
        .setDescription('🪙 코인게임에 참가하시겠습니까?')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('코인가격')
        .setDescription('💹 코인 가격을 확인합니다')
        .addStringOption(coin =>
            coin.setName('이름')
            .setDescription('코인 이름을 입력해주세요')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('코인구매')
        .setDescription('🪙 코인을 구매합니다')
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
        .setDescription('🪙 코인을 판매합니다')
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
        .setDescription('💰 내 코인을 확인합니다')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('코인댓글')
        .setDescription('💬 코인에 댓글을 답니다')
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
        .toJSON(),
    new SlashCommandBuilder()
        .setName('포인트전송')
        .setDescription('💸 다른 사람에게 포인트를 보냅니다')
        .addStringOption(userId =>
            userId.setName('아이디')
            .setDescription('받을 사람의 아이디를 입력해주세요')
            .setRequired(true)
        )
        .addNumberOption(amount =>
            amount.setName('수량')
            .setDescription('보낼 수량을 입력해주세요')
            .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('도박')
        .setDescription('🎰 포인트를 일정 확률로 얻거나 잃습니다. 기본 포인트 : 1000')
        .setDMPermission(true)
        .addNumberOption(amount =>
            amount.setName('짜릿함')
            .setDescription('1000 * (짜릿함) 만큼의 포인트를 걸 수 있습니다')
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('마이그레이션')
        .setDescription('데이터 마이그레이션을 진행합니다, ⚠️ 데이터가 손실될 수 있습니다! ⚠️')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .toJSON(),
]

const getCommands = (): any[] => {
    return commands
}

const getCommandList = (): Command[] => {
    return getCommands().map(command => command.name)
}

const getCommandFunction = (): any => {
    const returnValue: any = {}
    getCommandList().forEach(command => {
        returnValue[command] = require(`./commands/${commandsFile[command]}`).default
    })
    return returnValue
}

export const usableInDM: Command[] = ['코인가격', '코인구매', '코인판매', '내코인', '코인댓글', '코인', '포인트전송', '내아이디', '도박', '봇정보']
export default getCommands
export { getCommandList, getCommandFunction }
export const alwaysEphemeral: Command[] = ['포인트전송', '내아이디', '투표', '마이그레이션', '대시보드']
