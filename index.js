const { Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { getActividad } = require('./gpt');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.on(Events.ClientReady, c => {
    console.log('Bot conectado');

    c.user.setActivity('Actividades para realizar');

    const actividadesCommand = new SlashCommandBuilder()
        .setName('actividad')
        .setDescription('Proporciona una actividad para realizar');

    c.application.commands.create(actividadesCommand);
});

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'actividad') {
        await interaction.deferReply();
        const actividad = await getActividad();
        await interaction.editReply(actividad);
    }
});


client.login(process.env.DISCORD_TOKEN)
