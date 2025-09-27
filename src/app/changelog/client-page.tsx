'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { History } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';


// Sub-components for the Timeline
const Timeline = React.forwardRef<
  HTMLOListElement,
  React.ComponentProps<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn('flex flex-col', className)}
    {...props}
  />
));
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('relative flex flex-col', className)}
    {...props}
  />
));
TimelineItem.displayName = 'TimelineItem';

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute left-[9px] top-[18px] -translate-x-1/2',
      'h-full w-px bg-primary/20',
      className
    )}
    {...props}
  />
));
TimelineConnector.displayName = 'TimelineConnector';

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
TimelineHeader.displayName = 'TimelineHeader';

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-5 w-5 items-center justify-center rounded-full bg-primary',
      'z-10 shrink-0 text-primary-foreground',
      className
    )}
    {...props}
  />
));
TimelineIcon.displayName = 'TimelineIcon';

const TimelineTime = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('w-28 text-xs text-muted-foreground', className)}
    {...props}
  />
));
TimelineTime.displayName = 'TimelineTime';

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold text-foreground', className)}
    {...props}
  />
));
TimelineTitle.displayName = 'TimelineTitle';

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('pb-8 pt-2 pl-9 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TimelineDescription.displayName = 'TimelineDescription';



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
