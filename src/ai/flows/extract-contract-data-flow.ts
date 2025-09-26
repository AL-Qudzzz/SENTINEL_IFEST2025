'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting key contract data.
 *
 * The flow uses a prompt to instruct the LLM to extract metadata, dates, obligations,
 * and performance metrics from contract documents.
 *
 * @exported extractContractData - The main function to call the flow.
 * @exported ExtractContractDataInput - The input type for the flow.
 * @exported ExtractContractDataOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractContractDataInputSchema = z.object({
  contractText: z
    .string()
    .describe('The text content of the contract document.'),
});
export type ExtractContractDataInput = z.infer<typeof ExtractContractDataInputSchema>;

const ExtractContractDataOutputSchema = z.object({
  metadata: z
    .object({
      contractType: z.string().describe('The type of contract, e.g., "Master Service Agreement", "NDA".'),
      partiesInvolved: z.string().describe('The names of the parties involved in the contract, separated by commas.'),
      contractValue: z.string().describe('The total monetary value of the contract. Should include currency.'),
    })
    .describe('Key metadata of the contract, such as contract type, parties involved, and contract value.'),
  importantDates: z
    .array(z.object({dateType: z.string(), date: z.string()}))
    .describe('Important dates in the contract, such as effective date, renewal date, and termination date.'),
  obligations: z
    .array(z.string())
    .describe('Key obligations of each party involved in the contract.'),
  performanceMetrics: z
    .object({
      sla: z.string().describe('Key Service Level Agreements (SLAs) mentioned in the contract.')
    })
    .describe('Performance metrics defined in the contract.'),
});
export type ExtractContractDataOutput = z.infer<typeof ExtractContractDataOutputSchema>;

export async function extractContractData(input: ExtractContractDataInput): Promise<ExtractContractDataOutput> {
  return extractContractDataFlow(input);
}

const extractContractDataPrompt = ai.definePrompt({
  name: 'extractContractDataPrompt',
  input: {schema: ExtractContractDataInputSchema},
  output: {schema: ExtractContractDataOutputSchema},
  prompt: `You are an AI assistant specialized in extracting key information from legal contracts.
  Given the contract text below, extract the following information and format it as a JSON object:

  - Metadata: Key metadata of the contract, such as contract type, parties involved, and contract value.
  - Important Dates: Important dates in the contract, such as effective date, renewal date, and termination date. Represent each date with its type and the date itself.
  - Obligations: Key obligations of each party involved in the contract.
  - Performance Metrics: Key Service Level Agreements (SLAs) defined in the contract.

  Contract Text:
  {{contractText}}

  Make sure the JSON is valid and all fields are populated if available in the contract text.
  If a particular piece of data is not present, provide a reasonable empty or null value for its field, but do not omit the field.
  `,
});

const extractContractDataFlow = ai.defineFlow(
  {
    name: 'extractContractDataFlow',
    inputSchema: ExtractContractDataInputSchema,
    outputSchema: ExtractContractDataOutputSchema,
  },
  async input => {
    const {output} = await extractContractDataPrompt(input);
    return output!;
  }
);
