// gpt.js
const OpenAI = require('openai');

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const msg = 'La variable de entorno OPENAI_API_KEY no está definida. ' +
                'Ponla en tu .env o en las variables de entorno del sistema.';
    console.error(msg);
    throw new Error(msg);
  }
  return new OpenAI({ apiKey });
}

const getActividad = async () => {
  try {
    const client = getClient();

    const messages = [
      { role: 'system', content: 'Eres un asistente que sugiere actividades.' },
      {
        role: 'user',
        content: `Quiero realizar una actividad que sea relajante y dinámica a la vez. 
La respuesta debe seguir esta estructura:

** Jugar online **: Nombre de la actividad  
** Salir a pasear **: Nombre de la actividad  
** Salir a acampar **: Nombre de la actividad  
** Caminar un rato **: Nombre de la actividad  
** Hacer deportes **: Nombre de la actividad  
** Otras actividades **: Nombre de la actividad`
      }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages
    });

    return completion.choices[0].message.content;
  } catch (error) {
    if (error?.status === 429) {
      return `** Jugar online **: Among Us  
** Salir a pasear **: Parque cercano  
** Salir a acampar **: Reserva natural  
** Caminar un rato **: Ruta de 30 min  
** Hacer deportes **: Básquet  
** Otras actividades **: Leer un libro al aire libre`;
    }
    console.error('Error en getActividad:', error);
    return 'Ocurrió un error al generar la actividad.';
  }
};

const askOpenAI = async (history) => {
  try {
    const client = getClient();
    const messages = history.map(m => ({ role: m.role, content: m.content }));

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error en askOpenAI:', error);
    throw error;
  }
};

module.exports = { getActividad, askOpenAI };


client.login(process.env.DISCORD_TOKEN);


