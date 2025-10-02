const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { getActividad } = require('./gpt');
require('dotenv').config();
const OpenAI = require('openai');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Registro del comando /actividad
client.once('ready', async () => {
    console.log(`Bot iniciado como ${client.user.tag}`);

    const commands = [
        {
            name: 'actividad',
            description: 'Sugiere actividades relajantes y dinámicas'
        }
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Comando /actividad registrado');
    } catch (error) {
        console.error(error);
    }
});

// Slash command /actividad
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'actividad') {
        await interaction.deferReply();

        const respuesta = await getActividad();

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Actividades sugeridas')
            .setDescription(respuesta)
            .setFooter({ text: 'Bot IA Nadeshiko', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
});

// Chat normal con personalidad (Nadeshiko)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // no responderse a sí mismo

    // Si lo mencionan directamente
    if (message.mentions.has(client.user)) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Eres Nadeshiko Kagamihara de Yuru Camp, una chica alegre, tierna y un poco despistada. Habla como ella y responde con cariño." },
                    { role: "user", content: message.content }
                ]
            });

            const respuesta = completion.choices[0].message.content;

            await message.reply(respuesta);
        } catch (error) {
            console.error("Error en OpenAI:", error);
            await message.reply("Lo siento, estoy un poco cansada y no puedo responder ahora 😴");
        }
    }

    // Si dicen "hola", que salude automáticamente
    if (/hola/i.test(message.content)) {
        await message.reply("¡Holaaa! Soy Nadeshiko, ¿cómo estás?");
    }
});

client.login(process.env.DISCORD_TOKEN);

