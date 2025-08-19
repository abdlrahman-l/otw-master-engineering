# Perbedaan: API Gateway, Load Balancer, dan Reverse Proxy

Ketiga komponen ini memiliki peran yang berbeda dalam arsitektur aplikasi, meskipun ada tumpang tindih dalam fungsionalitasnya.

**Analogi Sederhana:**
*   **Reverse Proxy:** Resepsionis yang menerima semua tamu dan mengarahkan mereka ke ruangan yang tepat.
*   **Load Balancer:** Manajer antrean yang merupakan jenis resepsionis khusus, yang tugasnya membagi tamu ke banyak resepsionis yang identik agar tidak ada yang terlalu sibuk.
*   **API Gateway:** Selain tugas resepsionis, dia juga melakukan pemeriksaan keamanan, validasi identitas, dan menerjemahkan bahasa yang digunakan oleh tamu ke bahasa yang dipahami oleh ruangan-ruangan di dalam gedung.

Mari kita bahas lebih dalam.

---

### 1. Reverse Proxy

*   **Tugas Utama:** Menerima permintaan dari klien dan meneruskannya ke satu atau lebih server backend. Reverse Proxy menyembunyikan server backend dari klien, meningkatkan keamanan, dan dapat menyediakan fitur tambahan seperti caching dan kompresi.
*   **Cara Kerja:** Ia bertindak sebagai perantara antara klien dan server backend. Klien hanya berkomunikasi dengan Reverse Proxy, yang kemudian meneruskan permintaan ke server yang sesuai.
*   **Contoh Penggunaan:**
    *   Menyembunyikan alamat IP server backend.
    *   Melakukan SSL termination.
    *   Melakukan caching konten statis.
*   **Contoh Perangkat Lunak:** Nginx, Apache HTTP Server, HAProxy.

---

### 2. Load Balancer

*   **Tugas Utama:** Mendistribusikan lalu lintas jaringan ke beberapa server backend untuk memastikan tidak ada satu server pun yang kewalahan. Load Balancer meningkatkan ketersediaan dan skalabilitas aplikasi.
*   **Cara Kerja:** Menggunakan algoritma (misalnya, Round Robin, Least Connections) untuk membagi permintaan secara merata ke server-server backend.
*   **Contoh Penggunaan:**
    *   Mendistribusikan lalu lintas ke beberapa instance aplikasi web.
    *   Memastikan aplikasi tetap tersedia jika satu server gagal.
*   **Contoh Perangkat Lunak:** HAProxy, Nginx, F5 BIG-IP, AWS Elastic Load Balancing (ELB).

---

### 3. API Gateway

*   **Tugas Utama:** Titik masuk tunggal untuk semua permintaan dari klien ke aplikasi microservices. API Gateway melakukan routing, komposisi, dan terjemahan protokol. Selain itu, seringkali menangani otentikasi, otorisasi, pembatasan laju (rate limiting), dan pemantauan.
*   **Cara Kerja:** Menerima semua permintaan dari klien, menentukan layanan backend mana yang harus menangani permintaan tersebut, dan meneruskan permintaan ke layanan tersebut.
*   **Contoh Penggunaan:**
    *   Menyediakan antarmuka yang seragam ke berbagai layanan backend.
    *   Menangani otentikasi dan otorisasi pengguna.
    *   Menerapkan kebijakan pembatasan laju (rate limiting).
*   **Contoh Perangkat Lunak:** Kong, Tyk, AWS API Gateway, Azure API Management.

---

## Hubungan dan Perbedaan Kunci

*   **Reverse Proxy** adalah fondasi dasar untuk menyembunyikan dan melindungi server di belakangnya.
*   **Load Balancer** adalah jenis Reverse Proxy yang lebih canggih, dengan fokus pada distribusi lalu lintas untuk meningkatkan ketersediaan dan skalabilitas.
*   **API Gateway** adalah lapisan yang lebih kompleks yang menyediakan fungsionalitas tambahan seperti otentikasi, otorisasi, dan pembatasan laju, serta bertindak sebagai titik masuk tunggal untuk aplikasi.

### Tabel Perbandingan

| Fitur | Reverse Proxy | Load Balancer | API Gateway |
| :--- | :--- | :--- | :--- |
| **Tujuan Utama** | Menyembunyikan dan melindungi server backend | Mendistribusikan lalu lintas untuk ketersediaan dan skalabilitas | Menyediakan antarmuka tunggal dan mengelola akses ke layanan backend |
| **Fokus Utama** | Keamanan, caching | Ketersediaan, skalabilitas | Routing, keamanan, transformasi protokol |
| **Fungsi Tambahan** | SSL termination, caching | Health checks, algoritma distribusi | Otentikasi, otorisasi, rate limiting |
| **Kompleksitas** | Rendah | Menengah | Tinggi |
| **Contoh Kasus** | Melindungi server web dari serangan DDoS | Mendistribusikan lalu lintas ke beberapa instance aplikasi | Menyediakan API untuk aplikasi microservices |

## Kesimpulan

Dalam arsitektur modern, ketiga komponen ini sering bekerja sama untuk membangun aplikasi yang aman, skalabel, dan mudah dikelola. API Gateway dapat menggunakan Load Balancer untuk mendistribusikan lalu lintas ke beberapa instance layanan backend, dan setiap layanan backend dapat menggunakan Reverse Proxy untuk melindungi dirinya sendiri.
