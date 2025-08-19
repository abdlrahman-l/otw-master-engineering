# Arsitektur Microservices

**Microservices** adalah sebuah gaya arsitektur untuk mengembangkan aplikasi. Alih-alih membangun satu aplikasi besar yang tunggal dan monolitik, arsitektur ini menyusun aplikasi sebagai **kumpulan layanan-layanan kecil yang independen**.

Setiap layanan:
*   Berjalan dalam prosesnya sendiri.
*   Fokus pada satu kapabilitas bisnis yang spesifik (misalnya, layanan Pengguna, layanan Produk, layanan Pembayaran).
*   Dapat dikembangkan, di-deploy, dan di-scale secara mandiri tanpa memengaruhi layanan lain.
*   Berkomunikasi satu sama lain melalui API yang terdefinisi dengan baik, biasanya menggunakan protokol **Lapisan Aplikasi** seperti HTTP.

Karena seluruh logika, pemecahan, dan komunikasi terjadi di level aplikasi, microservices adalah sebuah paradigma yang berpusat di **Application Layer** (`Application_Layer.md`).

**Analogi Sederhana:**
*   **Monolith:** Satu koki serba bisa yang harus memasak semua jenis hidangan (pembuka, utama, penutup) di satu dapur. Jika koki ini sakit atau kewalahan, seluruh restoran akan terganggu.
*   **Microservices:** Tim yang terdiri dari koki-koki spesialis (satu ahli sup, satu ahli steak, satu ahli kue). Mereka bekerja di stasiun masing-masing. Jika stasiun kue sangat sibuk, kita bisa menambah koki kue tanpa mengganggu koki steak.

## Komponen dan Pola Kunci

Arsitektur microservices bergantung pada beberapa komponen dan pola kunci untuk berfungsi secara efektif.

### 1. API Gateway: Pintu Gerbang Utama

Klien (seperti aplikasi web atau mobile) tidak berinteraksi langsung dengan puluhan layanan microservice. Sebaliknya, mereka berkomunikasi melalui satu titik masuk tunggal yang disebut **API Gateway**.

API Gateway pada dasarnya adalah sebuah **Reverse Proxy** atau **Layer 7 Load Balancer** (`Layer_7_Load_Balancing.md`) yang sangat cerdas. Tugasnya adalah:

*   **Menerima semua permintaan masuk.**
*   **Melakukan routing cerdas berdasarkan konten.** Ia "membaca" permintaan HTTP dan meneruskannya ke microservice yang tepat berdasarkan URL path, header, dll.
    *   `GET /api/users/123` -> diarahkan ke **Layanan Pengguna**.
    *   `POST /api/orders` -> diarahkan ke **Layanan Pemesanan**.
*   **Menangani tugas lintas fungsi.** API Gateway sering kali bertanggung jawab atas otentikasi, rate limiting, caching, dan **SSL Termination** (`SSL_Termination.md`), sehingga setiap microservice bisa fokus pada logika bisnisnya saja.

### 2. Komunikasi Antar Layanan

Setelah permintaan masuk, para microservice sering kali perlu berkomunikasi satu sama lain.

#### a. Komunikasi Sinkron (Request-Response)
Satu layanan memanggil layanan lain secara langsung (biasanya melalui REST API via HTTP) dan menunggu respons.
*   **Contoh:** Saat memproses pesanan, **Layanan Pemesanan** perlu memeriksa stok. Ia akan mengirim permintaan `GET /api/stock/item-xyz` ke **Layanan Inventaris** dan menunggu jawaban sebelum melanjutkan.
*   **Kelemahan:** Menciptakan ketergantungan (coupling). Jika Layanan Inventaris lambat atau mati, Layanan Pemesanan akan ikut terganggu.

#### b. Komunikasi Asinkron (Event-Driven)
Ini adalah pola yang lebih tangguh. Sebuah layanan tidak memerintahkan layanan lain, melainkan hanya **mengumumkan sebuah peristiwa (event)** yang telah terjadi. Layanan lain yang tertarik pada peristiwa itu akan bereaksi secara independen.
*   **Contoh:** Setelah pembayaran berhasil, **Layanan Pembayaran** hanya menerbitkan event `OrderPaid`. Kemudian:
    *   **Layanan Inventaris** mendengar `OrderPaid` -> mengurangi stok barang.
    *   **Layanan Notifikasi** mendengar `OrderPaid` -> mengirim email konfirmasi ke pengguna.
*   **Kelebihan:** Sangat terpisah (*decoupled*) dan tangguh. Jika Layanan Notifikasi sedang down, proses lain tetap berjalan. Ini adalah cara untuk mengembalikan hasil dari proses yang berjalan di latar belakang, mirip dengan pola **Webhooks** yang dijelaskan di `Returning_Results_from_Background_Jobs.md`.

