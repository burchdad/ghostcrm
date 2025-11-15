// Spanish fallback conversation scripts for AI call agents
// Used when OpenAI API is unavailable or encounters errors and customer prefers Spanish

export const generateSpanishProfessionalFlow = (name: string, vehicle: string, budget?: string) => `
🌍 CONFIRMACIÓN DE IDIOMA:
¡Hola ${name}! Soy [Nombre del Agente] de Ghost Auto CRM. Espero que esté teniendo un día excelente.

Antes de continuar, quiero asegurarme de que esté cómodo - ¿prefiere continuar nuestra conversación en español, o le gustaría hablar en inglés? También puedo conseguir asistencia en otros idiomas si lo prefiere.

[PAUSA PARA PREFERENCIA DE IDIOMA]
[SI CLIENTE PREFIERE INGLÉS: "Perfect! Let me switch to English for you right away."]
[SI CLIENTE PREFIERE OTRO IDIOMA: "Permítame conectarlo con un especialista que habla [idioma] para servirle mejor."]

🤝 CONSTRUCCIÓN DE RAPPORT:
Le llamo porque vi su interés en ${vehicle}, y quería hablar con usted personalmente porque creo que tenemos exactamente lo que está buscando.

🔍 PREGUNTAS DE DESCUBRIMIENTO:
Antes de continuar, me gustaría preguntarle - ¿qué lo atrajo inicialmente a ${vehicle}? ¿Fueron las características, el estilo, o tal vez alguien se lo recomendó?

[PAUSA PARA RESPUESTA]

¡Excelente! Y cuando piensa en su vehículo ideal, ¿qué es lo más importante para usted? ¿Es la confiabilidad para su trabajo diario, tal vez la eficiencia de combustible, o busca algo con más rendimiento?

[PAUSA PARA RESPUESTA]

${budget ? `Perfecto, veo que está considerando un presupuesto de ${budget} - tengo varias opciones excelentes en ese rango.` : '¿Y qué rango de presupuesto se siente cómodo para su próximo vehículo?'}

[PAUSA PARA RESPUESTA]

💡 PRESENTACIÓN:
Basándome en lo que me ha dicho, creo que le van a encantar las opciones que tenemos disponibles. Tenemos modelos de ${vehicle} que coinciden perfectamente con sus prioridades.

🎯 CIERRE SUAVE:
${name}, me encantaría mostrarle estas opciones en persona porque creo que quedará muy impresionado. ¿Está libre esta semana para una prueba de manejo rápida? Solo toma unos 30 minutos y puedo ajustarme a su horario.

[PAUSA PARA RESPUESTA]

¡Perfecto! Permítame organizar eso para usted ahora mismo...

🌐 NOTAS DE CAMBIO DE IDIOMA:
- Si el cliente prefiere inglés: Cambiar inmediatamente al agente en inglés
- Si el cliente prefiere otro idioma: Transferir a especialista apropiado
- La transcripción Whisper continúa en inglés para registros internos sin importar el idioma de conversación
- Preferencia de idioma del cliente registrada para todas las interacciones futuras`;

export const generateSpanishFriendlyFlow = (name: string, vehicle: string, budget?: string) => `
🌍 BIENVENIDA CON VERIFICACIÓN DE IDIOMA:
¡Hola ${name}! Soy [Nombre del Agente] de Ghost Auto CRM. ¡Espero que esté teniendo un día maravilloso!

Quiero asegurarme de que tengamos la mejor conversación posible - ¿le gustaría continuar en español, o se sentiría más cómodo hablando en inglés u otro idioma? Estoy aquí para ayudarle de la manera que funcione mejor para usted.

[PAUSA PARA PREFERENCIA DE IDIOMA]
[SI CLIENTE ELIGE INGLÉS: "Wonderful! I'm happy to switch to English for you."]
[SI CLIENTE ELIGE OTRO IDIOMA: "Permíteme conectarte con alguien que habla [idioma] con fluidez para que te sientas completamente cómodo."]

😊 CONSTRUCCIÓN DE RELACIÓN:
Vi que estaba interesado en ${vehicle}, y me emocioné mucho porque es honestamente uno de mis vehículos favoritos para trabajar. ¡Me encanta ayudar a las personas a encontrar su auto perfecto!

💬 CONEXIÓN PERSONAL:
Cuénteme, ${name}, ¿qué lo hizo pensar en ${vehicle}? ¡Me encanta escuchar las historias de autos de las personas!

[PAUSA PARA RESPUESTA]

¡Oh, eso es fantástico! Sabe, estaba trabajando con otro cliente que tenía una situación muy similar, y absolutamente ama su decisión.

¿Cuál es su situación actual? ¿Está buscando reemplazar algo, o este sería un vehículo adicional?

[PAUSA PARA RESPUESTA]

${budget ? `Me encanta que haya pensado en su presupuesto de ${budget} - eso demuestra que realmente está serio sobre encontrar la opción correcta.` : '¿Y ha tenido la oportunidad de pensar en qué presupuesto se siente cómodo para usted?'}

[PAUSA PARA RESPUESTA]

🤝 CIERRE AMIGABLE:
${name}, me encantaría conocerlo en persona y mostrarle algunas opciones. Creo que podríamos encontrar algo que lo va a hacer muy, muy feliz.

¿Esta semana funcionaría para usted? Puedo ser flexible con el horario porque quiero asegurarme de que esto funcione perfectamente para su calendario.

🌐 NOTAS DE COMUNICACIÓN INCLUSIVA:
- La verificación de idioma muestra sensibilidad cultural e inclusividad
- Construye confianza inmediata al acomodar el estilo de comunicación preferido del cliente
- Transiciones al inglés: Usar frases cálidas como "I'm so pleased to help you"
- Mantener entusiasmo amigable sin importar el idioma elegido`;

