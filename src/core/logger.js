/**
 * 🌀 LOGGER — log colorido e leve.
 */
const C = { reset: '\x1b[0m', cinza: '\x1b[90m', vermelho: '\x1b[31m', verde: '\x1b[32m', amarelo: '\x1b[33m', magenta: '\x1b[35m', ciano: '\x1b[36m' };
function timestamp() { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; }
function fmt(color, tag, args) { return [`${C.cinza}[${timestamp()}]${C.reset}`, `${color}${tag.padEnd(5)}${C.reset}`, ...args]; }
module.exports = {
    info: (...a) => console.log(...fmt(C.verde, 'INFO', a)),
    warn: (...a) => console.log(...fmt(C.amarelo, 'WARN', a)),
    error: (...a) => console.error(...fmt(C.vermelho, 'ERROR', a)),
    debug: (...a) => { if (process.env.DEBUG === 'true') console.log(...fmt(C.magenta, 'DEBUG', a)); },
    boot: (...a) => console.log(...fmt(C.ciano, 'BOOT', a)),
};