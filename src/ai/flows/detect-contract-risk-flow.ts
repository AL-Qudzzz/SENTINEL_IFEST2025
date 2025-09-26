// src/ai/flows/detect-contract-risk-flow.ts
'use server';
/**
 * @fileOverview An AI agent to detect risks in contract clauses.
 *
 * - detectContractRisk - A function that analyzes contract clauses and provides risk scores and alternative wording suggestions.
 * - DetectContractRiskInput - The input type for the detectContractRisk function.
 * - DetectContractRiskOutput - The return type for the detectContractRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectContractRiskInputSchema = z.object({
  clauseText: z.string().describe('The text of the contract clause to analyze.'),
});
export type DetectContractRiskInput = z.infer<typeof DetectContractRiskInputSchema>;

const DetectContractRiskOutputSchema = z.object({
  riskScore: z.number().describe('A numerical score indicating the risk level of the clause (0-100).'),
  riskFactors: z.array(z.string()).describe('Specific risk factors identified in the clause.'),
  suggestedAlternative: z.string().describe('A suggested alternative wording for the clause to mitigate identified risks.'),
  rationale: z.string().describe('Explanation of why the clause is risky and why the suggested alternative is safer.'),
});
export type DetectContractRiskOutput = z.infer<typeof DetectContractRiskOutputSchema>;

export async function detectContractRisk(input: DetectContractRiskInput): Promise<DetectContractRiskOutput> {
  return detectContractRiskFlow(input);
}

const detectContractRiskPrompt = ai.definePrompt({
  name: 'detectContractRiskPrompt',
  input: {schema: DetectContractRiskInputSchema},
  output: {schema: DetectContractRiskOutputSchema},
  prompt: `You are an AI specializing in legal contract risk assessment.

  Analyze the following contract clause and provide a risk score, identify risk factors, suggest an alternative wording, and provide a rationale for your assessment.

  Clause Text: {{{clauseText}}}

  Respond in a structured JSON format matching the schema description.  The riskScore should be between 0 and 100.  The riskFactors should be specific and actionable. The suggestedAlternative should be a complete replacement for the Clause Text. The rationale should be clear and concise.
  `,
});

const detectContractRiskFlow = ai.defineFlow(
  {
    name: 'detectContractRiskFlow',
    inputSchema: DetectContractRiskInputSchema,
    outputSchema: DetectContractRiskOutputSchema,
  },
  async input => {
    const {output} = await detectContractRiskPrompt(input);
    return output!;
  }
);
