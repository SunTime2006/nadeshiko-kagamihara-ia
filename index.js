console.log("¡Hola desde la terminal!")

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { getActividad, askOpenAI } = require('./gpt');

const recentlyReplied = new Set();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const conversationMemory = new Map();
const HISTORY_LIMIT = 10;

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
    console.error('Error registrando comando:', error);
  }
});

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

function pushToMemory(convId, role, content) {
  if (!conversationMemory.has(convId)) conversationMemory.set(convId, []);
  const arr = conversationMemory.get(convId);
  arr.push({ role, content });
  while (arr.length > HISTORY_LIMIT * 2) arr.shift();
}

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;
  if (!message.guild) return;

  if (recentlyReplied.has(message.id)) return;
  recentlyReplied.add(message.id);
  setTimeout(() => recentlyReplied.delete(message.id), 1000); // 1s

  const prefix = 'n!';
  const raw = (message.content || '').trim();
  if (!raw) return;

  const isMention = message.mentions && message.mentions.users && message.mentions.users.has(client.user.id);
  const startsWithPrefix = raw.toLowerCase().startsWith(prefix);

  if (/^hola\b/i.test(raw)) {
    await message.reply("¡Holaaa! Soy Nadeshiko, ¿cómo estás?");
    return;
  }

  if (/^(?:bien y tu|bien y tú|bien, y tú)\b/i.test(raw)) {
    await message.reply("Awwww, me encuentro bien");
    return;
  }

  if (/^gracias\b/i.test(raw)) {
    await message.reply("De nada, eres muy educado");
    return;
  }

  if (/^(?:que te gusta hacer|qué te gusta hacer)\b/i.test(raw)) {
    await message.reply("Me gusta ver animes, jugar videojuegos, leer, acampar, etc");
    return;
  }

  if (/^ga+a+\b/i.test(raw)) {
    await message.reply("Gaaaaaaa");
    return;
  }

  if (/^Ay no\b/i.test(raw)) {
    await message.reply("Que te pasó");
    return;
  }


  if (!isMention && !startsWithPrefix) {
    return;
  }

  let userText = raw;
  if (isMention) {
    userText = userText.replace(new RegExp(`<@!?(?:${client.user.id})>`, 'g'), '').trim();
  }
  if (startsWithPrefix) userText = userText.slice(prefix.length).trim();

  if (!userText) {
    await message.reply("¿Sí? ¿En qué puedo ayudarte? Escribe tu mensaje después de mencionarme o usar `n!`.");
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[CONFIG] OPENAI_API_KEY no definida — saltando llamada a OpenAI');
    await message.reply("Lo siento, ahora mismo no puedo acceder al motor de IA 😴");
    return;
  }

  try {
    try { await message.channel.sendTyping(); } catch (e) { /* ignorable */ }

    const convId = message.channel.id;
    if (!conversationMemory.has(convId)) {
      pushToMemory(convId, 'system', 'Eres Nadeshiko Kagamihara de Yuru Camp, una chica alegre, tierna y un poco despistada. Habla como ella y responde con cariño.');
    }

    pushToMemory(convId, 'user', userText);
    const respuesta = await askOpenAI(conversationMemory.get(convId));
    pushToMemory(convId, 'assistant', respuesta);

    await message.reply(respuesta);
  } catch (error) {
    console.error('Error al pedir respuesta a OpenAI:', error);
    await message.reply("Lo siento, estoy un poco cansada y no puedo responder ahora 😴");
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error('[CONFIG] DISCORD_TOKEN no definida. Añade DISCORD_TOKEN en tu .env');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Fallo al iniciar sesión del bot:', err);
});

