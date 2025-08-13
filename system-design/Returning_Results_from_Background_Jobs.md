# Mengembalikan Hasil dari Background Jobs

Karena background jobs bersifat asinkron, aplikasi utama tidak bisa begitu saja menunggu hasil seperti memanggil fungsi biasa. Diperlukan sebuah mekanisme untuk memberitahukan penyelesaian dan mengirimkan hasilnya.

Ada tiga pola utama untuk menangani ini.

---

## 1. Polling (Tanya Secara Berkala)

Ini adalah pola yang paling sederhana. Klien (bisa jadi frontend atau layanan lain) secara aktif bertanya kepada server tentang status sebuah job.

**Alur Kerja:**

1.  **Inisiasi:** Klien mengirim permintaan untuk memulai job. Server membuat job, memasukkannya ke antrean, dan langsung merespons dengan sebuah `jobId` unik.
2.  **Polling:** Klien kemudian secara berkala (misalnya, setiap 5 detik) mengirim permintaan ke endpoint status (misalnya, `GET /api/jobs/status/{jobId}`).
3.  **Respons Status:** Server memeriksa status job tersebut dan merespons dengan status saat ini: `PENDING`, `RUNNING`, `COMPLETED`, atau `FAILED`.
4.  **Hasil:** Jika statusnya `COMPLETED`, respons dari server akan menyertakan hasilnya (misalnya, URL ke file laporan yang telah dibuat). Klien kemudian berhenti melakukan polling.

```
Client                      Server (API)                Worker
  |                           |                           |
  |---(1) Start Job---------->|                           |
  |<--(2) Return {jobId}-----|                           |
  |                           |---(3) Enqueue Job-------->|
  |                           |                           |
  |---(4) GET /status/{jobId}?>|                           |
  |<--(5) {status: "RUNNING"}-|                           |
  |             ... (wait) ...                            |
  |---(6) GET /status/{jobId}?>|                           |
  |                           |<----(7) Job Done----------|
  |<--(8) {status: "COMPLETED", resultUrl: "..."}----|
```

*   **Kelebihan:** Relatif mudah diimplementasikan di sisi server.
*   **Kekurangan:** Tidak efisien, menciptakan banyak lalu lintas jaringan, dan ada jeda waktu untuk mendapatkan hasil.
*   **Contoh Kasus:** Halaman "memproses video" di YouTube. Frontend kemungkinan besar melakukan polling ke backend untuk memperbarui progress bar.

---

## 2. Webhooks / Callbacks (Diberi Tahu oleh Server)

Dalam pola ini, klien memberikan "alamat" (URL) kepada server. Ketika job selesai, worker akan mengirimkan hasilnya ke alamat tersebut.

**Alur Kerja:**

1.  **Inisiasi:** Klien memulai job dan menyertakan `callbackUrl` dalam permintaannya.
2.  **Eksekusi:** Worker mengambil job (yang sekarang berisi `callbackUrl`) dan memprosesnya.
3.  **Callback:** Setelah selesai, worker membuat permintaan HTTP POST ke `callbackUrl` yang diberikan. Isi (body) dari permintaan ini adalah hasil dari job tersebut.

```
Client System               Our Server (API)            Our Worker
      |                           |                           |
      |---(1) Start Job with callbackUrl -->|                           |
      |<--(2) {status: "ACCEPTED"}----------|                           |
      |                           |---(3) Enqueue Job-------->|
      |                           |                       (Processing...)
      |                           |<----(4) Job Done----------|
      |<--(5) POST to callbackUrl with result ---------------|
```

*   **Kelebihan:** Sangat efisien dan real-time.
*   **Kekurangan:** Lebih kompleks. Klien harus menyediakan endpoint publik yang aman. Worker harus bisa menangani kegagalan callback.
*   **Contoh Kasus:** Sistem pembayaran seperti Stripe. Setelah pembayaran diproses, server Stripe akan mengirimkan notifikasi ke *webhook URL* yang telah didaftarkan.

---

## 3. Push Notifications (WebSocket / Server-Sent Events)

Pola ini ideal untuk aplikasi web atau mobile yang interaktif, di mana hasilnya perlu ditampilkan langsung di antarmuka pengguna.

**Alur Kerja:**

1.  **Koneksi:** Klien (misalnya, browser) membuka koneksi persisten ke server menggunakan teknologi seperti WebSockets.
2.  **Inisiasi:** Klien memulai job melalui permintaan HTTP biasa.
3.  **Push:** Setelah worker menyelesaikan job, server mengirimkan pesan melalui koneksi WebSocket yang sudah ada.
4.  **Update UI:** Frontend menerima pesan ini secara real-time dan langsung memperbarui UI tanpa perlu me-refresh halaman.

*   **Kelebihan:** Pengalaman pengguna terbaik, sangat real-time dan interaktif.
*   **Kekurangan:** Memerlukan infrastruktur tambahan untuk mengelola koneksi persisten.
*   **Contoh Kasus:** Aplikasi kolaborasi seperti Google Docs atau Figma. Ketika rekan tim Anda membuat perubahan, hasilnya langsung di-*push* ke layar Anda.