
import { config } from 'dotenv';
config();

import '@/ai/flows/answer-contract-questions-flow.ts';
import '@/ai/flows/extract-contract-data-flow.ts';
import '@/ai/flows/detect-contract-risk-flow.ts';
import '@/aiG/flows/draft-contract-flow.ts';
import '@/ai/flows/generate-contract-template-flow.ts';
import '@/ai/flows/semantic-search-flow.ts';

