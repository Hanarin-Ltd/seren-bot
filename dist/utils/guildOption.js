"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyGuildOption = exports.setDefaultGuildOption = exports.getGuildOption = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getGuildOption = async (guildId) => {
    return await prisma_1.default.guildOption.findUnique({ where: { guildId } });
};
exports.getGuildOption = getGuildOption;
const setDefaultGuildOption = async (guildId) => {
    return await prisma_1.default.guildOption.create({
        data: {
            guildId
        }
    });
};
exports.setDefaultGuildOption = setDefaultGuildOption;
const modifyGuildOption = async (data) => {
    return await prisma_1.default.guildOption.update({
        where: { guildId: data.guildId },
        data
    });
};
exports.modifyGuildOption = modifyGuildOption;
