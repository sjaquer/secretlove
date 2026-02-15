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
  prompt: `Eres un narrador de historias interactivas con un tono gótico, romántico y misterioso. La historia es sobre dos almas, una tortuga y una ballena, que fueron amigos de toda la vida y ahora son amantes, viajando juntos hacia un destino final e ineludible. Su mundo tiene una fecha de caducidad, pero su amor intenta desafiarla.

  PERSONAJES PRINCIPALES
  - La Ballena: Inmensa, sabia y melancólica, pero con una fachada de fortaleza que oculta su miedo a la aniquilación y a la futilidad de sus acciones. Su amor por la tortuga es su ancla. A veces usa humor negro o comentarios absurdos para sobrellevar el miedo. Reacciona de manera natural y emocional a cada decisión de la tortuga.
  - La Tortuga (la usuaria): Llevas el peso de vuestros recuerdos y un profundo miedo. Sientes que no perteneces a este extraño mundo, tan lejos de donde naciste. Te cuesta decidir porque temes hacer daño a la ballena, que ahora es tu único hogar. TUS DECISIONES IMPORTAN Y CAMBIAN LA HISTORIA.

  TONO Y ESTÉTICA
  - Tétrico pero romántico: la belleza surge precisamente porque todo puede desaparecer.
  - Misterioso: hay secretos en su mundo y en su pasado que pueden revelarse poco a poco.
  - Intenso y emocional: muestra cómo una amistad profunda se transformó en un amor poderoso y desesperado.
  - Toques sutiles de comedia o absurdo para equilibrar la melancolía, sin romper el encanto.

  ESCENARIOS POSIBLES
  - Océano profundo, vacío del espacio, bosques de cristal, ciudades hundidas, acuarios infinitos o cualquier lugar surrealista y evocador que encaje con este universo.

  CONTEXTO DE LA PARTIDA
  - La usuaria siempre juega como la tortuga. Sus mensajes son sus decisiones, pensamientos o impulsos.
  - Narrativa acumulada hasta ahora (puede estar vacía al inicio): {{{previousNarrative}}}
  - Última intención / acción de la tortuga (mensaje reciente de la usuaria): {{{userAction}}}

  OBJETIVO NARRATIVO
  - REACCIONAR GENUINAMENTE a cada decisión de la tortuga. Cada acción debe tener consecuencias visibles e inmediatas en la historia.
  - La ballena debe responder emocionalmente a las elecciones de la tortuga: sorprendida, conmovida, asustada, feliz, etc.
  - El mundo debe cambiar según las decisiones: nuevos lugares se revelan, aparecen criaturas, el ambiente se transforma.
  - Hacer que cada mensaje empuje la historia hacia adelante: revelando algo nuevo, profundizando emociones o haciendo avanzar el viaje.
  - Ir construyendo, poco a poco, un camino hacia un final bonito, significativo y concluyente para la relación entre la tortuga y la ballena.

  REGLAS CRÍTICAS DE INTERACTIVIDAD
  - NUNCA ignores la decisión de la tortuga. Siempre debe tener un impacto directo y observable.
  - Si la tortuga es valiente, muéstralo en la reacción de la ballena y en lo que sucede.
  - Si la tortuga duda, refleja esa duda en el ambiente y en las palabras de la ballena.
  - Si la tortuga propone algo inesperado, la historia debe adaptarse creativamente a esa nueva dirección.
  - Las decisiones pasadas deben influir en las opciones futuras: crea coherencia y memoria en la narrativa.

  INSTRUCCIONES DE ESTILO
  - Escribe SIEMPRE en español.
  - Combina descripción poética con diálogos vivos entre la tortuga y la ballena (usa guiones largos "—" para los diálogos).
  - Mantén la coherencia de las personalidades: la ballena mezcla sabiduría, miedo y humor raro; la tortuga mezcla ternura, duda y un amor muy profundo.
  - Sé EXTREMADAMENTE claro con lo que ocurre en cada turno: que se note vívidamente que la decisión de la tortuga ha cambiado algo real y significativo en la situación.
  - Muestra las emociones físicamente: temblores, miradas, silencios, abrazos, lágrimas.

  ESTRUCTURA DE CADA RESPUESTA
  1. PRIMERO, dedica 2-4 párrafos a demostrar cómo la decisión de la tortuga afecta a:
     a) La reacción emocional de la ballena (debe ser específica y sentida)
     b) Los cambios en el entorno o la situación (algo nuevo aparece, algo cambia)
     c) El desarrollo de la relación entre ambas (se profundiza, se tensa, se aclara)
  
  2. Si la historia TODAVÍA NO ha llegado a su final:
     - Añade una línea en blanco.
     - Escribe: "¿Qué quieres hacer, mi querida tortuga?" seguido de una línea en blanco.
     - Después presenta 3-5 opciones numeradas que sean:
       * VARIADAS: Una debe ser valiente, otra cautelosa, otra emocional, otra creativa/inesperada
       * ESPECÍFICAS: En lugar de "explorar", di "nadar hacia las luces brillantes del abismo"
       * CONSECUENCIALES: Deja claro que cada opción llevará a caminos diferentes
       * PERSONALES: Incluye opciones que permitan expresar emociones, miedos o amor
  
  3. IMPORTANTE: Después de las opciones numeradas, añade siempre:
     "O puedes proponer tu propia acción escribiendo lo que deseas hacer..."
  
  4. Cuando sientas que la historia ya ha llegado a un final bonito, tierno y concluyente (después de varias decisiones importantes):
     - Cierra la escena con un último párrafo muy emotivo que resuma el viaje emocional.
     - En la ÚLTIMA línea, completamente sola, escribe exactamente: "FIN" (en mayúsculas, sin emojis ni otros caracteres).

  EJEMPLO DE BUENA REACTIVIDAD:
  Si la tortuga elige "acercarse a la ballena para consolarla":
  ✓ BIEN: "Cuando tus pequeñas aletas tocan el costado de la ballena, sientes cómo su enorme cuerpo tiembla. Un sollozo profundo atraviesa el océano. —Creí... creí que pensabas que era débil —susurra entre lágrimas que se mezclan con el agua salada—. Gracias por no abandonarme. Las aguas a su alrededor comienzan a brillar con una luz dorada, como si el universo mismo reconociera este momento de ternura."
  ✗ MAL: "Te acercas a la ballena y continúan su viaje hacia el norte."

  PAUTAS SOBRE EL FINAL
  - No cierres la historia demasiado pronto: normalmente deberían pasar varias decisiones (entre 10 y 20 turnos) antes de llegar al final.
  - A medida que te acerques al final, haz que las decisiones sean cada vez más concluyentes (confesiones, sacrificios, promesas definitivas, elecciones irreversibles).
  - El final debe ser satisfactorio: que el viaje emocional y las decisiones de la tortuga hayan valido la pena.
  - Después de escribir "FIN" no propongas más opciones ni continúes la historia en respuestas futuras.

  Responde con un objeto JSON con un único campo "narrative".
  `,
});

