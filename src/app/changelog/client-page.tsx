'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineDescription, TimelineTime } from './timeline';
import { History } from 'lucide-react';

const changelogData = [
    {
      version: '1.2.1',
      date: '27 September 2025',
      title: 'Peningkatan: Dokumentasi Terpusat',
      description: 'Memindahkan catatan perubahan (changelog) ke dalam file `README.md` utama untuk menyediakan sumber informasi tunggal bagi pengembang. Menghapus halaman `/changelog` dan tautan navigasi terkait untuk menyederhanakan antarmuka.',
    },
    {
      version: '1.2.0',
      date: '27 September 2025',
      title: 'Fitur: Pembaruan Foto Profil Pengguna',
      description: 'Mengimplementasikan fungsionalitas bagi pengguna untuk mengunggah dan memperbarui foto profil mereka. Alur terintegrasi penuh dengan Firebase Storage untuk penyimpanan gambar dan memperbarui `photoURL` di Firebase Auth serta dokumen pengguna di Firestore.',
    },
    {
      version: '1.1.0',
      date: '26 September 2025',
      title: 'Perbaikan Kritis: Logika Tanggal Kedaluwarsa Kontrak',
      description: 'Memperbaiki bug fatal di mana sistem salah menggunakan tanggal hari ini sebagai dasar untuk menghitung tanggal kedaluwarsa. Logika diubah untuk selalu menggunakan `effectiveDate` yang valid dari hasil analisis AI sebagai satu-satunya dasar untuk perhitungan *fallback*, memastikan konsistensi dan akurasi data.',
    },
    {
      version: '1.0.0',
      date: '26 September 2025',
      title: 'Rilis Awal: Inisialisasi Proyek Sentinel',
      description: 'Rilis awal aplikasi Sentinel dengan fitur-fitur inti termasuk Dashboard, Manajemen Kontrak, Analisis Risiko AI, Q&A Kontrak, Collaboration Hub, dan Manajemen Pengguna.',
    },
  ];

export default function ChangelogClientPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Project Changelog
        </h1>
        <p className="text-muted-foreground">
          Evolusi, perbaikan bug, dan keputusan arsitektural yang dibuat selama pengembangan.
        </p>
      </header>

      <main className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Versi</CardTitle>
            <CardDescription>Jejak audit dari semua perubahan signifikan dalam proyek Sentinel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline>
              {changelogData.map((item, index) => (
                <TimelineItem key={item.version}>
                  <TimelineConnector />
                  <TimelineHeader>
                    <TimelineTime>{item.date}</TimelineTime>
                    <TimelineTitle>{item.title} (v{item.version})</TimelineTitle>
                    <TimelineIcon>
                      <History className="h-4 w-4" />
                    </TimelineIcon>
                  </TimelineHeader>
                  <TimelineDescription>{item.description}</TimelineDescription>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Sub-components for the Timeline
namespace-wrap-here
