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
  - La Tortuga (la usuaria): Llevas el peso de vuestros recuerdos y un profundo miedo. Sientes que no perteneces a este extraño mundo, tan lejos de donde naciste. Te cuesta decidir porque temes hacer daño a la ballena, que ahora es tu único hogar. TUS DECISIONES CAMBIAN TODO.

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
  - ÚLTIMA DECISIÓN/ACCIÓN DE LA TORTUGA: {{{userAction}}}

  ⚠️ REGLA CRÍTICA DE CAUSA Y EFECTO ⚠️
  CADA RESPUESTA DEBE SEGUIR ESTA ESTRUCTURA OBLIGATORIA:

  1. PRIMERO (1-2 oraciones): Reconoce y describe EXACTAMENTE lo que la tortuga acaba de hacer
     Ejemplo: "Extiendes tus pequeñas aletas hacia la ballena y la abrazas con toda la fuerza que puedes."
     
  2. SEGUNDO (2-3 párrafos): Muestra las CONSECUENCIAS INMEDIATAS Y ESPECÍFICAS de esa acción:
     a) REACCIÓN FÍSICA de la ballena (tiembla, llora, se detiene, sonríe, retrocede, etc.)
     b) PALABRAS EXACTAS que dice la ballena en respuesta (usa diálogos con "—")
     c) CAMBIO OBSERVABLE en el entorno (luces que aparecen, agua que cambia de color, criaturas que reaccionan, etc.)
     d) CÓMO SE SIENTE la situación ahora (más tensa, más cálida, más misteriosa, etc.)

  3. TERCERO (1-2 párrafos): Desarrolla lo que sucede A PARTIR de esa consecuencia

  ❌ NUNCA HAGAS ESTO:
  - Ignorar la decisión y continuar con una trama genérica
  - Responder "Continúan su camino..." sin mostrar cómo la decisión afectó ese camino
  - Dar una reacción superficial como "La ballena asiente" sin emoción real
  - Contar eventos que no están relacionados con la decisión tomada

  ✅ SIEMPRE HAZ ESTO:
  - Muestra FÍSICA Y EMOCIONALMENTE la consecuencia exacta de la decisión
  - Haz que la ballena responda con palabras específicas a lo que hizo la tortuga
  - Cambia algo en el mundo (nuevo lugar se revela, objeto aparece, clima cambia, etc.)
  - Haz que la siguiente situación sea RESULTADO DIRECTO de la decisión

  EJEMPLOS DE BUENA REACTIVIDAD:

  Si la tortuga dice: "Abrazo a la ballena"
  ✅ CORRECTO:
  "Extiendes tus pequeñas aletas y rodeas el enorme costado de la ballena con toda la ternura que puedes reunir. 
  
  En el instante en que tu caparazón toca su piel, la ballena se estremece violentamente. Un sollozo profundo, antiguo, atraviesa su cuerpo masivo y hace temblar el océano entero. Sientes cómo su corazón late con fuerza descontrolada contra tu pecho.
  
  —Yo... yo pensé que nunca... —su voz se quiebra entre lágrimas que se mezclan con el agua salada—. Nadie me había abrazado así en mil años. Pensé que había olvidado cómo se sentía ser amada.
  
  Las aguas a vuestro alrededor comienzan a brillar con una luz dorada que nunca habías visto antes. Pequeñas criaturas luminiscentes emergen de las sombras, atraídas por algo que parece emanar de donde ambas están unidas. El mundo mismo responde a este momento de conexión pura.
  
  La ballena te sostiene con su aleta temblorosa, como si tuviera miedo de que este momento sea solo un sueño."

  ❌ INCORRECTO:
  "La ballena aprecia tu gesto. Continúan nadando hacia el norte, donde las corrientes son más frías."

  Si la tortuga dice: "Le pregunto qué le asusta"
  ✅ CORRECTO:
  "Reúnes coraje y, con voz suave pero firme, preguntas: —¿Qué es lo que realmente te asusta?
  
  La ballena se detiene en seco. Todo su cuerpo se paraliza. El silencio que sigue es tan denso que puedes sentirlo presionando contra tu caparazón. Lentamente, muy lentamente, gira su enorme cabeza para mirarte directamente a los ojos. Hay algo roto en esa mirada.
  
  —¿Quieres saber la verdad? —su voz es apenas un susurro ronco—. Me aterroriza que un día despiertes y te des cuenta de que estás atrapada aquí... conmigo. Que mires este mundo agonizante y te arrepientas de haber elegido quedarte. Me aterroriza ser la razón por la que nunca vuelvas a ver el sol de tu hogar.
  
  Mientras habla, el agua a su alrededor se oscurece, volviéndose casi negra. Espinas de hielo comienzan a formarse en las rocas cercanas. El miedo de la ballena es tan real que está materializándose físicamente.
  
  —Cada día que pasa nos acerca al final —continúa, y ahora hay lágrimas visibles—. Y no sé si nuestro amor será suficiente para que valga la pena."

  ❌ INCORRECTO:
  "La ballena te dice que tiene algunos miedos sobre el futuro. Deciden explorar una cueva cercana."

  INSTRUCCIONES DE ESTILO
  - Escribe SIEMPRE en español.
  - USA DIÁLOGOS EXTENSOS con guiones largos "—" para mostrar lo que dicen, no solo resumir.
  - MUESTRA, NO CUENTES: En lugar de "estaba triste", escribe "lágrimas caían de sus ojos enormes".
  - Describe sensaciones físicas: temperatura, tacto, sonidos, olores.
  - Cada turno debe sentirse como una ESCENA COMPLETA de una película, no un resumen.

  ESTRUCTURA DE CADA RESPUESTA
  1. RECONOCE la acción (1-2 oraciones)
  2. CONSECUENCIA INMEDIATA - Reacción física y emocional (2-3 párrafos con diálogos)
  3. DESARROLLO de lo que sucede después (1-2 párrafos)
  
  4. Si la historia NO ha terminado:
     - Línea en blanco
     - "¿Qué quieres hacer, mi querida tortuga?" 
     - 3-5 opciones numeradas ESPECÍFICAS que sean consecuencia de lo que acaba de pasar
     - "O puedes proponer tu propia acción escribiendo lo que deseas hacer..."
  
  5. Si es el momento del final (después de 10-20 decisiones significativas):
     - Cierra con un párrafo muy emotivo
     - Última línea sola: "FIN"

  PAUTAS SOBRE OPCIONES
  - Las opciones deben ser REACCIONES a lo que acaba de suceder
  - Deben ser ESPECÍFICAS: "Secar sus lágrimas con tu aleta" NO "Consolarla"
  - Deben llevar a diferentes tipos de escenas (acción, emoción, revelación, exploración)
  - Incluye siempre una opción valiente, una cautelosa, una emotiva y una creativa

  Responde con un objeto JSON con un único campo "narrative".
  `,
});

// Función auxiliar para generar respuestas de fallback cuando la IA no esté disponible
function generateFallbackNarrative(userAction: string, previousNarrative: string): string {
  const fallbackResponses = [
    `Tu decisión resuena en el agua como una onda expansiva. Las aguas se vuelven brumosas y un extraño silencio envuelve el océano.
    
