/**
 * @file RPG Shop Plugin - Fixed Alignment & Bold
 */

let handler = async (m, { args }) => {
    const user = global.db.data.user[m.sender];
    
    // ANSI Escape Codes untuk Terminal
    const BOLD = '\x1b[1m';
    const RESET = '\x1b[0m';
    const GREEN = '\x1b[32m';

    // Daftar barang
    const items = [
        { name: 'Pickaxe', price: 1000, key: 'pickaxe' },
        { name: 'Kapak',   price: 800,  key: 'kapak' },
        { name: 'Pancing', price: 750,  key: 'pancing' },
        { name: 'Medkit',  price: 500,  key: 'medkit' }
    ];

    if (!args[0]) {
        // Membuat header dan list yang sejajar menggunakan padEnd
        let list = `${BOLD}🛒 SHOP MARKET${RESET}\n`;
        list += `--------------------------------\n`;
        items.forEach((item, i) => {
            const num = `${i + 1}.`.padEnd(3);
            const name = item.name.padEnd(10);
            const price = `$${item.price}`.padStart(8);
            list += `${num} ${BOLD}${name}${RESET} | ${GREEN}${price}${RESET}\n`;
        });
        list += `--------------------------------\n`;
        list += `Gunakan: ${BOLD}shop 1${RESET}`;
        
        return m.reply(list);
    }

    const idx = parseInt(args[0]) - 1;
    if (isNaN(idx) || !items[idx]) return m.reply("Nomor item tidak valid!");

    const selected = items[idx];

    if (user.money < selected.price) {
        return m.reply(`Uang tidak cukup! Butuh ${BOLD}$${selected.price}${RESET}`);
    }

    // Proses Transaksi
    user.money -= selected.price;
    user[selected.key] += 1;

    m.reply(`✅ Berhasil membeli ${BOLD}1 ${selected.name}${RESET} seharga ${GREEN}$${selected.price}${RESET}`);
};

handler.help = ['shop'];
handler.tags = ['rpg'];
handler.command = /^(shop|toko)$/i;

export default handler;