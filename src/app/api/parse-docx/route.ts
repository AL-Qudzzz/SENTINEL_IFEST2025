import { NextRequest, NextResponse } from 'next/server';
const mammoth = require('mammoth');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });

    return NextResponse.json({ text: result.value }, { status: 200 });

  } catch (error) {
    console.error('Error parsing DOCX:', error);
    return NextResponse.json({ error: 'Gagal memproses DOCX di server.' }, { status: 500 });
  }
}