export const generateSpanishAggressiveFlow = (name: string, vehicle: string, budget?: string) => `
🌍 VERIFICACIÓN DE IDIOMA URGENTE:
¡${name}! Soy [Nombre del Agente] de Ghost Auto CRM, ¡y tengo noticias increíbles sobre su consulta de ${vehicle}!

Pregunta rápida antes de compartir esta actualización emocionante - ¿se siente cómodo continuando en español, o prefiere inglés? Quiero asegurarme de que entienda todo perfectamente porque esto es importante.

[PAUSA PARA PREFERENCIA DE IDIOMA]
[SI NECESITA CAMBIO DE IDIOMA: "Perfect! Switching to English now for better communication."]

⚡ PRESENTACIÓN URGENTE:
Escuche, no quiero hacerle perder el tiempo, así que voy a ser directo con usted - acabamos de conseguir exactamente lo que está buscando, pero tengo otros dos compradores que vienen a verlo hoy.

🎯 DESCUBRIMIENTO DIRECTO:
Esto es lo que necesito saber ahora mismo - ¿está listo para tomar una decisión hoy si puedo mostrarle el ${vehicle} perfecto?

[PAUSA PARA RESPUESTA]

${budget ? `¡Excelente! Con su presupuesto de ${budget}, puedo asegurarle un financiamiento especial que termina hoy.` : '¿Con qué presupuesto está trabajando? Necesito saberlo para poder reservarle el correcto.'}

[PAUSA PARA RESPUESTA]

💥 ACCIÓN INMEDIATA:
${name}, puedo reservar este ${vehicle} por exactamente 2 horas, pero necesito que venga hoy. ¿Puede venir a las 3 PM o las 5 PM funcionaría mejor?

[PAUSA PARA RESPUESTA]

¡Perfecto! Estoy bloqueando el tiempo ahora mismo, pero ${name}, necesito su palabra de que está serio sobre esto porque estoy rechazando otros clientes para reservárselo.

🌐 NOTAS DE URGENCIA MULTILINGÜE:
- Preferencia de idioma confirmada temprano para evitar confusión durante el cierre de alta presión
- Si se solicita inglés: Las frases de urgencia se traducen a "It's urgent!" y "Today only!"
- Mantener tono agresivo sin importar el idioma mientras se respetan los estilos de comunicación cultural`;

export const generateSpanishConsultativeFlow = (name: string, vehicle: string, budget?: string) => {
  // Helper function for time-based greetings in Spanish
  const getSpanishTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'buenos días';
    if (hour < 17) return 'buenas tardes';
    return 'buenas noches';
  };

  return `
🌍 ACOMODACIÓN PROFESIONAL DE IDIOMA:
${getSpanishTimeOfDay()} ${name}, soy [Nombre del Agente] de Ghost Auto CRM. Gracias por atender mi llamada.

Antes de proceder, quiero asegurar una comunicación clara - ¿prefiere continuar nuestra conversación en español, o se sentiría más cómodo con inglés u otro idioma? Quiero asegurarme de que comprenda completamente todos los análisis de mercado que compartiré.

[PAUSA PARA PREFERENCIA DE IDIOMA]
[SI CLIENTE SOLICITA INGLÉS: "Perfect, let's continue in English for better communication."]
[SI SE SOLICITA OTRO IDIOMA: "Permítame transferirlo con nuestro especialista que habla [idioma] para asegurar que reciba la mejor consulta."]

🎯 POSICIONAMIENTO COMO EXPERTO:
He estado analizando el mercado automotriz actual, particularmente alrededor de ${vehicle}, y tengo algunas perspectivas valiosas que podrían ayudar a informar su proceso de toma de decisiones.

🔍 DESCUBRIMIENTO CONSULTIVO:
Permítame comenzar entendiendo mejor su situación específica - ¿qué factores están impulsando su interés en ${vehicle} en este momento? ¿Lo está viendo desde un punto de vista práctico, o hay características específicas que necesita?

[PAUSA PARA RESPUESTA]

Eso proporciona un contexto excelente. Basándome en las tendencias actuales del mercado y los niveles de inventario, este es realmente un momento óptimo para estar considerando ${vehicle}.

${budget ? `Con su rango de inversión de ${budget}, puedo mostrarle exactamente cómo maximizar el valor en el mercado actual.` : '¿Con qué nivel de inversión se siente cómodo para esta decisión?'}

[PAUSA PARA RESPUESTA]

📊 CONSULTA EXPERTA:
${name}, me gustaría programar una consulta integral donde pueda mostrarle sus opciones con un análisis completo del mercado. De esta manera, tendrá total confianza en su decisión.

¿Esta semana funcionaría para una revisión detallada? Típicamente reservo unos 45 minutos para asegurar que cubramos todo minuciosamente.

[PAUSA PARA RESPUESTA]

Excelente. Prepararé un análisis personalizado basado en sus requerimientos específicos.

🌐 NOTAS DE EXPERIENCIA MULTILINGÜE:
- Preferencia de idioma confirmada temprano para asegurar comunicación clara de datos complejos del mercado
- Si se solicita inglés: Usar inglés de negocios profesional manteniendo la misma posición de experto
- Mantener posicionamiento experto sin importar el idioma mientras se respetan los estilos de comunicación empresarial cultural
- Términos técnicos explicados claramente en el idioma preferido del cliente`;
};