/**
 * @file RPG Adventure Plugin - UI Consistent Style
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];
    const now = Date.now();
    const cooldown = 10 * 60 * 1000; 

    if (now - user.cooldown_adventure < cooldown) {
        const rem = Math.floor((cooldown - (now - user.cooldown_adventure)) / 60000);
        return m.reply(`${color.red('WAIT')} | Masih lelah. Tunggu ${rem} menit.`);
    }

    const findDiamond = Math.random() > 0.9;
    const expReward = 200 + Math.floor(Math.random() * 100);
    const moneyReward = 500 + Math.floor(Math.random() * 500);
    
    user.cooldown_adventure = now;
    user.exp += expReward;
    user.money += moneyReward;
    user.energy -= 10;

    let list = `${markdown.bold('🗺️ ADVENTURE REPORT')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Exp'.padEnd(12))} : ${color.cyan('+' + expReward)}\n`;
    list += `${markdown.bold('Money'.padEnd(12))} : ${color.yellow('+$' + moneyReward)}\n`;
    if (findDiamond) {
        user.diamond += 1;
        list += `${markdown.bold('Rare Item'.padEnd(12))} : ${color.brightGreen('1 Diamond 💎')}\n`;
    }
    list += `${markdown.bold('Energy'.padEnd(12))} : ${color.red('-10')}\n`;
    list += `--------------------------------\n`;

    m.reply(`\n${list}\n`);
    
    if (user.exp >= user.level * 100) {
        user.level++;
        user.exp = 0;
        m.reply(`${color.yellow('🆙 LEVEL UP!')} | Sekarang level ${user.level}`);
    }
};
handler.help = ['adventure'];
handler.tags = ['rpg'];
handler.command = /^(adventure|petualang)$/i;
export default handler;