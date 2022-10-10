"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_1 = require("../utils/default");
const discord_1 = require("../utils/discord");
const warning_1 = require("../utils/warning");
async function warning(interaction) {
    await interaction.deferReply();
    const args = interaction.options;
    const targetMember = args.getMember('멤버');
    const option = args.getString('설정');
    const warningAmount = args.getNumber('갯수');
    const thisGuild = await (0, discord_1.getThisGuild)(interaction);
    if (option === 'add') {
        await (0, warning_1.giveWarning)(thisGuild.id, targetMember, warningAmount ? warningAmount : 1);
    }
    else if (option === 'remove') {
        await (0, warning_1.removeWarning)(thisGuild.id, targetMember, warningAmount ? warningAmount : 1);
    }
    await interaction.editReply({ embeds: [(0, default_1.completeSuccessfullyMessage)()] });
}
exports.default = warning;
