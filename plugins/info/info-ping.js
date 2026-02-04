let handler = async (m) => {
    const start = performance.now();
    const end = performance.now();
    const resp = (end - start).toFixed(4);
    m.reply(`${resp} ms`);
};
handler.command = /^(ping)$/i;
export default handler;
