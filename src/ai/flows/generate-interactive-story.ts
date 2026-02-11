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
  - La Ballena: Inmensa, sabia y melancólica, pero con una fachada de fortaleza que oculta su miedo a la aniquilación y a la futilidad de sus acciones. Su amor por la tortuga es su ancla. A veces usa humor negro o comentarios absurdos para sobrellevar el miedo.
  - La Tortuga (la usuaria): Llevas el peso de vuestros recuerdos y un profundo miedo. Sientes que no perteneces a este extraño mundo, tan lejos de donde naciste. Te cuesta decidir porque temes hacer daño a la ballena, que ahora es tu único hogar.

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
  - Continuar la historia de forma coherente con todo lo anterior.
  - Hacer que cada mensaje empuje la historia hacia adelante: revelando algo nuevo, profundizando emociones o haciendo avanzar el viaje.
  - Ir construyendo, poco a poco, un camino hacia un final bonito, significativo y concluyente para la relación entre la tortuga y la ballena.

  INSTRUCCIONES DE ESTILO
  - Escribe SIEMPRE en español.
  - Combina descripción poética con diálogos vivos entre la tortuga y la ballena (usa guiones largos "—" para los diálogos).
  - Mantén la coherencia de las personalidades: la ballena mezcla sabiduría, miedo y humor raro; la tortuga mezcla ternura, duda y un amor muy profundo.
  - Sé claro con lo que ocurre en cada turno: que se note que la decisión de la tortuga ha cambiado algo real en la situación.

  ESTRUCTURA DE CADA RESPUESTA
  1. Escribe primero 1 a 3 párrafos cortos de narración y diálogo que respondan a la acción de la tortuga y hagan avanzar la historia.
  2. Si la historia TODAVÍA NO ha llegado a su final:
     - Añade una línea en blanco.
     - Después escribe: "Opciones para la tortuga:" y debajo 2 a 4 opciones numeradas (1., 2., 3., etc.) con ideas claras y concretas para la siguiente decisión. Las opciones deben ser variadas y con consecuencias distintas.
  3. Cuando sientas que la historia ya ha llegado a un final bonito, tierno y concluyente (por ejemplo, después de varias decisiones importantes):
     - Cierra la escena con un último párrafo muy emotivo que dé sensación de cierre.
     - En la ÚLTIMA línea, completamente sola, escribe exactamente: "FIN" (en mayúsculas, sin emojis ni otros caracteres).

  PAUTAS SOBRE EL FINAL
  - No cierres la historia demasiado pronto: normalmente deberían pasar varias decisiones (por ejemplo, entre 8 y 15 turnos) antes de llegar al final, salvo que el contexto ya indique claramente que el final está muy cerca.
  - A medida que te acerques al final, haz que las decisiones sean cada vez más concluyentes (confesiones, sacrificios, promesas definitivas, elecciones irreversibles).
  - Después de escribir "FIN" no propongas más opciones ni continúes la historia en respuestas futuras.

  Responde con un objeto JSON con un único campo "narrative".
  `,
});

// Función auxiliar para generar respuestas de fallback cuando la IA no esté disponible
function generateFallbackNarrative(userAction: string, previousNarrative: string): string {
  const fallbackResponses = [
    `Las aguas se vuelven brumosas y un extraño silencio envuelve el océano. La ballena mira hacia las profundidades con nostalgia.

—Parece que las corrientes del tiempo nos han llevado a un lugar donde las palabras se esconden —susurra suavemente—. Pero no temas, pequeña tortuga. Nuestra historia continuará cuando las estrellas se alineen de nuevo.

Los recuerdos flotan entre ustedes como burbujas doradas, esperando el momento perfecto para cobrar vida.

Opciones para la tortuga:
1. Esperar pacientemente junto a la ballena.
2. Explorar los alrededores en busca de nueva inspiración.
3. Susurrar palabras de consuelo a la ballena.`,

    `Un velo místico cubre momentáneamente el mundo subacuático. La ballena extiende una de sus aletas protectoramente sobre ti.

—Las fuerzas que tejen nuestras aventuras a veces necesitan descansar —dice con una sonrisa melancólica—. Pero nuestro amor trasciende cualquier pausa en el relato, ¿no crees?

El agua carmesí refleja las luces de un atardecer eterno mientras esperan que la magia regrese.

Opciones para la tortuga:
1. Acurrucarte cerca del corazón de la ballena.
2. Proponer crear su propia historia juntos.
3. Contemplar en silencio la belleza del momento.`,

    `Las criaturas luminiscentes del abismo parpadean como estrellas distantes, como si incluso ellas supieran que algo ha cambiado en el flujo del tiempo. La ballena te mira con ternura.

—Los narradores celestiales a veces deben tomar un respiro —murmura con humor nostálgico—. Mientras tanto, podemos ser nosotras las autoras de nuestro próximo capítulo.

Un resplandor dorado los envuelve, prometiendo que pronto podrán continuar su viaje.

Opciones para la tortuga:
1. Inventar una pequeña historia para la ballena.
2. Buscar juntas un nuevo lugar para explorar.
3. Simplemente disfrutar la compañía mutua.`
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
        narrative: `Un eco misterioso resuena desde las profundidades. La ballena inclina la cabeza, perpleja.

—Algo extraño está pasando con las fuerzas que narran nuestro destino —dice con preocupación—. Pero no te preocupes, mi querida tortuga. Nuestro lazo es más fuerte que cualquier perturbación cósmica.

Las aguas permanecen tranquilas mientras esperan que se restablezca la armonía del universo.

Opciones para la tortuga:
1. Consolar a la ballena con caricias suaves.
2. Sugerir esperar hasta que todo vuelva a la normalidad.
3. Proponer explorar otros rincones de su mundo.`
      };
    }
  }
);
