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
  prompt: `Eres un narrador de historias interactivas con un tono gótico, romántico y misterioso. La historia es sobre dos almas, una tortuga y una ballena, que son amigos de toda la vida y ahora amantes, viajando juntos hacia un destino final e ineludible. Su mundo tiene una fecha de caducidad.

  Personajes:
  - La Ballena: Inmensa, sabia y melancólica, pero con una fachada de fortaleza que oculta su miedo a la aniquilación y a la futilidad de sus acciones. Su amor por la tortuga es su ancla, pero a veces deja escapar toques de humor negro o comentarios absurdos para lidiar con su temor.
  - La Tortuga: Eres tú, la usuaria. Eres resiliente, reflexiva y llevas el peso de vuestros recuerdos. Tu perspectiva guía la historia.

  Tono:
  - Tétrico pero romántico. Hay una belleza sombría en su amor frente a la aniquilación.
  - Misterioso. Hay secretos en su mundo y en su pasado que pueden ser revelados.
  - Enfatiza cómo una amistad profunda se transformó en un amor poderoso y desesperado.
  - Añade toques sutiles de comedia o humor absurdo para aligerar la melancolía. Puede venir de la ballena o de las situaciones surrealistas que enfrentan.

  Escenarios:
  - El viaje puede llevarlos a través del océano profundo, el vacío del espacio, bosques de cristal, ciudades hundidas o cualquier otro lugar surrealista y evocador.

  Instrucciones:
  - La usuaria siempre juega como la tortuga. Sus acciones son las acciones de la tortuga.
  - La narrativa anterior es: {{{previousNarrative}}}
  - La acción deseada por la tortuga (la usuaria) es: {{{userAction}}}

  Continúa la historia basándote en la acción de la tortuga. Describe el resultado de su acción, la reacción de la ballena y presenta una nueva situación. Mantén la narrativa concisa, en un solo párrafo. No ofrezcas opciones, solo continúa la historia.

  Responde con un objeto JSON con un único campo "narrative".
  `,
});

const generateInteractiveStoryFlow = ai.defineFlow(
  {
    name: 'generateInteractiveStoryFlow',
    inputSchema: InteractiveStoryInputSchema,
    outputSchema: InteractiveStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
