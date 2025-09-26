import { config } from 'dotenv';
config();

import '@/ai/flows/answer-contract-questions-flow.ts';
import '@/ai/flows/extract-contract-data-flow.ts';
import '@/ai/flows/detect-contract-risk-flow.ts';
import '@/ai/flows/draft-contract-flow.ts';
import '@/ai/flows/generate-contract-template-flow.ts';
