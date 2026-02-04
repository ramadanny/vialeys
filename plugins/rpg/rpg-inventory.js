/**
 * @file RPG Inventory Plugin - Full Items Display
 */
let handler = async (m) => {
    const user = global.db.data.user[m.sender];

    // Mengelompokkan semua item dari database
    const categories = [
        {
            head: '🛠️ TOOLS',
            items: [
                { n: 'Pickaxe', v: user.pickaxe }, { n: 'Kapak', v: user.kapak },
                { n: 'Cangkul', v: user.cangkul }, { n: 'Pancing', v: user.pancing },
                { n: 'Pedang', v: user.pedang }, { n: 'Panah', v: user.panah },
                { n: 'Armor', v: user.armor }, { n: 'Helm', v: user.helm }, { n: 'Sepatu', v: user.sepatu }
            ]
        },
        {
            head: '💎 RESOURCES',
            items: [
                { n: 'Batu', v: user.batu }, { n: 'Kayu', v: user.kayu },
                { n: 'Besi', v: user.besi }, { n: 'Emas', v: user.emas },
                { n: 'Diamond', v: user.diamond }, { n: 'Coal', v: user.coal }
            ]
        },
        {
            head: '🍕 FOOD & DRINK',
            items: [
                { n: 'Nasi', v: user.nasi }, { n: 'Roti', v: user.roti },
                { n: 'Daging', v: user.daging }, { n: 'Ikan', v: user.ikan },
                { n: 'Apel', v: user.apel }, { n: 'Pisang', v: user.pisang },
                { n: 'Sayur', v: user.sayur }, { n: 'Air', v: user.air },
                { n: 'Susu', v: user.susu }, { n: 'Kopi', v: user.kopi }
            ]
        },
        {
            head: '🎣 FISHING',
            items: [
                { n: 'Lele', v: user.ikan_lele }, { n: 'Nila', v: user.ikan_nila },
                { n: 'Mas', v: user.ikan_mas }, { n: 'Tuna', v: user.ikan_tuna },
                { n: 'Salmon', v: user.ikan_salmon }, { n: 'Hiu', v: user.ikan_hiu }
            ]
        },
        {
            head: '💊 MEDICAL',
            items: [
                { n: 'Medkit', v: user.medkit }, { n: 'Bandage', v: user.bandage },
                { n: 'Vitamin', v: user.vitamin }, { n: 'Obat', v: user.obat }
            ]
        },
        {
            head: '🐾 PETS & LIVESTOCK',
            items: [
                { n: 'Kucing', v: user.kucing }, { n: 'Ayam', v: user.ayam },
                { n: 'Sapi', v: user.sapi }, { n: 'Kambing', v: user.kambing },
                { n: 'Anjing', v: user.anjing }, { n: 'Kelinci', v: user.kelinci }
            ]
        }
    ];

    let list = `${markdown.bold('🎒 PLAYER FULL INVENTORY')}\n`;
    
    categories.forEach(cat => {
        list += `--------------------------------\n`;
        list += `${markdown.bold(cat.head)}\n`;
        let hasItem = false;
        cat.items.forEach(item => {
            if (item.v > 0) {
                hasItem = true;
                list += `${item.n.padEnd(15)} : ${color.cyan(item.v)}\n`;
            }
        });
        if (!hasItem) list += `${color.gray('  (Kosong)')}\n`;
    });
    
    list += `--------------------------------\n`;
    list += `${markdown.italic('Ketik menu untuk melihat perintah lainnya.')}`;

    m.reply(`\n${list}\n`);
};

handler.help = ['inventory'];
handler.tags = ['rpg'];
handler.command = /^(inv|inventory|tas)$/i;
export default handler;