'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting key contract data.
 *
 * The flow uses a prompt to instruct the LLM to extract metadata, dates, obligations,
 * and performance metrics from contract documents into a structured JSON format.
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

const DateObjectSchema = z.object({
  day: z.number().nullable().describe('The day of the month (e.g., 7). Null if not available.'),
  month: z.number().nullable().describe('The month of the year (1-12). Null if not available.'),
  year: z.number().nullable().describe('The year (e.g., 2026). Null if not available.'),
}).describe('A structured representation of a date.');


const ExtractContractDataOutputSchema = z.object({
  metadata: z
    .object({
      contractType: z.string().describe('The type of contract, e.g., "Master Service Agreement", "NDA".'),
      partiesInvolved: z.string().describe('The names of the parties involved in the contract, separated by commas.'),
      contractValue: z.string().describe('The total monetary value of the contract. Should include currency.'),
    })
    .describe('Key metadata of the contract, such as contract type, parties involved, and contract value.'),
  importantDates: z
    .object({
      effectiveDate: DateObjectSchema.nullable().describe('The effective date of the contract.'),
      expirationDate: DateObjectSchema.nullable().describe('The expiration date of the contract.'),
      renewalDate: DateObjectSchema.nullable().describe('The renewal date of the contract, if any.'),
      contractDuration: z.string().optional().describe('The total duration of the contract (e.g., "2 years", "6 months").'),
    })
    .describe('Important dates in the contract, including specific dates and the contract duration.'),
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
  Given the contract text below, extract the following information and format it as a JSON object that strictly adheres to the provided schema.

  - Metadata: Key metadata of the contract.
  - Important Dates: Extract the effective, expiration, and renewal dates as structured objects with day, month, and year. Also extract the contract duration as a string.
  - Obligations: Key obligations of each party.
  - Performance Metrics: Key Service Level Agreements (SLAs).

  **IMPORTANT INSTRUCTIONS FOR DATES:**
  - For each date (effectiveDate, expirationDate, renewalDate), you MUST provide a JSON object with 'day', 'month', and 'year' fields.
  - The 'month' must be a number from 1 (January) to 12 (December).
  - If a specific date (e.g., renewalDate) is not mentioned in the contract, the entire date object for it should be 'null'.
  - If part of a date is missing, that specific field (day, month, or year) should be 'null'. For example, if the contract says "October 2026", the 'day' field should be null.

  Contract Text:
  {{contractText}}

  Make sure the JSON is valid and all fields are populated if available in the contract text.
  If a particular piece of data is not present (like 'contractValue' or an entire date object), provide a 'null' or empty value for its field, but do not omit the field itself.
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
