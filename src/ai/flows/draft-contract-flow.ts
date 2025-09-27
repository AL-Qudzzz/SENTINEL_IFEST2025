
'use server';
/**
 * @fileOverview An AI agent to redraft a contract based on risk analysis feedback.
 *
 * - draftContract - A function that takes an original contract and risk analysis results to produce a revised draft.
 */

import {ai} from '@/ai/genkit';
import type { DraftContractInput, DraftContractOutput } from './schemas';
import { DraftContractInputSchema, DraftContractOutputSchema } from './schemas';

export async function draftContract(input: DraftContractInput): Promise<DraftContractOutput> {
  return draftContractFlow(input);
}


const draftContractPrompt = ai.definePrompt({
    name: 'draftContractPrompt',
    input: { schema: DraftContractInputSchema },
    output: { schema: DraftContractOutputSchema },
    prompt: `You are an expert legal assistant AI specializing in contract drafting and revision.
    
    Your task is to redraft an entire contract document based on a provided suggested alternative clause. You must incorporate the suggested change to produce a safer, clearer, and more compliant contract.

    Review the **ENTIRE** original contract text.
    Carefully apply the 'suggestedAlternative' to the relevant clauses.
    Ensure the final redrafted contract is a complete, coherent, and legally sound document. It must retain the original intent of the agreement while minimizing risk.

    SEMUA OUTPUT HARUS DALAM BAHASA INDONESIA, kecuali untuk istilah hukum yang umum digunakan dalam bahasa Inggris.

    **Original Contract Text:**
    {{{originalContractText}}}

    **Suggested Alternative Clause to Incorporate:** 
    {{{suggestedAlternative}}}

    Now, provide the full, redrafted contract text in the 'redraftedContractText' field of the JSON output. Do not omit any part of the contract. The output must be the complete revised document.
    `,
});

const draftContractFlow = ai.defineFlow(
  {
    name: 'draftContractFlow',
    inputSchema: DraftContractInputSchema,
    outputSchema: DraftContractOutputSchema,
  },
  async input => {
    const {output} = await draftContractPrompt(input);
    return output!;
  }
);

    