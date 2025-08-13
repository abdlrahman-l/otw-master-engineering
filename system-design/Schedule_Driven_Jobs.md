# Memahami Schedule-Driven Background Jobs

**Schedule-Driven Jobs** (sering disebut juga **Cron Jobs** atau **Scheduled Tasks**) adalah background jobs yang dieksekusi secara otomatis pada waktu yang telah ditentukan atau dalam interval yang berulang.

Berbeda dengan model event-driven yang reaktif, model schedule-driven ini bersifat **proaktif**. Sistem tidak menunggu sesuatu terjadi; ia secara aktif memulai tugas berdasarkan jadwal waktu.

Ini melengkapi dua pemicu lain untuk background jobs:
1.  **Action-Driven:** Dipicu oleh aksi pengguna (misalnya, menekan tombol).
2.  **Event-Driven:** Dipicu oleh peristiwa yang terjadi di dalam sistem.

---

## Bagaimana Cara Kerjanya?

Komponen inti dalam arsitektur ini adalah **Scheduler**.

```
+-----------+       (1) Trigger at       +----------------+      (2) Push Job      +-----------------+      (3) Execute      +----------+
|           |         scheduled time     |                |----------------------->|                 |--------------------->|          |
| Scheduler |--------------------------->|  Task Launcher |                        |  Message Queue  |                       |  Worker  |
| (Cron)    |                            |   (Producer)   |----------------------->|                 |--------------------->|          |
+-----------+                            +----------------+      (Optional but     +-----------------+      (4) Process      +----------+
                                                                  Recommended)                                    |
                                                                                                                    |
                                                                                                              +---v----+
                                                                                                              | Database |
                                                                                                              +----------+
```

1.  **Scheduler:** Ini adalah "jam alarm" sistem. Ia dikonfigurasi dengan jadwal tertentu (misalnya, "setiap hari jam 2 pagi" atau "setiap 15 menit"). Ketika waktu yang ditentukan tiba, ia akan memicu sebuah tugas.
2.  **Task Launcher (Producer):** Ketika dipicu oleh Scheduler, komponen ini bertanggung jawab untuk memulai pekerjaan. Dalam arsitektur yang tangguh, ia akan membuat sebuah "job" dan mengirimkannya ke **Message Queue**.
3.  **Message Queue & Worker:** Dari sini, alurnya sama seperti background job biasa. Worker akan mengambil job dari antrean dan mengeksekusinya.

Menggunakan Message Queue sebagai perantara sangat direkomendasikan karena memberikan ketahanan. Jika semua worker sedang sibuk saat job dijadwalkan, job tersebut akan menunggu dengan aman di antrean.

---

## Contoh Kasus Penggunaan di Dunia Nyata

Scheduled jobs sangat umum untuk tugas-tugas pemeliharaan, pelaporan, dan sinkronisasi.

1.  **Laporan Harian/Bulanan:**
    *   **Skenario:** Sebuah sistem e-commerce perlu menghasilkan laporan penjualan harian untuk para manajer.
    *   **Jadwal:** Setiap hari pada pukul 01:00 pagi, scheduler memicu job untuk mengumpulkan data penjualan dari hari sebelumnya, membuat file PDF, dan mengirimkannya melalui email.

2.  **Sinkronisasi Data:**
    *   **Skenario:** Sebuah aplikasi cuaca perlu mengambil data terbaru dari API penyedia cuaca pihak ketiga.
    *   **Jadwal:** Setiap 30 menit, scheduler memicu job untuk memanggil API tersebut dan memperbarui data cuaca di database lokal.

3.  **Pembersihan (Cleanup Tasks):**
    *   **Skenario:** Sebuah platform media sosial perlu menghapus sesi pengguna yang sudah kedaluwarsa atau file sementara.
    *   **Jadwal:** Setiap malam, scheduler menjalankan job untuk memindai dan membersihkan data yang tidak relevan.

4.  **Mengirim Newsletter Mingguan:**
    *   **Skenario:** Sebuah blog ingin mengirimkan rangkuman artikel terbaru kepada semua pelanggannya.
    *   **Jadwal:** Setiap hari Jumat pukul 10:00 pagi, scheduler memulai proses pengiriman newsletter.

5.  **Cache Warming:**
    *   **Skenario:** Sebuah situs berita ingin memastikan halaman utamanya dimuat secepat mungkin.
    *   **Jadwal:** Setiap 5 menit, scheduler memicu job untuk "mengunjungi" halaman utama, yang menyebabkan server membuat dan menyimpan versi cache terbaru dari halaman tersebut.

## Tantangan dan Pertimbangan

*   **Timezones:** Menentukan jadwal bisa menjadi rumit. "Pukul 9 pagi" bisa berarti hal yang berbeda tergantung pada lokasi server dan pengguna.
*   **Missed Runs:** Apa yang terjadi jika sistem sedang down pada saat jadwal eksekusi? Perlu ada strategi untuk menangani job yang terlewat.
*   **Long-Running Jobs:** Jika sebuah job yang dijadwalkan setiap jam ternyata membutuhkan waktu 70 menit untuk selesai, ini akan menyebabkan penumpukan. Desain job harus efisien.

Secara ringkas, **Schedule-Driven Jobs** adalah pilar penting dalam otomatisasi dan pemeliharaan sistem, bekerja berdampingan dengan job yang dipicu oleh aksi dan event untuk menciptakan aplikasi yang andal dan efisien.