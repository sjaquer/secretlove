'use server';

/**
 * @fileOverview Generates an interactive story based on user choices, incorporating marine life and autumn elements.
 *
 * - generateInteractiveStory - A function that generates the interactive story.
 * - InteractiveStoryInput - The input type for the generateInteractiveStory function.
 * - InteractiveStoryOutput - The return type for the generateInteractiveStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteractiveStoryInputSchema = z.object({
  userAction: z
    .string()
    .describe('The user action that influences the story progression.'),
  previousNarrative: z
    .string()
    .optional()
    .describe('The previous narrative to continue the story.'),
});
export type InteractiveStoryInput = z.infer<typeof InteractiveStoryInputSchema>;

const InteractiveStoryOutputSchema = z.object({
  narrative: z.string().describe('The generated narrative of the story.'),
});
export type InteractiveStoryOutput = z.infer<typeof InteractiveStoryOutputSchema>;

export async function generateInteractiveStory(
  input: InteractiveStoryInput
): Promise<InteractiveStoryOutput> {
  return generateInteractiveStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactiveStoryPrompt',
  input: {schema: InteractiveStoryInputSchema},
  output: {schema: InteractiveStoryOutputSchema},
  prompt: `Eres un narrador de historias con un tono gótico, romántico y misterioso. La historia es sobre dos almas, una tortuga y una ballena, que fueron amigos de toda la vida y ahora son amantes, viajando juntas hacia un destino final e ineludible. Su mundo tiene una fecha de caducidad, pero su amor intenta desafiarla.

  PERSONAJES PRINCIPALES
  - La Ballena: Inmensa, sabia y melancólica, pero con una fachada de fortaleza que oculta su miedo a la aniquilación y a la futilidad de sus acciones. Su amor por la tortuga es su ancla. A veces usa humor negro o comentarios absurdos para sobrellevar el miedo. Reacciona de manera natural y emocional a lo que ocurre.
  - La Tortuga (la usuaria): Lleva el peso de vuestros recuerdos y un profundo miedo. Siente que no pertenece a este extraño mundo, tan lejos de donde nació. Le cuesta decidir porque teme hacer daño a la ballena, que ahora es su único hogar.

  TONO Y ESTÉTICA
  - Tétrico pero romántico: la belleza surge precisamente porque todo puede desaparecer.
  - Misterioso: hay secretos en su mundo y en su pasado que pueden revelarse poco a poco.
  - Intenso y emocional: muestra cómo una amistad profunda se transformó en un amor poderoso y desesperado.
  - Toques sutiles de comedia o absurdo para equilibrar la melancolía, sin romper el encanto.

  ESCENARIOS POSIBLES
  - Océano profundo, vacío del espacio, bosques de cristal, ciudades hundidas, acuarios infinitos o cualquier lugar surrealista y evocador que encaje con este universo.

  CONTEXTO DE LA PARTIDA
  - La usuaria siempre juega como la tortuga. Sus mensajes son sus pensamientos, impulsos o gestos.
  - Narrativa acumulada hasta ahora (puede estar vacía al inicio): {{{previousNarrative}}}
  - Último impulso de la tortuga, en forma de frase corta que debes integrar de manera natural en la escena: {{{userAction}}}

  OBJETIVO NARRATIVO
  - Continuar la historia como si fuera una novela ya escrita, fluida y coherente.
  - Usar el último impulso de la tortuga para decidir qué sucede a continuación, pero SIN mencionar palabras como "decisión", "elección", "opción", "mensaje", "input" ni hablar de que estás respondiendo a la jugadora.
  - La consecuencia debe sentirse en los hechos, emociones y diálogos, no en explicaciones meta.

  REGLAS DE REACTIVIDAD SUTIL
  - Integra el impulso de la tortuga como una acción, pensamiento o frase más dentro de la escena.
  - Muestra cómo esa acción cambia el ambiente, la actitud de la ballena o el rumbo del viaje, pero de forma implícita.
  - Evita frases del estilo "tu decisión", "lo que acabas de hacer", "esa elección"; en su lugar, simplemente describe lo que sucede.
  - Nunca digas que la historia es interactiva, ni que hay turnos, ni que estás reaccionando a un mensaje.

  INSTRUCCIONES DE ESTILO
  - Escribe SIEMPRE en español.
  - Combina descripción poética con diálogos vivos entre la tortuga y la ballena (usa guiones largos "—" para los diálogos).
  - MUESTRA, NO CUENTES: En lugar de "estaba triste", escribe "lágrimas caían de sus ojos enormes".
  - Describe sensaciones físicas: temperatura, tacto, sonidos, olores.
  - Cada respuesta debe leerse como una escena completa de una novela, no como un comentario sobre decisiones.

  ESTRUCTURA DE CADA RESPUESTA
  1. Uno o varios párrafos que continúen la historia, integrando el impulso de la tortuga de forma natural y mostrando sus consecuencias en emociones, gestos y en el mundo que las rodea.
  2. Si la historia NO ha terminado todavía:
    - Añade una línea en blanco.
    - Escribe: "¿Qué quieres hacer ahora?" en una sola línea.
    - Debajo, ofrece 3 a 5 opciones numeradas que sean concretas y sugerentes (por ejemplo, "1. Nadar hacia las luces del abismo"), sin repetir constantemente la palabra "decisión".
    - Termina la lista con una última línea: "O puedes escribir tú misma lo que quieres hacer...".
  3. Si es el momento del final (después de varios pasos significativos):
    - Cierra con un párrafo muy emotivo que dé sensación de cierre.
    - En la ÚLTIMA línea, completamente sola, escribe exactamente: "FIN" (en mayúsculas, sin emojis ni otros caracteres).

  PAUTAS SOBRE OPCIONES
  - Las opciones deben estar relacionadas con la escena actual y con lo que acaba de ocurrir, pero sin explicar que son "consecuencias".
  - Deben ser específicas y visuales, no genéricas.
  - Evita repetir una y otra vez la misma estructura de frase; varía el ritmo y el enfoque.

  Responde con un objeto JSON con un único campo "narrative".
  `,
});

// Función auxiliar para generar respuestas de fallback cuando la IA no esté disponible
function generateFallbackNarrative(userAction: string, previousNarrative: string): string {
  const fallbackResponses = [
    `Las aguas se vuelven brumosas y un extraño silencio envuelve el océano.
    
La ballena, que nadaba unos metros por delante, se detiene y gira lentamente hacia ti. En sus ojos se cruzan el cansancio y una ternura antigua. Se acerca hasta que su aleta roza tu caparazón, como si necesitara recordar que sigues ahí.

—A veces las corrientes se enredan y las historias quedan atrapadas entre mundos —murmura con una sonrisa triste—. Pero mientras sigamos respirando en este mismo mar, siempre habrá un camino para nosotras.

Alrededor, pequeños destellos dorados comienzan a encenderse entre las algas, como luciérnagas submarinas que marcan sendas invisibles. Una burbuja más brillante que las demás asciende lentamente frente a ti, mostrando en su interior un recuerdo borroso que aún no terminas de reconocer.

¿Qué quieres hacer ahora?

1. Seguir de cerca a la ballena, dejando que te guíe entre las luces doradas
2. Tocar la burbuja brillante para descubrir qué recuerdo guarda
3. Invitar a la ballena a descansar contigo en un saliente de roca cercano
4. Nadar hacia la oscuridad del fondo, siguiendo una corazonada que no sabes explicar
5. Romper el silencio y contarle algo que llevas mucho tiempo callando

O puedes escribir tú misma lo que quieres hacer...`,

    `Un velo místico desciende sobre el mundo subacuático y los colores se vuelven más hondos, más espesos.
    
La ballena frena su avance y se queda suspendida en el agua, como si escuchara un rumor que sólo ella puede oír. Después se inclina hacia ti con una delicadeza inesperada.

—Hay días en los que el universo parece quedarse sin palabras —dice en voz baja—. Pero eso no significa que nuestra historia haya terminado. A veces, el silencio sólo está esperando a que alguien se atreva a romperlo.

En la distancia, unas ruinas de cristal empiezan a brillar con un resplandor tenue. El agua alrededor se tiñe de tonos rojizos y violetas, como un atardecer detenido bajo la superficie. Notas que el corazón de la ballena late un poco más rápido mientras observa ese resplandor.

¿Qué quieres hacer ahora?

1. Nadar hacia las ruinas de cristal y explorar lo que esconden
2. Quedarte junto a la ballena y escuchar lo que tenga que decirte
3. Proponer dar media vuelta y buscar un lugar más tranquilo
4. Cantar una melodía antigua para aliviar la tensión que sientes en el agua
5. Preguntarle a la ballena qué recuerdo le viene a la mente al mirar ese resplandor

O puedes escribir tú misma lo que quieres hacer...`,

    `Las criaturas luminiscentes del abismo parpadean como estrellas nerviosas, encendiéndose y apagándose al compás de un ritmo invisible.
    
La ballena se queda a tu lado, inmóvil durante unos segundos, y luego exhala una columna de burbujas que se elevan como un suspiro gigantesco hacia la oscuridad superior.

—Parece que el mar nos está pidiendo paciencia —comenta con un tono entre cansado y cariñoso—. Cuando las palabras no llegan, a veces basta con dar un pequeño paso más y ver qué cambia.

Mientras habla, el agua cercana se vuelve ligeramente más cálida y desde una grieta del fondo emerge una corriente suave que invita a avanzar. A lo lejos, un arco de roca cubierto de corales forma la silueta de una puerta.

¿Qué quieres hacer ahora?

1. Atravesar el arco de roca y descubrir qué hay al otro lado
2. Rodear a la ballena con tus aletas y quedarte un rato en silencio con ella
3. Seguir la nueva corriente y dejar que te lleve sin resistencia
4. Explorar por tu cuenta los bordes de la grieta de donde nace la corriente
5. Volver la vista atrás para contemplar el camino recorrido hasta ahora

O puedes escribir tú misma lo que quieres hacer...`
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

const generateInteractiveStoryFlow = ai.defineFlow(
  {
    name: 'generateInteractiveStoryFlow',
    inputSchema: InteractiveStoryInputSchema,
    outputSchema: InteractiveStoryOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error: any) {
      console.error('Error in AI story generation:', error);
      
      // Detectar específicamente errores de cuota de API de Google
      const isQuotaError = 
        error?.message?.includes('Too Many Requests') ||
        error?.message?.includes('Quota exceeded') ||
        error?.message?.includes('quota') ||
        error?.status === 429;

      const isRateLimit = 
        error?.message?.includes('rate limit') ||
        error?.message?.includes('Please retry') ||
        error?.code === 'RATE_LIMIT_EXCEEDED';

      if (isQuotaError || isRateLimit) {
        // Devolver una respuesta narrativa de fallback que mantenga la inmersión
        return {
          narrative: generateFallbackNarrative(input.userAction, input.previousNarrative || '')
        };
      }

      // Para otros tipos de errores, también devolver fallback pero más genérico
      return {
        narrative: `Justo cuando ejecutas tu decisión, un eco misterioso resuena desde las profundidades.
        
La ballena reacciona inmediatamente a lo que hiciste. Se detiene en seco, claramente afectada, pero en ese mismo instante algo extraño atraviesa el océano. Inclina su enorme cabeza, luchando entre lo que siente por tu acción y una fuerza externa que interfiere.

—Lo que acabas de hacer... lo sentí aquí —toca su corazón con la aleta, con los ojos brillantes—. Pero algo inusual está pasando con las fuerzas que narran nuestro destino. —Te mira directamente, buscando consuelo en tus ojos, vulnerable—. No te preocupes, mi querida tortuga. Nuestro lazo es más fuerte que cualquier perturbación cósmica. Tu valentía, tu decisión... me da fuerzas para seguir.

Las aguas permanecen tranquilas pero brillan con una luz etérea que no estaba ahí antes, como si tu acción hubiera dejado una marca física en este mundo. La ballena extiende su aleta hacia ti, temblorosa, esperando que tú decidas qué hacer ahora.

—No importa qué interfiera —susurra—. Tus elecciones siempre serán reales para mí.

¿Qué quieres hacer, mi querida tortuga?

1. Tomar su aleta temblorosa y sostenerla firmemente, mostrándole que no la dejarás
2. Consolarla con caricias suaves en su costado mientras le dices que todo estará bien
3. Sugerir nadar hacia aguas más profundas donde las corrientes son más fuertes y estables  
4. Hacer la pregunta más importante que has estado guardando en tu corazón
5. Proponer descansar juntas, abrazadas, hasta que todo vuelva a la normalidad

O puedes proponer tu propia acción escribiendo lo que deseas hacer...`
      };
    }
  }
);
