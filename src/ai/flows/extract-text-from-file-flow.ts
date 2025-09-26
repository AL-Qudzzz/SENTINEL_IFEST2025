
'use server';
/**
 * @fileOverview An AI agent to extract raw text from a document file.
 *
 * - extractTextFromFile - A function that takes a file (as a data URI) and returns its text content.
 */

import {ai} from '@/ai/genkit';
import { ExtractTextFromFileInputSchema, ExtractTextFromFileOutputSchema, type ExtractTextFromFileInput, type ExtractTextFromFileOutput } from './schemas';


export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return extractTextFromFileFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractTextFromFilePrompt',
    input: { schema: ExtractTextFromFileInputSchema },
    output: { schema: ExtractTextFromFileOutputSchema },
    prompt: `You are a highly accurate text extraction tool. Your sole purpose is to extract all readable text from the provided file.

    - Do NOT summarize, analyze, interpret, or modify the text in any way.
    - Do NOT add any commentary, greetings, or explanations.
    - Preserve original line breaks and formatting as much as possible.
    - If the file is not a document or contains no readable text, return an empty string for the 'extractedText' field.

    Return only the raw text content of the file.

    File to process: {{media url=fileDataUri}}
    `,
});

const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
