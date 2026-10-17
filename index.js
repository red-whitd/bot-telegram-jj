const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');

// Lee el token de forma segura desde las variables de Railway
const bot = new Telegraf(process.env.BOT_TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('¡Bot activo!');
});

app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});

bot.start((ctx) => {
    ctx.reply('¡Hola, mano! Bot activo. Usa /dni <numero> para consultar.');
});

bot.command('dni', async (ctx) => {
    const text = ctx.message.text;
    const args = text.split(' ');
    const dni = args[1];

    if (!dni || dni.length !== 8 || isNaN(dni)) {
        return ctx.reply('⚠️ Ingresa un DNI válido de 8 dígitos. Ejemplo: `/dni 12345678`');
    }

    try {
        await ctx.reply('🔍 Consultando DNI...');
        const response = await axios.get(`https://api.apis.net.pe/v1/dni?numero=${dni}`, {
            headers: { 'Referer': 'https://apis.net.pe/api-consulta-dni', 'Authorization': '' }
        });

        const data = response.data;
        if (!data || data.numeroDocumentoError) {
            return ctx.reply('❌ No se encontraron resultados.');
        }

        ctx.reply(`✅ **Resultado:**\nDocumento: ${data.numeroDocumento}\nNombres: ${data.nombres}\nApellidos: ${data.apellidoPaterno} ${data.apellidoMaterno}`);
    } catch (error) {
        ctx.reply('❌ Error al consultar el DNI.');
    }
});

bot.launch().then(() => {
    console.log('🤖 Bot iniciado correctamente.');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
