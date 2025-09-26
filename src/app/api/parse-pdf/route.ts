
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Lazily import pdf-parse inside the handler to avoid issues at build time.
  const pdf = require('pdf-parse');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text }, { status: 200 });

  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: 'Gagal memproses PDF di server.' }, { status: 500 });
  }
}
