/**
 * @file RPG Withdraw Plugin - UI Consistent Style
 */
let handler = async (m, { args }) => {
    const user = global.db.data.user[m.sender];
    const amount = parseInt(args[0]);

    if (!amount || isNaN(amount) || amount <= 0) return m.reply(`${color.red('ERROR')} | Masukkan jumlah valid.`);
    if (user.bank < amount) return m.reply(`${color.red('FAILED')} | Saldo bank tidak cukup.`);

    user.bank -= amount;
    user.money += amount;

    let list = `${markdown.bold('🏦 BANK WITHDRAW')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Amount'.padEnd(12))} : ${color.green('$' + amount.toLocaleString())}\n`;
    list += `${markdown.bold('Bank Bal'.padEnd(12))} : ${color.white('$' + user.bank.toLocaleString())}\n`;
    list += `${markdown.bold('Cash Now'.padEnd(12))} : ${color.yellow('$' + user.money.toLocaleString())}\n`;
    list += `--------------------------------\n`;

    m.reply(`\n${list}\n`);
};
handler.help = ['tarik'];
handler.tags = ['rpg'];
handler.command = /^(tarik)$/i;
export default handler;