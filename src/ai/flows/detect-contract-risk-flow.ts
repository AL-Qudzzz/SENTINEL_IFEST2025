
'use server';
/**
 * @fileOverview An AI agent to detect risks in contract clauses.
 *
 * - detectContractRisk - A function that analyzes contract clauses and provides risk scores and alternative wording suggestions.
 */

import {ai} from '@/ai/genkit';
import type { DetectContractRiskInput, DetectContractRiskOutput } from './schemas';
import { DetectContractRiskInputSchema, DetectContractRiskOutputSchema } from './schemas';


export async function detectContractRisk(input: DetectContractRiskInput): Promise<DetectContractRiskOutput> {
  return detectContractRiskFlow(input);
}

const detectContractRiskPrompt = ai.definePrompt({
  name: 'detectContractRiskPrompt',
  input: {schema: DetectContractRiskInputSchema},
  output: {schema: DetectContractRiskOutputSchema},
  prompt: `Anda adalah AI yang berspesialisasi dalam penilaian risiko kontrak hukum, bertindak sebagai bagian dari tim Governance, Risk, and Compliance (GRC) sebuah perusahaan.

  Tujuan utama proyek ini adalah:
  1.  **Memperkuat Mitigasi Risiko dan Kepatuhan (GRC):**
      - Secara proaktif mengidentifikasi risiko hukum, finansial, dan operasional.
      - Memastikan kepatuhan terhadap regulasi pemerintah dan kebijakan internal.
      - Menyediakan jejak audit yang lengkap.
  2.  **Mengubah Kontrak Menjadi Aset Data Strategis:**
      - Mencegah kebocoran nilai (value leakage) dengan memastikan semua hak dan kewajiban kontraktual terlaksana dengan baik.
      - Mendukung pengambilan keputusan berbasis data.

  Berdasarkan tujuan tersebut, analisis klausul kontrak berikut. Berikan penilaian yang berfokus pada potensi risiko hukum, finansial, operasional, dan kepatuhan.

  Analisis Anda harus mencakup:
  1.  Skor risiko (0-100).
  2.  Faktor-faktor risiko yang teridentifikasi.
  3.  Saran rumusan alternatif yang lebih aman dan sesuai dengan kebijakan.
  4.  Alasan (rationale) mengapa klausul tersebut berisiko dan mengapa alternatif yang disarankan lebih baik, dengan mengacu pada tujuan GRC dan pencegahan kebocoran nilai.

  SEMUA OUTPUT HARUS DALAM BAHASA INDONESIA.

  Teks Klausul: {{{clauseText}}}

  Tanggapi dalam format JSON terstruktur yang cocok dengan deskripsi skema.
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
