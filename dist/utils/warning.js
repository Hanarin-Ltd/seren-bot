"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeWarning = exports.giveWarning = exports.getWarningList = exports.getWarning = void 0;
const discord_js_1 = require("discord.js");
const prisma_1 = __importDefault(require("../prisma"));
const log_1 = require("./log");
const memberData_1 = require("./memberData");
const getWarning = async (guildId, memberId) => {
    const result = await prisma_1.default.memberData.findFirst({ where: {
            guildId,
            userId: memberId,
        } });
    return result ? result.warning : 0;
};
exports.getWarning = getWarning;
const getWarningList = async (guildId) => {
    const data = await prisma_1.default.memberData.findMany({ where: { guildId } });
    return data.filter(m => m.warning > 0);
};
exports.getWarningList = getWarningList;
const giveWarning = async (guildId, member, num = 1) => {
    const exist = await (0, memberData_1.getMemberData)(member.id);
    const logSetting = await (0, log_1.getGuildLogSetting)(guildId);
    try {
        await prisma_1.default.memberData.updateMany({
            where: { guildId, userId: member.id },
            data: {
                warning: exist.warning + num
            }
        });
        (logSetting === null || logSetting === void 0 ? void 0 : logSetting.getWarning) && (0, log_1.log)({
            content: `경고 추가 멤버 : ${member.user.username} / 갯수 : ${num}개`,
            rawContent: `경고 추가 멤버 : ${(0, discord_js_1.userMention)(member.id)} / 갯수 : ${num}개`,
            guild: member.guild,
            type: 'getWarning'
        });
    }
    catch {
        await (0, memberData_1.addMemberData)(member);
        await (0, exports.giveWarning)(guildId, member, num);
    }
};
exports.giveWarning = giveWarning;
const removeWarning = async (guildId, member, num = 1) => {
    const logSetting = await (0, log_1.getGuildLogSetting)(guildId);
    const warningCount = await (0, exports.getWarning)(guildId, member.id);
    await prisma_1.default.memberData.updateMany({
        where: { guildId, userId: member.id },
        data: {
            warning: num >= warningCount ? 0 : warningCount - num
        }
    });
    (logSetting === null || logSetting === void 0 ? void 0 : logSetting.getWarning) && (0, log_1.log)({
        content: `경고 제거 멤버 : ${member.user.username} / 갯수 : ${num >= warningCount ? warningCount : num}개`,
        rawContent: `경고 제거 멤버 : ${(0, discord_js_1.userMention)(member.id)} / 갯수 : ${num >= warningCount ? warningCount : num}개`,
        guild: member.guild,
        type: 'removeWarning'
    });
};
exports.removeWarning = removeWarning;
