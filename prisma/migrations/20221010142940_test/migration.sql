-- AlterTable
ALTER TABLE "GuildData" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GuildOption" ADD COLUMN     "setCommandMessageAsEphemeral" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "useEnhancedFilter" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "blockwordDisabledChannel" SET NOT NULL,
ALTER COLUMN "blockwordDisabledChannel" SET DEFAULT '',
ALTER COLUMN "blockwordDisabledChannel" SET DATA TYPE TEXT;