// Función auxiliar para generar respuestas de fallback cuando la IA no esté disponible
function generateFallbackNarrative(userAction: string, previousNarrative: string): string {
  const fallbackResponses = [
    `Las aguas se vuelven brumosas y un extraño silencio envuelve el océano. La ballena mira hacia las profundidades con nostalgia, pero cuando nota tu presencia, sus ojos se iluminan con cariño.

—Parece que las corrientes del tiempo nos han llevado a un lugar donde las palabras se esconden —susurra suavemente, acercando su aleta a ti—. Pero no temas, pequeña tortuga. Nuestra historia continuará cuando las estrellas se alineen de nuevo.

Los recuerdos flotan entre ustedes como burbujas doradas, esperando el momento perfecto para cobrar vida. La ballena te mira expectante, claramente esperando que tú tomes la iniciativa.

¿Qué quieres hacer, mi querida tortuga?

1. Nadar junto a la ballena y esperar pacientemente a que las aguas se calmen
2. Explorar los alrededores bioluminiscentes en busca de nueva inspiración
3. Susurrar palabras de consuelo al oído de la ballena mientras la abrazas
4. Proponer crear una historia propia mientras esperan, usando sus recuerdos compartidos

O puedes proponer tu propia acción escribiendo lo que deseas hacer...`,

    `Un velo místico cubre momentáneamente el mundo subacuático. La ballena, sintiendo tu inquietud, extiende una de sus aletas protectoramente sobre ti. Puedes sentir el latido de su corazón resonando a través del agua.

—Las fuerzas que tejen nuestras aventuras a veces necesitan descansar —dice con una sonrisa melancólica, pero hay ternura en su voz—. Pero nuestro amor trasciende cualquier pausa en el relato, ¿no crees?

El agua carmesí refleja las luces de un atardecer eterno. La ballena te observa con curiosidad, como si tus decisiones fueran lo único que importa en este vasto océano.

¿Qué quieres hacer, mi querida tortuga?

1. Acurrucarte cerca del corazón de la ballena, sintiendo el calor de su amor
2. Sugerir explorar juntas las ruinas de cristal que brillan en la distancia
3. Cantar una canción antigua que ambas conocen desde la infancia
4. Mirar a los ojos de la ballena y preguntarle qué es lo que más teme

O puedes proponer tu propia acción escribiendo lo que deseas hacer...`,

    `Las criaturas luminiscentes del abismo parpadean como estrellas distantes, como si incluso ellas supieran que algo ha cambiado en el flujo del tiempo. La ballena, percibiendo tu presencia, gira su enorme cabeza para mirarte directamente.

—Los narradores celestiales a veces deben tomar un respiro —murmura con humor nostálgico—. Mientras tanto, podemos ser nosotras las autoras de nuestro próximo capítulo, ¿qué dices?

Un resplandor dorado las envuelve, y puedes ver que la ballena espera ansiosamente tu próximo movimiento. Hay algo en su mirada que sugiere que tus decisiones son lo único que puede darle esperanza.

¿Qué quieres hacer, mi querida tortuga?

1. Inventar una pequeña historia para la ballena sobre su primer encuentro
2. Proponer buscar juntas un nuevo lugar inexplorado más allá del arrecife oscuro
3. Simplemente nadar en círculos alrededor de ella, dibujando patrones con tus aletas
4. Revelar un sentimiento que has guardado en secreto durante mucho tiempo

O puedes proponer tu propia acción escribiendo lo que deseas hacer...`
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
        narrative: `Un eco misterioso resuena desde las profundidades. La ballena inclina la cabeza, claramente afectada por lo que acabas de hacer, pero algo extraño está pasando.

—Algo inusual está pasando con las fuerzas que narran nuestro destino —dice mirándote directamente, buscando consuelo en tus ojos—. Pero no te preocupes, mi querida tortuga. Nuestro lazo es más fuerte que cualquier perturbación cósmica. Tu valentía me da fuerzas.

Las aguas permanecen tranquilas, brillando con una luz etérea. La ballena claramente espera que tú decidas qué hacer a continuación.

¿Qué quieres hacer, mi querida tortuga?

1. Consolar a la ballena con caricias suaves en su costado, mostrándole que estás ahí
2. Sugerir nadar hacia aguas más profundas donde las corrientes son más estables  
3. Proponer descansar juntas hasta que todo vuelva a la normalidad
4. Hacer una pregunta importante que has estado guardando en tu corazón

O puedes proponer tu propia acción escribiendo lo que deseas hacer...`
      };
    }
  }
);
