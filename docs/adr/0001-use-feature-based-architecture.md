# ADR 0001: Adopsi Feature-Based Architecture & Clean Layered Design

## Status
ACCEPTED (Tanggal: 2026-07-27)

## Konteks
Seiring tumbuhnya jumlah fitur dan anggota tim, arsitektur berbasis layer murni (memisahkan folder `components`, `hooks`, `services` di root secara flat) menyebabkan *file cluttering* dan *high coupling* antar modul.

## Keputusan
Kami memutuskan untuk menggunakan **Feature-Based Architecture**. Setiap modul domain bisnis baru diisolasi di folder `src/features/<feature-name>` dan diekspor menggunakan barrel file `index.ts`.

## Konsekuensi
* **Positif**: Modul lebih independen, mudah di-test, dan mempercepat proses onboarding developer baru.
* **Negatif**: Membutuhkan disiplin tinggi agar developer tidak membuat circular dependency antar fitur.
