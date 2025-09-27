
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
  suggestedAlternative: z.string().describe('The suggested alternative clause to incorporate into the new draft.'),
});
export type DraftContractInput = z.infer<typeof DraftContractInputSchema>;

export const DraftContractOutputSchema = z.object({
  redraftedContractText: z.string().describe('The full text of the redrafted contract, incorporating the suggested revisions.'),
});
export type DraftContractOutput = z.infer<typeof DraftContractOutputSchema>;

export const GenerateContractTemplateInputSchema = z.object({
    originalContractText: z.string().describe('The full original text of the contract to be used as a base for the template.'),
});
export type GenerateContractTemplateInput = z.infer<typeof GenerateContractTemplateInputSchema>;

export const GenerateContractTemplateOutputSchema = z.object({
    templateContractText: z.string().describe('The full text of the professionally formatted, reusable contract template.'),
});
export type GenerateContractTemplateOutput = z.infer<typeof GenerateContractTemplateOutputSchema>;

export const ExtractTextFromFileInputSchema = z.object({
    fileDataUri: z.string().describe("A file (PDF, DOCX, TXT) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

export const ExtractTextFromFileOutputSchema = z.object({
    extractedText: z.string().describe('The raw extracted text content from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export const SemanticSearchInputSchema = z.object({
  query: z.string().describe("The user's natural language search query."),
  contracts: z.array(z.object({
    id: z.string(),
    textContent: z.string(),
  })).describe('A list of contracts to search through.'),
});
export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;

export const SemanticSearchOutputSchema = z.object({
  matchingContractIds: z.array(z.string()).describe('An array of contract IDs that best match the search query.'),
});
export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;

    