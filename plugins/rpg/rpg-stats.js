/**
 * @file RPG Stats Plugin - Full Database Display
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];
    const requiredExp = user.level * 100;
    
    let list = `${markdown.bold('👤 CHARACTER FULL PROFILE')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Name'.padEnd(12))} : ${color.cyan(user.name.toUpperCase())}\n`;
    list += `${markdown.bold('Title'.padEnd(12))} : ${color.yellow(user.title)}\n`;
    list += `${markdown.bold('Rank'.padEnd(12))} : ${color.brightGreen(user.rank)}\n`;
    list += `${markdown.bold('Level'.padEnd(12))} : ${color.magenta(user.level)}\n`;
    list += `${markdown.bold('Exp'.padEnd(12))} : ${color.white(user.exp + ' / ' + requiredExp)}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('HP'.padEnd(12))} : ${color.red(user.hp + ' / ' + user.max_hp)}\n`;
    list += `${markdown.bold('Stamina'.padEnd(12))} : ${color.yellow(user.stamina + ' / ' + user.max_stamina)}\n`;
    list += `${markdown.bold('Energy'.padEnd(12))} : ${color.blue(user.energy + ' / ' + user.max_energy)}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Strength'.padEnd(12))} : ${color.red(user.strength)}\n`;
    list += `${markdown.bold('Agility'.padEnd(12))} : ${color.green(user.agility)}\n`;
    list += `${markdown.bold('Int'.padEnd(12))} : ${color.blue(user.intelligence)}\n`;
    list += `${markdown.bold('Luck'.padEnd(12))} : ${color.yellow(user.luck)}\n`;
    list += `${markdown.bold('Defense'.padEnd(12))} : ${color.white(user.defense)}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Money'.padEnd(12))} : ${color.green('$' + user.money.toLocaleString())}\n`;
    list += `${markdown.bold('Bank'.padEnd(12))} : ${color.blue('$' + user.bank.toLocaleString())}\n`;
    list += `${markdown.bold('Premium'.padEnd(12))} : ${user.premium ? color.green('YES') : color.red('NO')}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Pet Name'.padEnd(12))} : ${color.cyan(user.pet_name)}\n`;
    list += `${markdown.bold('Pet Lvl'.padEnd(12))} : ${color.magenta(user.pet_level)}\n`;
    list += `--------------------------------\n`;
    list += `${markdown.bold('Win'.padEnd(12))} : ${color.green(user.win)}\n`;
    list += `${markdown.bold('Lose'.padEnd(12))} : ${color.red(user.lose)}\n`;
    list += `${markdown.bold('Draw'.padEnd(12))} : ${color.gray(user.draw)}\n`;
    list += `--------------------------------\n`;

    m.reply(`\n${list}\n`);
};
handler.help = ['stats'];
handler.tags = ['rpg'];
handler.command = /^(stats|status|profile)$/i;
export default handler;