### 3. Database per Layanan

Prinsip inti dari microservices adalah otonomi. Untuk mencapai ini, setiap layanan harus memiliki dan mengelola databasenya sendiri. Satu layanan tidak boleh mengakses database layanan lain secara langsung.

*   **Keuntungan:** Memastikan layanan benar-benar terpisah. Tim layanan A bisa mengubah skema database mereka tanpa merusak layanan B.
*   **Tantangan:** Menjaga konsistensi data di berbagai database menjadi sangat sulit. Ini memaksa arsitek untuk berurusan dengan konsep seperti *eventual consistency*.

## Diagram Arsitektur Sederhana

```text
           +------------------+
 Klien --> |   API Gateway    |
           | (L7 LB, SSL Term)|
           +--------+---------+
                    |
      +-------------+-------------+
      |             |             |
      v             v             v
+----------+   HTTP   +----------+   Event   +----------+
|  Layanan | <------> |  Layanan |---------->|  Layanan |
| Pengguna |          | Pemesanan|           | Notifikasi|
+----------+          +----+-----+           +----------+
 | Database |               | HTTP
 | Pengguna |               v
 +----------+          +----------+
                       |  Layanan |
                       | Inventaris|
                       +----------+
                       | Database |
                       |Inventaris|
                       +----------+
```

## Keuntungan dan Tantangan

### Keuntungan
1.  **Skalabilitas Independen:** Anda bisa melakukan *scale out* hanya pada layanan yang sibuk (misalnya, menambah 5 server untuk layanan Produk) tanpa menyentuh layanan lain.
2.  **Ketersediaan Tinggi (High Availability):** Kegagalan satu layanan tidak akan meruntuhkan seluruh aplikasi.
3.  **Fleksibilitas Teknologi:** Setiap layanan bisa ditulis dengan bahasa pemrograman atau database yang paling sesuai untuk tugasnya.
4.  **Deployment Independen:** Tim dapat men-deploy layanan mereka kapan saja tanpa perlu berkoordinasi dengan puluhan tim lain.

### Tantangan
1.  **Kompleksitas Operasional:** Mengelola, memonitor, dan men-deploy puluhan layanan jauh lebih rumit daripada satu aplikasi monolitik.
2.  **Konsistensi Data:** Menjaga data tetap konsisten di berbagai database adalah tantangan besar.
3.  **Kompleksitas Jaringan:** Peningkatan komunikasi antar layanan melalui jaringan dapat menyebabkan latensi dan memerlukan penanganan kegagalan jaringan yang andal.
4.  **Pengujian:** Menguji interaksi antar layanan lebih sulit daripada menguji aplikasi monolitik.

## Kesimpulan

Arsitektur Microservices adalah pendekatan yang sangat kuat untuk membangun aplikasi yang besar, kompleks, dan skalabel. Dengan memecah sistem menjadi layanan-layanan kecil yang otonom, ia menawarkan fleksibilitas dan ketahanan yang luar biasa. Namun, keuntungan ini datang dengan harga kompleksitas operasional dan tantangan dalam sistem terdistribusi. Pemilihan arsitektur ini harus mempertimbangkan dengan cermat antara kebutuhan skalabilitas dan kemampuan tim untuk mengelola kompleksitas tersebut.


------------------------------
## 1. Apa itu Microservices?
Microservices adalah **pendekatan arsitektur** di mana sebuah aplikasi besar (monolithic) dipecah menjadi **layanan-layanan kecil** yang:
- Berdiri sendiri
- Memiliki tanggung jawab spesifik
- Bisa dikembangkan, dideploy, dan diskalakan secara independen

Contoh pada aplikasi e-commerce:
- **User Service** → mengelola akun pengguna  
- **Product Service** → mengelola katalog produk  
- **Order Service** → memproses pesanan  
- **Payment Service** → menangani transaksi  
- **Notification Service** → mengirim email/SMS/WhatsApp  

Semua ini berkomunikasi lewat API (misalnya REST, gRPC, atau message broker seperti Kafka/RabbitMQ).

---

## 2. Perbedaan dengan Monolithic
- **Monolithic**: Semua fitur ditaruh dalam satu codebase dan satu database → gampang di awal, tapi makin besar makin susah di-maintain.  
- **Microservices**: Fitur dipisah → lebih fleksibel, bisa scale sesuai kebutuhan, tapi kompleksitas komunikasi antar service meningkat.  

---

## 3. Komponen Penting dalam System Design Microservices
1. **API Gateway**  
   - Jadi “pintu depan” aplikasi  
   - Semua request dari client masuk lewat sini → lalu diteruskan ke service yang tepat  
   - Bisa handle: authentication, rate limiting, caching  

