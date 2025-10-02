// gpt.js
const OpenAI = require('openai');

const getActividad = async () => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

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

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages
        });

        return completion.choices[0].message.content;

    } catch (error) {
        // Si no hay crédito o hay error, devolvemos lista fija
        if (error.status === 429) {
            return `** Jugar online **: Among Us  
** Salir a pasear **: Parque cercano  
** Salir a acampar **: Reserva natural  
** Caminar un rato **: Ruta de 30 min  
** Hacer deportes **: Básquet  
** Otras actividades **: Leer un libro al aire libre`;
        }

        return 'Ocurrió un error al generar la actividad.';
    }
};

module.exports = { getActividad };
