'use server';
/**
 * @fileOverview An AI agent to redraft a contract based on risk analysis feedback.
 *
 * - draftContract - A function that takes an original contract and risk analysis results to produce a revised draft.
 * - DraftContractInput - The input type for the draftContract function.
 * - DraftContractOutput - The return type for the draftContract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DetectContractRiskOutputSchema } from './detect-contract-risk-flow';


export const DraftContractInputSchema = z.object({
  originalContractText: z.string().describe('The full original text of the contract to be redrafted.'),
  riskAnalysis: DetectContractRiskOutputSchema.describe('The results from the detectContractRisk flow, including risk factors and suggested alternatives.'),
});
export type DraftContractInput = z.infer<typeof DraftContractInputSchema>;

export const DraftContractOutputSchema = z.object({
  redraftedContractText: z.string().describe('The full text of the redrafted contract, incorporating the suggested revisions.'),
});
export type DraftContractOutput = z.infer<typeof DraftContractOutputSchema>;


export async function draftContract(input: DraftContractInput): Promise<DraftContractOutput> {
  return draftContractFlow(input);
}


const draftContractPrompt = ai.definePrompt({
    name: 'draftContractPrompt',
    input: { schema: DraftContractInputSchema },
    output: { schema: DraftContractOutputSchema },
    prompt: `You are an expert legal assistant AI specializing in contract drafting and revision.
    
    Your task is to redraft an entire contract document based on a provided risk analysis. You must incorporate the suggested changes and mitigate the identified risks to produce a safer, clearer, and more compliant contract.

    You have been given the original contract and the results of a risk analysis. The analysis includes:
    - A list of identified risk factors.
    - A specific suggested alternative for the riskiest clauses.
    - The rationale behind the suggested changes.

    Review the **ENTIRE** original contract text.
    Carefully apply the 'suggestedAlternative' from the risk analysis to the relevant clauses.
    Address all 'riskFactors' by making necessary adjustments throughout the document, even in clauses not directly mentioned in the 'suggestedAlternative'.
    Ensure the final redrafted contract is a complete, coherent, and legally sound document. It must retain the original intent of the agreement while minimizing risk.

    SEMUA OUTPUT HARUS DALAM BAHASA INDONESIA, kecuali untuk istilah hukum yang umum digunakan dalam bahasa Inggris.

    **Original Contract Text:**
    {{{originalContractText}}}

    **Risk Analysis Provided:**
    - Risk Score: {{riskAnalysis.riskScore}}
    - Risk Factors: 
    {{#each riskAnalysis.riskFactors}}
    - {{{this}}}
    {{/each}}
    - Suggested Alternative Clause: {{{riskAnalysis.suggestedAlternative}}}
    - Rationale: {{{riskAnalysis.rationale}}}

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