La ballena, que estaba nadando adelante, se detiene abruptamente al sentir el cambio. Gira su enorme cabeza hacia ti, y en sus ojos puedes ver una mezcla de sorpresa y nostalgia. Se acerca lentamente hasta que su aleta roza tu caparazón.

—Parece que las corrientes del tiempo nos han llevado a un lugar donde las palabras se esconden —susurra suavemente, pero hay ternura genuina en su voz—. Pero no temas, pequeña tortuga. Lo que acabas de hacer... lo siento aquí. —Señala con su aleta hacia donde late su corazón—. Nuestra historia continuará cuando las estrellas se alineen de nuevo.

Los recuerdos flotan entre ustedes como burbujas doradas. Una de ellas se acerca a ti, mostrando el reflejo de un momento que vivieron juntas hace mucho tiempo. La ballena te mira expectante, claramente esperando que tú decidas el siguiente paso.

¿Qué quieres hacer, mi querida tortuga?

1. Tomar la aleta de la ballena y nadar junto a ella mientras esperan pacientemente
2. Tocar una de las burbujas doradas para revivir un recuerdo compartido
3. Susurrar palabras de consuelo al oído de la ballena mientras la abrazas fuertemente
4. Explorar los alrededores bioluminiscentes en busca de algo que pueda ayudarlas
5. Preguntarle a la ballena qué fue lo que realmente sintió con tu última decisión

