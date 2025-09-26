
'use server';
/**
 * @fileOverview An AI agent to generate a professional contract template.
 *
 * - generateContractTemplate - A function that takes an existing contract text and turns it into a reusable template.
 */

import {ai} from '@/ai/genkit';
import type { GenerateContractTemplateInput, GenerateContractTemplateOutput } from './schemas';
import { GenerateContractTemplateInputSchema, GenerateContractTemplateOutputSchema } from './schemas';

export async function generateContractTemplate(input: GenerateContractTemplateInput): Promise<GenerateContractTemplateOutput> {
  return generateContractTemplateFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateContractTemplatePrompt',
    input: { schema: GenerateContractTemplateInputSchema },
    output: { schema: GenerateContractTemplateOutputSchema },
    prompt: `You are an expert legal AI assistant. Your task is to convert an existing contract text into a professional, reusable contract template.

    Analyze the provided contract text. Identify specific details like names, dates, and values. Replace these specific details with generic, clearly-marked placeholders (e.g., [Nama Pihak Pertama], [Tanggal Efektif], [Nilai Kontrak]).

    The final output should be a well-structured, professionally formatted contract template that is easy to read and use for future agreements. The entire template must be in Bahasa Indonesia.

    **Original Contract Text:**
    {{{originalContractText}}}

    Now, provide the full, templated contract text in the 'templateContractText' field of the JSON output.
    `,
});

const generateContractTemplateFlow = ai.defineFlow(
  {
    name: 'generateContractTemplateFlow',
    inputSchema: GenerateContractTemplateInputSchema,
    outputSchema: GenerateContractTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
