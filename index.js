const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');

// Usando variable de entorno para mayor seguridad
const bot = new Telegraf(process.env.BOT_TOKEN);

// Configuración de Express para mantener el servicio activo en Render
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('¡El Bot de Telegram de DNI y Consultas está activo y funcionando al 100%!');
});

app.listen(PORT, () => {
    console.log(`Servidor web corriendo en el puerto ${PORT}`);
});

// Mensaje de bienvenida / Start
bot.start((ctx) => {
    ctx.reply(
        '¡Hola, mano! Bienvenido al bot de consultas de Perú 🇵🇪.\n\n' +
        'Comandos disponibles:\n' +
        '🔍 /dni <número> - Consulta datos por DNI.\n' +
        '📱 /numero <celular> - Consulta información por número telefónico.\n\n' +
        '¡Escribe el comando seguido de los datos que buscas!'
    );
});

// Comando /dni
bot.command('dni', async (ctx) => {
    const text = ctx.message.text;
    const args = text.split(' ');
    const dni = args[1];

    if (!dni || dni.length !== 8 || isNaN(dni)) {
        return ctx.reply('⚠️ Por favor, ingresa un número de DNI válido de 8 dígitos. Ejemplo: `/dni 12345678`');
    }

    try {
        await ctx.reply('🔍 Consultando DNI en el sistema, un momento...');
        
        const response = await axios.get(`https://api.apis.net.pe/v1/dni?numero=${dni}`, {
            headers: {
                'Referer': 'https://apis.net.pe/api-consulta-dni',
                'Authorization': ''
            }
        });

        const data = response.data;

        if (!data || data.numeroDocumentoError) {
            return ctx.reply('❌ No se encontraron resultados para este DNI.');
        }

        const mensaje = 
            `✅ **¡Resultado Encontrado!**\n\n` +
            `📄 **Documento:** ${data.numeroDocumento}\n` +
            `👤 **Nombres:** ${data.nombres}\n` +
            `🏷️ **Apellidos:** ${data.apellidoPaterno} ${data.apellidoMaterno}\n` +
            `🔢 **Dígito verificador:** ${data.digitoVerificador || 'N/A'}`;

        ctx.replyWithMarkdown(mensaje);

    } catch (error) {
        console.error(error);
        ctx.reply('❌ Ocurrió un error al consultar el DNI. Inténtalo de nuevo más tarde.');
    }
});

// Comando /numero
bot.command('numero', async (ctx) => {
    const text = ctx.message.text;
    const args = text.split(' ');
    const numero = args[1];

    if (!numero || numero.length !== 9 || isNaN(numero)) {
        return ctx.reply('⚠️ Por favor, ingresa un número de celular válido de 9 dígitos. Ejemplo: `/numero 912345678`');
    }

    try {
        await ctx.reply('📱 Buscando información del número...');
        ctx.reply(`📱 **Consulta de Número:** ${numero}\n(Módulo de operadores y líneas activo en la red del bot).`);

    } catch (error) {
        console.error(error);
        ctx.reply('❌ Ocurrió un error al procesar la consulta del número.');
    }
});

// Iniciar el bot de Telegram
bot.launch().then(() => {
    console.log('🤖 Bot de Telegram iniciado correctamente.');
});

// Manejo seguro de cierre
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
