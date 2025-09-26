
import {z} from 'genkit';

export const DetectContractRiskInputSchema = z.object({
  clauseText: z.string().describe('The text of the contract clause to analyze.'),
});
export type DetectContractRiskInput = z.infer<typeof DetectContractRiskInputSchema>;

export const DetectContractRiskOutputSchema = z.object({
  riskScore: z.number().describe('Skor numerik yang menunjukkan tingkat risiko klausul (0-100).'),
  riskFactors: z.array(z.string()).describe('Faktor-faktor risiko spesifik yang diidentifikasi dalam klausul.'),
  suggestedAlternative: z.string().describe('Saran rumusan alternatif untuk klausul guna memitigasi risiko yang teridentifikasi.'),
  rationale: z.string().describe('Penjelasan mengapa klausul tersebut berisiko dan mengapa alternatif yang disarankan lebih baik.'),
});
export type DetectContractRiskOutput = z.infer<typeof DetectContractRiskOutputSchema>;


export const DraftContractInputSchema = z.object({
  originalContractText: z.string().describe('The full original text of the contract to be redrafted.'),
  riskAnalysis: DetectContractRiskOutputSchema.describe('The results from the detectContractRisk flow, including risk factors and suggested alternatives.'),
});
export type DraftContractInput = z.infer<typeof DraftContractInputSchema>;

export const DraftContractOutputSchema = z.object({
  redraftedContractText: z.string().describe('The full text of the redrafted contract, incorporating the suggested revisions.'),
});
export type DraftContractOutput = z.infer<typeof DraftContractOutputSchema>;
