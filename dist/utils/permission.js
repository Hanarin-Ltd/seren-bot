"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyGuildPermission = exports.setDefaultGuildPermission = exports.getGuildPermission = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getGuildPermission = async (guildId) => {
    return await prisma_1.default.guildPermission.findUnique({ where: { guildId } });
};
exports.getGuildPermission = getGuildPermission;
const setDefaultGuildPermission = async (guildId) => {
    return await prisma_1.default.guildPermission.create({
        data: {
            guildId
        }
    });
};
exports.setDefaultGuildPermission = setDefaultGuildPermission;
const modifyGuildPermission = async (data) => {
    return await prisma_1.default.guildPermission.update({
        where: { guildId: data.guildId },
        data
    });
};
exports.modifyGuildPermission = modifyGuildPermission;