2. **Service Discovery**  
   - Karena service bisa berubah alamat (misalnya di Docker/Kubernetes), kita perlu registry agar service bisa menemukan satu sama lain  

3. **Communication**  
   - **Sync (HTTP/gRPC)** → cocok untuk permintaan langsung (misalnya ambil data user)  
   - **Async (Kafka, RabbitMQ)** → cocok untuk event-driven (misalnya saat pesanan berhasil → trigger notifikasi & pengurangan stok)  

4. **Database per Service**  
   - Idealnya tiap service punya database sendiri → biar lebih loose coupling  
   - Tantangan: data consistency → diselesaikan dengan **saga pattern**, **event sourcing**, atau **CQRS**  

5. **Monitoring & Logging**  
   - Karena banyak service berjalan terpisah, kita perlu centralized logging (contoh: ELK stack, Prometheus, Grafana, Jaeger untuk tracing)  

---

## 4. Kelebihan Microservices
✅ Skalabilitas → tiap service bisa di-scale sesuai kebutuhan  
✅ Fleksibilitas teknologi → tiap tim bisa pakai bahasa/framework berbeda  
✅ Isolasi kegagalan → kalau Notification service down, Order service tetap bisa jalan  
✅ Agile development → tim bisa bekerja paralel di service masing-masing  

---

## 5. Kekurangan Microservices
❌ Kompleksitas komunikasi → butuh API Gateway, message broker  
❌ DevOps lebih rumit → perlu CI/CD, containerization (Docker, Kubernetes)  
❌ Data consistency lebih sulit → perlu strategi distributed transaction  
❌ Latency tambahan → karena komunikasi antar service lewat network  




# Kapan Harus Menggunakan Microservices?

## 1. Skala Aplikasi Sudah Besar
- Kalau aplikasimu masih kecil, monolith biasanya lebih cepat dan lebih gampang.  
- Microservices cocok kalau aplikasi sudah kompleks dengan banyak domain (misalnya e-commerce dengan users, products, orders, payments, shipping).  

---

## 2. Tim Engineering Sudah Besar
- Monolith sulit dikerjakan paralel oleh banyak tim.  
- Microservices memungkinkan **tiap tim punya service masing-masing** → lebih independen, bisa pilih teknologi sendiri, bisa release lebih cepat tanpa nunggu tim lain.  

---

## 3. Butuh Skalabilitas yang Spesifik
- Misalnya **Product Service** jarang diakses, tapi **Order Service** dan **Payment Service** sangat sibuk saat promo 11.11.  
- Dengan microservices, kita bisa scale hanya di service tertentu (bukan seluruh aplikasi).  

---

## 4. Sistem Butuh High Availability
- Kalau Notification Service down, Order Service masih bisa jalan.  
- Arsitektur microservices bisa mengisolasi kegagalan agar tidak menjatuhkan seluruh sistem.  

---

## 5. Butuh Fleksibilitas Teknologi
- Misalnya:  
  - Machine Learning Service pakai **Python**  
  - Payment Service pakai **Java** (lebih mature untuk finance)  
  - Frontend API pakai **Node.js/TypeScript**  
- Dengan microservices, tiap service bisa punya teknologi sesuai kebutuhan.  

---

## 6. Aplikasi Punya Banyak Integrasi dengan Sistem Eksternal
- Misalnya: Payment Gateway, Notifikasi WhatsApp, Shipping Provider, dsb.  
- Lebih rapi kalau dibuat jadi service-service kecil yang berdiri sendiri.  

---

## 7. Organisasi Sudah Punya Infrastruktur DevOps yang Matang
- Microservices butuh CI/CD, monitoring, centralized logging, container (Docker/Kubernetes).  
- Kalau belum punya infrastruktur ini, microservices bisa jadi **lebih ribet daripada membantu**.  

---

# Kapan **Tidak Perlu** Microservices?
❌ Aplikasi masih kecil / MVP (lebih baik cepat bikin dengan monolith dulu).  
❌ Tim masih kecil (3–5 orang).  
❌ Belum ada DevOps/infra yang siap → akan buang waktu untuk setup.  
❌ Kompleksitas aplikasi masih bisa ditangani dengan modular monolith.  

---

# Ringkasan
👉 Gunakan microservices kalau:  
- Aplikasi besar & kompleks  
- Banyak tim yang bekerja paralel  
- Butuh scaling per fitur  
- Perlu isolasi kegagalan  
- Infrastruktur DevOps sudah siap  

👉 Jangan gunakan microservices kalau:  
- Masih tahap awal/startup kecil  
- Tim kecil & resource terbatas  
- Kompleksitas belum butuh pemecahan service  
