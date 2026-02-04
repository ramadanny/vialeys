/**
 * @file RPG Hunt Plugin - UI Consistent Style
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];
    const now = Date.now();
    const cd = 3 * 60 * 1000;

    if (now - user.last_hunt < cd) {
        const rem = ((cd - (now - user.last_hunt)) / 1000).toFixed(0);
        return m.reply(`${color.red('WAIT')} | Senjata belum siap. Tunggu ${rem}s.`);
    }

    const mny = Math.floor(Math.random() * 500);
    const exp = Math.floor(Math.random() * 100);
    user.money += mny; user.exp += exp; user.hp -= 10; user.last_hunt = now;

    let list = `${markdown.bold('⚔️ HUNTING REPORT')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Monster'.padEnd(12))} : ${color.brightRed('Wild Slime')}\n`;
    list += `${markdown.bold('Result'.padEnd(12))} : ${color.green('VICTORY')}\n`;
    list += `${markdown.bold('Reward'.padEnd(12))} : ${color.yellow('+$' + mny)} & ${color.cyan('+' + exp + ' Exp')}\n`;
    list += `${markdown.bold('Health'.padEnd(12))} : ${color.red('-10 HP')}\n`;
    list += `--------------------------------\n`;
    
    m.reply(`\n${list}\n`);

    if (user.exp >= user.level * 100) {
        user.level++;
        user.exp = 0;
        m.reply(`${color.yellow('🆙 LEVEL UP!')} | Sekarang level ${user.level}`);
    }
};
handler.help = ['hunt'];
handler.tags = ['rpg'];
handler.command = /^(hunt|berburu)$/i;
export default handler;