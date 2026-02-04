/**
 * @file RPG Fishing Plugin - UI Consistent Style
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];
    const now = Date.now();
    const cooldown = 3 * 60 * 1000; 

    if (user.pancing < 1) return m.reply(`${color.red('FAILED')} | Kamu butuh Alat Pancing.`);
    if (now - user.last_mancing < cooldown) {
        const rem = ((cooldown - (now - user.last_mancing)) / 1000).toFixed(0);
        return m.reply(`${color.red('WAIT')} | Tunggu ${rem}s lagi.`);
    }
    
    const lele = Math.floor(Math.random() * 5);
    user.ikan_lele += lele;
    user.last_mancing = now;

    let list = `${markdown.bold('🎣 FISHING REPORT')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Result'.padEnd(12))} : ${color.green('SUCCESS')}\n`;
    list += `${markdown.bold('Catch'.padEnd(12))} : ${color.cyan(lele + ' Ikan Lele')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.italic('Cek tas untuk melihat hasil tangkapan.')}`;

    m.reply(`\n${list}\n`);
};
handler.help = ['mancing'];
handler.tags = ['rpg'];
handler.command = /^(mancing|fishing)$/i;
export default handler;