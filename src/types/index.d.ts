type SerenPlan = 'Free' | 'Serendard' | 'Seren Pass'

interface VoteSettings {
    mentionEveryone?: boolean | null
    hideResult?: boolean | null
    onlyAdmin?: boolean | null
    allowChange?: boolean | null
}

interface ENV {
    BOT_ID: string
    BOT_TOKEN: string
    SITE: string
    VERSION: string
    BUILD_DATE: string
    DATABASE_URL: string
    KOREAN_TOKEN: string
    NODE_ENV: 'development' | 'production'

    [key: string]: string
}
