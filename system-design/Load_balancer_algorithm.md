# Algoritma Load Balancing

Load Balancer menggunakan berbagai strategi atau **algoritma** untuk memutuskan ke server mana sebuah permintaan akan diteruskan. Pemilihan algoritma yang tepat sangat penting untuk efisiensi, performa, dan keandalan sistem.

Algoritma ini dapat dibagi menjadi dua kategori utama: **Statis** dan **Dinamis**.

---

## 1. Algoritma Statis

Algoritma ini mendistribusikan lalu lintas berdasarkan aturan yang sudah ditetapkan sebelumnya dan tidak mempertimbangkan kondisi atau beban server saat ini.

### a. Round Robin

Ini adalah algoritma paling sederhana dan paling umum. Permintaan didistribusikan secara bergiliran ke setiap server dalam daftar.

-   **Cara Kerja:** Request 1 → Server A, Request 2 → Server B, Request 3 → Server C, Request 4 → Server A, dan seterusnya.
-   **Analogi:** Seperti membagikan kartu satu per satu kepada setiap pemain secara berurutan.
-   **Kelebihan:** Sangat mudah diimplementasikan dan dipahami.
-   **Kekurangan:** Menganggap semua server memiliki kapasitas yang sama. Jika Server A jauh lebih kuat dari Server B, keduanya tetap mendapat jumlah permintaan yang sama, sehingga tidak efisien.
-   **Contoh Konfigurasi (Nginx):**
    ```nginx
    # Algoritma default di Nginx adalah Round Robin
    upstream myapp {
        server server1.example.com;
        server server2.example.com;
        server server3.example.com;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://myapp;
        }
    }
    ```

### b. Weighted Round Robin

Ini adalah perbaikan dari Round Robin di mana setiap server dapat diberi "bobot" (weight). Server dengan bobot lebih tinggi akan menerima lebih banyak permintaan secara proporsional.

-   **Cara Kerja:** Jika Server A memiliki `weight=3` dan Server B memiliki `weight=1`, maka polanya akan seperti: A, A, A, B, A, A, A, B, ...
-   **Kapan Digunakan:** Saat Anda memiliki server dengan spesifikasi yang berbeda (misalnya, ada yang RAM-nya lebih besar atau CPU-nya lebih cepat).
-   **Kelebihan:** Distribusi lebih adil sesuai kapasitas server yang sebenarnya.
-   **Kekurangan:** Bobotnya statis. Tidak beradaptasi jika sebuah server yang kuat tiba-tiba mengalami lonjakan beban karena suatu proses yang berat.
-   **Contoh Konfigurasi (Nginx):**
    ```nginx
    upstream myapp {
        # Server 1 akan menerima 3x lebih banyak traffic dari yang lain.
        server server1.example.com weight=3;
        server server2.example.com;
        server server3.example.com;
    }
    ```

### c. IP Hash

Load Balancer akan menghitung nilai hash dari alamat IP klien, lalu menggunakan hasil hash tersebut untuk secara konsisten menentukan ke server mana permintaan akan dikirim.

-   **Cara Kerja:** Pengguna dengan alamat IP yang sama akan **selalu** dikirim ke server yang sama.
-   **Kapan Digunakan:** Sangat penting untuk aplikasi yang membutuhkan *session persistence* atau "sticky sessions". Contohnya, keranjang belanja di e-commerce. Anda tidak mau pengguna yang sudah memasukkan barang ke keranjang di Server A, tiba-tiba diarahkan ke Server B dan keranjangnya kosong.
-   **Kelebihan:** Menjamin *session persistence* dengan mudah.
-   **Kekurangan:** Jika banyak pengguna berasal dari satu jaringan yang sama (misalnya, satu kantor besar dengan satu IP publik), mereka semua akan menumpuk di satu server. Distribusi bisa menjadi tidak merata.
-   **Contoh Konfigurasi (Nginx):**
    ```nginx
    upstream myapp {
        ip_hash;
        server server1.example.com;
        server server2.example.com;
    }
    ```

---

## 2. Algoritma Dinamis

