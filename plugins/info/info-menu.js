/**
 * @file Main Menu Plugin - UI Consistent Style
 * @description Menampilkan menu dengan statistik lengkap dan desain tabel sejajar.
 */

let handler = async (m) => {
    const user = global.db.data.user[m.sender];
    const plugins = global.plugins;
    const requiredExp = user.level * 100;

    // Objek untuk menampung kategori
    let menuData = {};
    let totalAllPlugins = 0;

    // 1. Kelompokkan perintah berdasarkan tag/kategori
    Object.values(plugins).forEach(p => {
        if (!p || !p.help) return;
        
        const tags = Array.isArray(p.tags) ? p.tags : ['others'];
        // Hanya ambil index pertama dari array help agar tidak ganda
        const firstHelp = Array.isArray(p.help) ? p.help[0] : p.help;

        tags.forEach(tag => {
            if (!menuData[tag]) menuData[tag] = [];
            if (!menuData[tag].includes(firstHelp)) {
                menuData[tag].push(firstHelp);
                totalAllPlugins++;
            }
        });
    });

    // 2. Urutkan Kategori secara Alfabet
    const sortedCategories = Object.keys(menuData).sort();

    // 3. Bangun Header & Profile (Consistent Style)
    let menu = `${markdown.bold('LIORA - ADVANCED BOT CLI')}\n`;
    menu += `--------------------------------\n`;
    menu += `${markdown.bold('USER PROFILE')}\n`;
    menu += `${markdown.bold('Name'.padEnd(12))} : ${color.cyan(user.name.toUpperCase())}\n`;
    menu += `${markdown.bold('Level'.padEnd(12))} : ${color.magenta(user.level)}\n`;
    menu += `${markdown.bold('Exp'.padEnd(12))} : ${color.white(user.exp + ' / ' + requiredExp)}\n`;
    menu += `${markdown.bold('Rank'.padEnd(12))} : ${color.brightGreen(user.rank)}\n`;
    menu += `${markdown.bold('Title'.padEnd(12))} : ${color.yellow(user.title)}\n`;
    menu += `--------------------------------\n\n`;

    // 4. Bangun Kategori & List Perintah
    sortedCategories.forEach(category => {
        const categoryItems = menuData[category].sort();
        const totalInCategory = categoryItems.length;
        
        // Header Kategori: -- [CATEGORY] [total]
        menu += `${color.white('--')} ${markdown.bold('[' + category.toUpperCase() + ']')} ${color.gray('[' + totalInCategory + ']')}\n`;
        
        categoryItems.forEach((cmd) => {
            // Indentasi rapi dengan poin
            menu += `   ${color.cyan('•')} ${color.white(cmd)}\n`;
        });
        
        menu += `\n`; 
    });

    // 5. Bangun Footer
    menu += `--------------------------------\n`;
    menu += `Total  : ${color.yellow('[' + totalAllPlugins + ' Items]')}\n`;
    menu += `${markdown.italic('Type a command to execute.')}\n`;
    menu += `--------------------------------`;

    m.reply(`\n${menu}\n`);
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|\?)$/i;

export default handler;