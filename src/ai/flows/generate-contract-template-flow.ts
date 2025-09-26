
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
    prompt: `You are an expert legal AI assistant. Your task is to convert an existing contract text into a professional, reusable contract template, formatted like a formal Indonesian legal document.

    Analyze the provided contract text. Identify specific details like names, dates, and values.
    
    Then, generate a professionally formatted contract template. In this template, you must:
    1.  Structure the document with a clear title, preamble, and distinct articles ("Pasal").
    2.  Use the specific details you extracted from the original text (e.g., use the actual company names, dates, and contract values you found).
    3.  For any important information that you cannot find in the original text, use a generic, clearly-marked placeholder (e.g., [Alamat Pihak Pertama], [Jabatan Penandatangan]).
    4.  Ensure the language is formal and professional, suitable for a legal document.
    5.  Include standard sections such as definitions, scope of work, term, price, confidentiality, and dispute resolution if they are relevant but missing.
    
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
