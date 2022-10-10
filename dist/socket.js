"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const process_1 = require("process");
const socket_io_1 = require("socket.io");
const index_1 = require("./index");
const prisma_1 = __importDefault(require("./prisma"));
const ban_1 = require("./utils/ban");
const discord_1 = require("./utils/discord");
const mod_1 = require("./utils/mod");
const role_1 = require("./utils/role");
const dashboardIo = new socket_io_1.Server((0, http_1.createServer)(), {
    cors: {
        origin: [process_1.env.SITE]
    }
});
dashboardIo.on('connection', async (socket) => {
    socket.on('data', async (recv) => {
        const { guildId, changed, data } = JSON.parse(recv.toString());
        // client에서 직접 차단 리스트를 가져와서 data하고 비교
        if (changed.includes('mod')) {
            const newModList = data.mod.map(m => m.userId);
            const guild = (index_1.client.guilds.cache.get(guildId));
            await (0, discord_1.updateMemberCache)(guild);
            const oldModList = (await prisma_1.default.memberData.findMany({ where: { guildId, mod: true } })).map(m => m.userId);
            oldModList.forEach(async (id) => {
                if (newModList.includes(id))
                    return;
                const target = await (0, discord_1.getMember)(guild, id);
                target.roles.remove((await (0, role_1.getGuildModRole)(guild)).id);
            });
            (0, mod_1.updateGuildMod)(guildId, data);
        }
        if (changed.includes('ban')) {
            const newBanList = data.ban.map((b) => b.userId);
            const guild = (index_1.client.guilds.cache.get(guildId));
            await (0, ban_1.updateBanListCache)(guild);
            const oldBanList = guild.bans.cache.map(b => b.user.id);
            oldBanList.forEach(async (id) => {
                if (newBanList.includes(id))
                    return;
                await guild.members.unban(id);
            });
        }
    });
});
function openSocketServer() {
    dashboardIo.listen(7321);
    console.log(`Dashboard Socket Server is Opened`);
}
exports.default = openSocketServer;
