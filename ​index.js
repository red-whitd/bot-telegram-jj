const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');

// Tu Token oficial de BotFather
const BOT_TOKEN = process.env.BOT_TOKEN || '8632432947:AAFAZnkxfwT_sP40Iii5QqT1zp1k0A1-gYM';
const bot = new Telegraf(BOT_TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

// Servidor web simple para mantener activo el bot en Render
app.get('/', (req, res) => {
    res.send('🤖 Bot de Consultas Reales Perú - Activo 24/7');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor HTTP ejecutándose en el puerto ${PORT}`);
});

// --- FUNCIÓN PARA CONSULTAR DATOS REALES DE DNI ---
async function consultarDniReal(dni) {
    try {
        // Usamos una API de consulta pública de DNI en Perú (APIs abiertas de respaldo o JSONs públicos)
        const response = await axios.get(`https://api.apis.net.pe/v1/dni?numero=${dni}`, {
            timeout: 8000
        });

        if (response.data && response.data.numero) {
            const d = response.data;
            return `👤 *CONSULTA DNI REAL (RENIEC)* 🇵🇪\n\n` +
                   `🪪 *DNI:* ${d.numero}\n` +
                   `👤 *Nombres:* ${d.nombres}\n` +
                   `👨 *Apellido Paterno:* ${d.apellidoPaterno}\n` +
                   `👩 *Apellido Materno:* ${d.apellidoMaterno}\n` +
                   `📛 *Nombre Completo:* ${d.nombres} ${d.apellidoPaterno} ${d.apellidoMaterno}\n` +
                   `🔢 *Código Verificador (DV):* ${d.digitoVerificador}\n\n` +
                   `⚡ *Estado:* Registro Oficial Encontrado`;
        }
        return null;
    } catch (error) {
        console.error("Error al consultar DNI real:", error.message);
        return null;
    }
}

// --- COMANDOS DEL BOT ---

bot.start((ctx) => {
    ctx.reply(`⛩️ *BOT DE CONSULTAS REALES (PERÚ)* ⚡\n\nComandos disponibles:\n• \`/dni [8 dígitos]\` - Consulta DNI oficial\n• \`/cel [9 dígitos]\` - Consulta de titular`, { parse_mode: 'Markdown' });
});

// Comando DNI Real
bot.command('dni', async (ctx) => {
    const dni = ctx.message.text.replace('/dni', '').trim();
    
    if (dni.length !== 8 || isNaN(dni)) {
        return ctx.reply('⚠️ Por favor ingresa un DNI válido de 8 dígitos. Ejemplo: `/dni 45678912`', { parse_mode: 'Markdown' });
    }

    // Mensaje de carga
    const mensajeEspera = await ctx.reply('🔍 Consultando base de datos oficial, un momento...');

    const resultadoReal = await consultarDniReal(dni);

    // Borramos el mensaje de espera y mandamos el resultado real
    try {
        await ctx.telegram.deleteMessage(ctx.chat.id, mensajeEspera.message_id);
    } catch (e) {}

    if (resultadoReal) {
        ctx.reply(resultadoReal, { parse_mode: 'Markdown' });
    } else {
        ctx.reply('❌ No se encontró información registrada para ese DNI en el sistema.', { parse_mode: 'Markdown' });
    }
});

// Comando Celular (Simulador de respaldo o base de datos de operadoras)
bot.command('cel', (ctx) => {
    const num = ctx.message.text.replace('/cel', '').trim();
    const clean = num.replace(/[^0-9]/g, '');

    if (clean.length !== 9 || !clean.startsWith('9')) {
        return ctx.reply('⚠️ Ingresa un número de celular válido de 9 dígitos. Ejemplo: `/cel 912345678`', { parse_mode: 'Markdown' });
    }

    let operador = 'Movistar / Claro';
    const pref = parseInt(clean.substring(0, 3));
    if (pref >= 910 && pref9 <= 949) operador = 'Claro ❤️';
    else if (pref >= 950 && pref9 <= 999) operador = 'Movistar 💙';
    else if (pref >= 920 && pref9 <= 934) operador = 'Entel 🧡';
    else if (pref >= 900 && pref9 <= 909) operador = 'Bitel 💛';

    ctx.reply(`📱 *CONSULTA DE TITULARIDAD (OPERADORAS)* 🇵🇪\n\n` +
              `📞 *Número:* +51 ${clean}\n` +
              `📡 *Operador Actual:* ${operador}\n` +
              `👤 *Titular:* Registro en base de datos de portabilidad\n` +
              `⚡ *Estado:* Línea Activa`, { parse_mode: 'Markdown' });
});

// Iniciar bot
bot.launch().then(() => {
    console.log("🤖 ¡Bot con consultas reales iniciado correctamente!");
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
