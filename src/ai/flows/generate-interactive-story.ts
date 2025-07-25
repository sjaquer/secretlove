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
  userChoice: z
    .string()
    .optional()
    .describe('The user choice that influences the story progression.'),
  previousNarrative: z
    .string()
    .optional()
    .describe('The previous narrative to continue the story.'),
});
export type InteractiveStoryInput = z.infer<typeof InteractiveStoryInputSchema>;

const InteractiveStoryOutputSchema = z.object({
  narrative: z.string().describe('The generated narrative of the story.'),
  options: z.array(z.string()).describe('The options for the user to choose from.'),
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
  prompt: `You are an interactive story teller. The story should have elements of marine life and autumn.

  Previous narrative: {{{previousNarrative}}}
  User Choice: {{{userChoice}}}

  Continue the story based on the user choice. Provide 2-3 options for the user to choose from to continue the story.  The options should be very short, under 5 words.
  Make sure that options are diverse and lead to different narrative directions.
  Respond with a JSON object:
  {
    "narrative": "Generated narrative.",
    "options": ["Option 1", "Option 2"]
  }
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
