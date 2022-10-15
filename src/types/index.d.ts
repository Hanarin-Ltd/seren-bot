type SerenPlan = 'Free' | 'Serendard' | 'Seren Pass'

interface VoteSettings {
    mentionEveryone?: boolean | null
    hideResult?: boolean | null
    onlyAdmin?: boolean | null
    allowChange?: boolean | null
}
