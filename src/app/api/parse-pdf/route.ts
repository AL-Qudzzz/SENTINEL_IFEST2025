import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }

    // Ubah file menjadi Buffer untuk diproses oleh pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Logika pdf-parse berjalan aman di sini (server-side)
    const data = await pdf(buffer);

    // Kirim kembali teks yang sudah diekstrak
    return NextResponse.json({ text: data.text }, { status: 200 });

  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: 'Gagal memproses PDF di server.' }, { status: 500 });
  }
}
