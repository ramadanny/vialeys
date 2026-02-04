/**
 * @file RPG Mining Plugin - UI Consistent Style
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];
    const now = Date.now();
    const cooldown = 3 * 60 * 1000; 

    if (user.pickaxe < 1) return m.reply(`${color.red('FAILED')} | Kamu butuh Pickaxe.`);
    if (now - user.last_nambang < cooldown) {
        const rem = ((cooldown - (now - user.last_nambang)) / 1000).toFixed(0);
        return m.reply(`${color.red('WAIT')} | Tunggu ${rem}s lagi.`);
    }
    
    const dapatBatu = Math.floor(Math.random() * 10);
    const dapatEmas = Math.floor(Math.random() * 2);
    user.batu += dapatBatu;
    user.emas += dapatEmas;
    user.last_nambang = now;

    let list = `${markdown.bold('⛏️ MINING REPORT')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Batu'.padEnd(12))} : ${color.white('+' + dapatBatu)}\n`;
    list += `${markdown.bold('Emas'.padEnd(12))} : ${color.yellow('+' + dapatEmas)}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.italic('Nambang menguras tenaga, beristirahatlah.')}`;

    m.reply(`\n${list}\n`);
};
handler.help = ['nambang'];
handler.tags = ['rpg'];
handler.command = /^(nambang|mine)$/i;
export default handler;