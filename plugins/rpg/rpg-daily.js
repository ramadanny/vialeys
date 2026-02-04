/**
 * @file RPG Daily Plugin - UI Consistent Style
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (now - user.last_daily < cooldown) {
        const remaining = cooldown - (now - user.last_daily);
        const hours = Math.floor(remaining / 3600000);
        return m.reply(`${color.red('FAILED')} | Tunggu ${markdown.bold(hours)} jam lagi.`);
    }

    user.money += 5000;
    user.exp += 500;
    user.last_daily = now;

    let list = `${markdown.bold('🎁 DAILY REWARD')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Status'.padEnd(12))} : ${color.green('SUCCESS')}\n`;
    list += `${markdown.bold('Money'.padEnd(12))} : ${color.yellow('+$5.000')}\n`;
    list += `${markdown.bold('Exp'.padEnd(12))} : ${color.cyan('+500')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.italic('Klaim lagi besok di jam yang sama.')}`;

    m.reply(`\n${list}\n`);
};
handler.help = ['daily'];
handler.tags = ['rpg'];
handler.command = /^(daily|claim)$/i;
export default handler;