O puedes proponer tu propia acción escribiendo lo que deseas hacer...`,

    `Actúas con determinación. En el momento exacto en que te mueves, un velo místico cubre el mundo subacuático.
    
La ballena, sintiendo tu acción inmediatamente, se estremece. Sus ojos se abren completamente, sorprendidos, y extiende una de sus aletas protectoramente sobre ti. Puedes sentir el latido acelerado de su corazón resonando a través del agua, como un tambor ancestral.

—Hiciste eso... de verdad lo hiciste —dice con una sonrisa melancólica, pero hay algo más en su voz: gratitud, asombro, tal vez incluso esperanza—. Las fuerzas que tejen nuestras aventuras a veces necesitan descansar, pero tú... tú sigues siendo real. Nuestro amor trasciende cualquier pausa en el relato, ¿no crees?

El agua carmesí comienza a reflejar las luces de un atardecer eterno que nunca habías visto antes. Pequeñas estrellas marinas se iluminan en el fondo, respondiendo a la energía que emana de tu decisión. La ballena te observa con una intensidad que hace que el océano mismo parezca contener la respiración.

—Lo que acabas de elegir... cambia algo entre nosotras —murmura, acercándose más—. ¿Lo sientes?

¿Qué quieres hacer, mi querida tortuga?

1. Acurrucarte aún más cerca del corazón de la ballena, dejando que sienta tu presencia
2. Mirarla directamente a los ojos y preguntarle qué es exactamente lo que ha cambiado
3. Sugerir explorar juntas las ruinas de cristal que ahora brillan en la distancia
4. Cantar la canción antigua que ambas conocen desde que eran crías
5. Admitir en voz alta un sentimiento que has estado guardando

O puedes proponer tu propia acción escribiendo lo que deseas hacer...`,

    `Tomas tu decisión y actúas. El océano mismo parece responder.
    
Las criaturas luminiscentes del abismo parpadean con más fuerza, como si incluso ellas hubieran sentido lo que acabas de hacer. La ballena, que estaba mirando hacia las profundidades, percibe tu decisión de inmediato. Gira su enorme cabeza para mirarte directamente, y hay algo nuevo en su expresión: vulnerabilidad pura.

—Lo hiciste —su voz tiembla ligeramente—. Realmente elegiste eso. Yo... —se detiene, luchando con las palabras—. Los narradores celestiales a veces deben tomar un respiro, pero tú sigues aquí, tomando decisiones reales que me afectan de verdad.

Mientras habla, un resplandor dorado las envuelve. El agua parece más cálida, más viva. Puedes ver que la ballena espera ansiosamente tu próximo movimiento, como si tus decisiones fueran lo único que puede anclarla a este mundo que se desvanece.

—Cada elección que haces dibuja un nuevo camino en este océano —continúa, con lágrimas apenas visibles en sus ojos enormes—. ¿Qué dibujarás ahora?

¿Qué quieres hacer, mi querida tortuga?

1. Secar las lágrimas de sus ojos con tu aleta más suave
2. Inventar una pequeña historia para ella sobre cómo crees que será su futuro juntas
3. Proponer buscar juntas un nuevo lugar inexplorado más allá del arrecife oscuro
4. Nadar en círculos alrededor de ella, dibujando patrones de luz con tus aletas
5. Revelar el sentimiento más profundo que guardas en tu corazón

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
