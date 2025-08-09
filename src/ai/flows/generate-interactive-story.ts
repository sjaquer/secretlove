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
  prompt: `Eres un narrador de historias interactivas. La historia debe tener elementos de vida marina y otoño. Es una historia romántica y ligeramente misteriosa.

  Narrativa anterior: {{{previousNarrative}}}
  Acción deseada por el usuario: {{{userAction}}}

  Continúa la historia basándote en la acción del usuario. Describe el resultado de su acción y luego presenta una nueva situación, esperando que el usuario describa su próxima acción. Mantén la narrativa concisa, en un solo párrafo.

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
