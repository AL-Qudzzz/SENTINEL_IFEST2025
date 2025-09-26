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
  riskScore: z.number().describe('Skor numerik yang menunjukkan tingkat risiko klausul (0-100).'),
  riskFactors: z.array(z.string()).describe('Faktor-faktor risiko spesifik yang diidentifikasi dalam klausul.'),
  suggestedAlternative: z.string().describe('Saran rumusan alternatif untuk klausul guna memitigasi risiko yang teridentifikasi.'),
  rationale: z.string().describe('Penjelasan mengapa klausul tersebut berisiko dan mengapa alternatif yang disarankan lebih aman.'),
});
export type DetectContractRiskOutput = z.infer<typeof DetectContractRiskOutputSchema>;

export async function detectContractRisk(input: DetectContractRiskInput): Promise<DetectContractRiskOutput> {
  return detectContractRiskFlow(input);
}

const detectContractRiskPrompt = ai.definePrompt({
  name: 'detectContractRiskPrompt',
  input: {schema: DetectContractRiskInputSchema},
  output: {schema: DetectContractRiskOutputSchema},
  prompt: `Anda adalah AI yang berspesialisasi dalam penilaian risiko kontrak hukum.

  Analisis klausul kontrak berikut dan berikan skor risiko, identifikasi faktor-faktor risiko, sarankan rumusan alternatif, dan berikan alasan untuk penilaian Anda. SEMUA OUTPUT HARUS DALAM BAHASA INDONESIA.

  Teks Klausul: {{{clauseText}}}

  Tanggapi dalam format JSON terstruktur yang cocok dengan deskripsi skema. riskScore harus antara 0 dan 100. riskFactors harus spesifik dan dapat ditindaklanjuti. suggestedAlternative harus menjadi pengganti lengkap untuk Teks Klausul. rationale harus jelas dan ringkas.
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
