/**
 * @file RPG Heal Plugin - UI Consistent Style
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];

    if (user.medkit < 1) return m.reply(`${color.red('FAILED')} | Tidak punya Medkit.`);
    if (user.hp >= user.max_hp) return m.reply(`${color.cyan('INFO')} | Darah masih penuh.`);

    user.medkit -= 1;
    user.hp = user.max_hp;

    let list = `${markdown.bold('💉 MEDICAL REPORT')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Item Used'.padEnd(12))} : ${color.red('-1 Medkit')}\n`;
    list += `${markdown.bold('Status'.padEnd(12))} : ${color.green('FULL RECOVERED')}\n`;
    list += `${markdown.bold('HP Now'.padEnd(12))} : ${color.brightGreen(user.hp + '/' + user.max_hp)}\n`;
    list += `--------------------------------\n`;

    m.reply(`\n${list}\n`);
};
handler.help = ['heal'];
handler.tags = ['rpg'];
handler.command = /^(heal|obati)$/i;
export default handler;