Algoritma ini lebih cerdas. Load Balancer akan memeriksa kondisi atau beban aktual dari setiap server (seperti jumlah koneksi atau waktu respons) sebelum memutuskan ke mana akan mengirim permintaan baru.

### a. Least Connections (Koneksi Paling Sedikit)

Permintaan baru akan dikirim ke server yang sedang memiliki jumlah koneksi aktif paling sedikit.

-   **Cara Kerja:** Load Balancer terus memantau: Server A (10 koneksi), Server B (5 koneksi), Server C (8 koneksi). Maka, permintaan baru akan dikirim ke Server B.
-   **Analogi:** Manajer kasir mengarahkan Anda ke antrean terpendek.
-   **Kelebihan:** Sangat adaptif dan efisien dalam mendistribusikan beban kerja aktual secara merata.
-   **Kekurangan:** Mengasumsikan semua koneksi membebani server secara setara, padahal ada permintaan yang ringan dan ada yang berat.

### b. Weighted Least Connections

Ini adalah gabungan dari Weighted Round Robin dan Least Connections. Algoritma ini mempertimbangkan jumlah koneksi aktif **dan** bobot server.

-   **Cara Kerja:** Permintaan akan dikirim ke server yang memiliki rasio `(jumlah koneksi / bobot)` terkecil. Server yang lebih kuat dianggap mampu menangani lebih banyak koneksi.
-   **Kelebihan:** Mungkin algoritma dinamis yang paling seimbang dan sering menjadi pilihan utama untuk lingkungan dengan server yang beragam.

### c. Least Response Time

Ini adalah varian yang lebih canggih. Permintaan dikirim ke server yang memiliki waktu respons rata-rata paling cepat **dan** jumlah koneksi aktif paling sedikit.

-   **Cara Kerja:** Load Balancer tidak hanya melihat jumlah antrean, tapi juga seberapa cepat setiap "kasir" melayani pelanggan.
-   **Kelebihan:** Sangat fokus pada pengalaman pengguna (kecepatan).
-   **Kekurangan:** Membutuhkan pemantauan yang lebih aktif dan komputasi tambahan dari sisi Load Balancer.

---

## Ringkasan Perbandingan

| Algoritma | Tipe | Kriteria Distribusi | Kasus Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Round Robin** | Statis | Bergiliran secara merata | Distribusi sederhana, server identik |
| **Weighted Round Robin** | Statis | Berdasarkan bobot server | Server dengan kapasitas berbeda |
| **IP Hash** | Statis | Hash dari IP Klien | *Session persistence* (sticky sessions) |
| **Least Connections** | Dinamis | Jumlah koneksi aktif | Menyeimbangkan beban kerja aktual |
| **Least Response Time** | Dinamis | Waktu respons + koneksi | Fokus pada kecepatan & pengalaman pengguna |

| Algoritma | Kapan Sebaiknya Digunakan | Kelebihan | Kekurangan |
| :--- | :--- | :--- | :--- |
| **Round Robin** | Sistem sederhana dengan server-server yang identik. | Super simpel dan mudah diimplementasikan. | Tidak efisien jika server memiliki spesifikasi berbeda. |
| **Weighted Round Robin** | Server memiliki kapasitas atau spesifikasi yang berbeda-beda. | Distribusi lebih adil sesuai kapasitas server. | Bobotnya statis dan tidak adaptif terhadap beban sesaat. |
| **IP Hash** | Membutuhkan *session persistence* (misalnya, keranjang belanja, status login). | Menjaga sesi pengguna tetap di server yang sama. | Distribusi bisa tidak merata jika banyak pengguna dari satu IP. |
| **Least Connections** | Kasus penggunaan umum di mana beban permintaan sangat bervariasi. | Sangat adaptif terhadap perubahan beban secara *real-time*. | Menganggap semua koneksi sama berat. |
| **Least Response Time** | Saat kecepatan respons adalah metrik paling kritis bagi pengguna. | Paling optimal untuk pengalaman pengguna (*user experience*). | Lebih kompleks untuk diimplementasikan dan dipantau. |
