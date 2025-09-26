
'use server';
/**
 * @fileOverview An AI agent for performing semantic search over contracts.
 *
 * - semanticSearch - A function that takes a natural language query and returns matching contract IDs.
 */

import {ai} from '@/ai/genkit';
import { SemanticSearchInputSchema, SemanticSearchOutputSchema, type SemanticSearchInput, type SemanticSearchOutput } from './schemas';

export async function semanticSearch(input: SemanticSearchInput): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'semanticSearchPrompt',
  input: { schema: SemanticSearchInputSchema },
  output: { schema: SemanticSearchOutputSchema },
  prompt: `You are an intelligent legal search engine. Your task is to find contracts that best match a user's query from a provided list.

Analyze the user's query to understand its intent. Then, for each contract, determine if its content matches the query.

User Query:
"{{{query}}}"

Available Contracts (only use the text content for matching):
{{#each contracts}}
---
Contract ID: {{id}}
Content: {{{textContent}}}
---
{{/each}}

Based on your analysis, return a JSON object containing a list of the contract IDs that are the most relevant matches for the user's query. The list should be ordered by relevance, with the most relevant contract ID first. If no contracts match, return an empty list.
`,
});

const semanticSearchFlow = ai.defineFlow(
  {
    name: 'semanticSearchFlow',
    inputSchema: SemanticSearchInputSchema,
    outputSchema: SemanticSearchOutputSchema,
  },
  async (input) => {
    if (input.contracts.length === 0) {
      return { matchingContractIds: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
