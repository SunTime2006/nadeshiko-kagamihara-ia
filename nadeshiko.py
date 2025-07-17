import discord
import random

TOKEN = 'MTM5NTIyNDM4NjA3NTc1ODYwMg.GxTuri.7R4fgJT5z5l3_8CpbMoRYfXW-ts4LCOXdd6oHc'  # 👉 Coloca aquí el token de tu bot

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
intents.guilds = True

client = discord.Client(intents=intents)

# Lista de frases que puede decir el bot
frases_personalidad = [
    "😎 Jajaja, eso estuvo bueno.",
    "👀 ¿En serio? No lo sabía.",
    "😂 Jajaja, me hiciste reír.",
    "🤔 Hmm… interesante.",
    "🔥 Wow, eso suena genial.",
    "😏 ¿Estás seguro de eso?",
    "🙃 Bueno, eso depende de cómo lo mires.",
    "🤣 ¡JAJAJA! Muy cierto.",
    "😴 Uy, me dio sueño solo de leerlo.",
    "😜 Jajaja, tú sí que eres divertido."
]

@client.event
async def on_ready():
    print(f'✅ El bot está conectado como {client.user}')

@client.event
async def on_message(message):
    # Ignora sus propios mensajes
    if message.author == client.user:
        return

    # Genera una respuesta aleatoria
    respuesta = random.choice(frases_personalidad)
    await message.channel.send(respuesta)

client.run(TOKEN)
