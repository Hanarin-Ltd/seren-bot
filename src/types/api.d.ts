import type { Session } from "next-auth"

type GuildAllData = {
    guildId: string
    name: string
    createdAt: Date
    isCommunityGuild: boolean
    isSettingComplete: boolean
    isBotRoleHighest: boolean
    icon: string

    memberCount: number
    botCount: number
    region: string
    createdAt: Date
    isPartner: boolean
    isVerified: boolean
    premiumTier: number
    premiumSubscriptionCount: number
    description: string

    owner: {
        username: string
        userId: string
        tag: string
        icon: string
        ownedGuild: OwnedGuild[]
    }

    permission: GuildPermission

    option: GuildOption

    channel: {
        channelId: string
        channelName: string
        channelType: number
    }[]

    mod: GuildMemberData[]

    blockword: string[]
    ban: {
        userId: string
        username: string
        tag: string
        profileImg: string
    }[]
    role: {
        id: string
        name: string
        type: string
    }[]

    logSetting: GuildLogSetting

    warning: GuildMemberWarningData[]

    isLogin: boolean
    loadError: boolean
    isOwner: boolean

    [key: string]: any
}

type GuildMemberData = {
    userId: string
    username: string
    nickname: string
    tag: string
    profileImg: string
}

interface OAuth2Account extends Session {
    user: {
        [key: string]: any
    }
}

type OwnedGuild = {
    guildId: string
    name: string
    createdAt?: Date
    isCommunityGuild: boolean
    isSettingComplete: boolean
    ownerId: string
    icon: string

    notLogin?: boolean
    noGuild?: boolean
}

interface GuildLogSetting {
    userCreate: boolean
    userDelete: boolean
    addMod: boolean
    removeMod: boolean
    useCommand: boolean
    useBlockword: boolean
    addBlockword: boolean
    removeBlockword: boolean
    removeMessage: boolean
    levelUp: boolean
    addRoleToMember: boolean
    removeRoleToMember: boolean
    addBan: boolean
    removeBan: boolean
    getWarning: boolean
    removeWarning: boolean
}

interface GuildOption {
    banChannelId: string
    banMessageEnabled: boolean
    unbanChannelId: string
    unbanMessageEnabled: boolean
    welcomeChannelId: string
    welcomeMessage: string
    welcomeMessageEnabled: boolean
    goodbyeChannelId: string
    goodbyeMessage: string
    goodbyeMessageEnabled: boolean
    logChannelId: string
    logEnabled: boolean
    checkModsMessage: boolean
    useBlockwordDisabledChannel: boolean
    blockwordDisabledChannelId: string
    useLevelSystem: boolean
    levelUpMessage: string
    levelUpMessageEnabled: boolean
    levelUpChannelId: string
    messageInLevelupChannel: boolean
    setCommandMessageAsEphemeral: boolean
    enableLegacyCommand: boolean
    warningLimit: number
}

interface GuildPermission {
    collectBlockword: boolean
    collectBan: boolean
}

type GuildLogData = {
    content : string
    createdAt: Date
}

type GuildMemberWarningData = {
    nickname: string
    profileImg: string
    tag: string
    userId: string
    warning: number
}

interface DashboardData {
    backgroundImage: string
    guildData: GuildAllData
    session: any
    settingPage: string
    alertMode: 'success' | 'error' | null
}
