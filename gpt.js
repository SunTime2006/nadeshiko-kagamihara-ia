const OpenAI = require('openai');

const getActividad = async () => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })

    const messages = [
        { role: 'assistant', content: 'Hay muchas actividades que puedes realizar, puedes jugar online, salir a pasear, salir a acampar, caminar un rato, hacer deportes y otras cosas para alegrarnos.'},
        { 
            role: 'user', content: `Quiero realizar una actividad que sea relajante y dinámica a la vez. La estructura debe ser la siguiente:
** Jugar online **: Nombre de la actividad
** Salir a pasear **: Nombre de la actividad
** Salir a acampar **: Nombre de la actividad
** Caminar un rato **: Nombre de la actividad
** Hacer deportes **: Nombre de la actividad
** Otras actividades **: Nombre de la actividad`}
    ];

    const completion = await openai.chatt.completions.create({
        messages,
        model: 'gpt-4'
    });

    return completion.choices[0].message.content;

}

module.exports = { getActividad };