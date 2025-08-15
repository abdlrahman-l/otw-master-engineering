# SSL/TLS Termination

**SSL/TLS Termination** adalah sebuah proses di mana server perantara, biasanya sebuah **Load Balancer** atau **Reverse Proxy**, menangani koneksi HTTPS yang masuk dari klien. Server ini bertanggung jawab untuk "menghentikan" (terminate) enkripsi SSL/TLS sebelum meneruskan permintaan tersebut ke server backend dalam bentuk HTTP biasa (tidak terenkripsi).

Ini adalah salah satu fungsi paling penting dan umum dari komponen seperti Nginx atau Application Load Balancer di cloud.

## Bagaimana Cara Kerjanya?

Alur kerjanya membagi perjalanan permintaan menjadi dua segmen yang berbeda: satu segmen terenkripsi di jaringan publik dan satu segmen tidak terenkripsi di jaringan internal yang aman.

1.  **Klien ke Load Balancer (Segmen Terenkripsi):** Pengguna terhubung ke situs Anda melalui **HTTPS**. Koneksi ini aman dan dienkripsi menggunakan sertifikat SSL/TLS yang terpasang di Load Balancer.
2.  **Proses di Load Balancer:** Load Balancer menerima koneksi ini. Ia melakukan "pekerjaan berat" untuk mendekripsi permintaan, mengubahnya dari HTTPS menjadi HTTP biasa. Proses inilah yang disebut **SSL Termination**.
3.  **Load Balancer ke Server Aplikasi (Segmen Tidak Terenkripsi):** Setelah permintaan didekripsi, Load Balancer meneruskannya ke server aplikasi di belakangnya melalui koneksi **HTTP** biasa. Komunikasi ini terjadi di dalam jaringan internal pribadi Anda yang dianggap sebagai zona aman.

```text
      <-- INTERNET PUBLIK (Tidak Aman) -->   |   <-- JARINGAN INTERNAL (Aman & Terpercaya) -->
                                             |
+----------+      HTTPS (Terenkripsi)       +-----------------+      HTTP (Tidak Terenkripsi)      +----------------+
|          | ----------------------------> |                 | --------------------------------> |                |
|  Klien   |                               |  Load Balancer  |                                   |  Server Aplikasi |
|          | <---------------------------- | (Melakukan SSL  | <-------------------------------- |                |
+----------+      HTTPS (Terenkripsi)       |   Termination)  |      HTTP (Tidak Terenkripsi)      +----------------+
                                             +-----------------+
```

## Mengapa Ini Sangat Penting dan Bermanfaat?

SSL Termination bukan hanya tentang enkripsi; ini adalah enabler strategis untuk arsitektur modern.

### 1. CPU Offloading (Membebaskan Beban Server)
Proses handshake dan enkripsi/dekripsi SSL/TLS adalah tugas yang intensif secara komputasi dan memakan banyak sumber daya CPU. Dengan memindahkan tugas ini ke Load Balancer, server-server aplikasi Anda dibebaskan dari beban tersebut. Mereka bisa menggunakan seluruh daya komputasinya untuk fokus pada tugas utamanya: menjalankan logika bisnis. Ini membuat seluruh sistem lebih cepat dan efisien.

### 2. Memungkinkan Inspeksi Lalu Lintas (Layer 7 Intelligence)
Ini adalah manfaat paling krusial. Sebuah Load Balancer tidak bisa membaca atau memahami isi dari lalu lintas yang terenkripsi. Agar bisa melakukan **routing cerdas berbasis konten** (seperti yang dijelaskan di `Layer_7_Load_Balancing.md`), ia harus bisa "melihat" permintaan HTTP-nya.

Dengan melakukan SSL Termination, Load Balancer bisa membaca:
*   **URL Path:** Mengarahkan `/api/` ke server A dan `/images/` ke server B.
*   **HTTP Headers:** Mengarahkan pengguna mobile ke versi situs yang berbeda.
*   **Cookies:** Menjaga *session persistence* (sticky sessions).

Tanpa SSL Termination, Load Balancer hanya bisa beroperasi di Layer 4, meneruskan paket secara buta berdasarkan IP dan port.

### 3. Manajemen Sertifikat Terpusat
Bayangkan Anda memiliki 50 server aplikasi. Tanpa SSL Termination, Anda harus menginstal, mengonfigurasi, dan memperbarui sertifikat SSL di ke-50 server tersebut. Ini adalah mimpi buruk operasional. Dengan SSL Termination, Anda hanya perlu mengelola **satu sertifikat SSL** di satu tempat: Load Balancer.

### 4. Kebijakan Keamanan Terpusat
Load Balancer menjadi titik kontrol tunggal untuk kebijakan keamanan SSL/TLS. Anda bisa menerapkan aturan ketat di satu tempat untuk melindungi semua server di belakangnya, seperti:
*   Mewajibkan versi TLS minimum (misalnya, TLS 1.2 atau 1.3).
*   Menentukan cipher suite yang kuat dan aman.
*   Menerapkan HSTS (HTTP Strict Transport Security).

## Contoh Konfigurasi (Nginx)

Berikut adalah contoh konfigurasi Nginx yang melakukan SSL Termination dan meneruskan permintaan ke grup server backend.

```nginx
# /etc/nginx/nginx.conf

upstream backend_servers {
    server app_server_1:8080;
    server app_server_2:8080;
}

server {
    # 1. Mendengarkan di port 443 untuk koneksi HTTPS
    listen 443 ssl;
    server_name your-domain.com;

    # 2. Menentukan lokasi sertifikat dan private key
    ssl_certificate /etc/nginx/ssl/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;

    # Pengaturan keamanan SSL/TLS lainnya (opsional tapi direkomendasikan)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:...';

    location / {
        # 3. Meneruskan permintaan sebagai HTTP biasa ke server backend
        proxy_pass http://backend_servers;

        # Header penting untuk memberitahu server backend tentang protokol asli
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme; # $scheme akan bernilai "https"
    }
}
```

## Alternatif: SSL Passthrough

Alternatif dari SSL Termination adalah **SSL Passthrough**. Dalam mode ini, Load Balancer (biasanya Layer 4) menerima lalu lintas HTTPS dan meneruskannya langsung ke server backend **tanpa melakukan dekripsi**. Enkripsi terjadi secara *end-to-end* antara klien dan server aplikasi.

*   **Kapan digunakan?** Ketika ada persyaratan keamanan yang sangat ketat yang tidak memperbolehkan dekripsi di tengah jalan, atau ketika Anda tidak memerlukan fitur Layer 7.
*   **Kekurangan:** Anda kehilangan semua manfaat dari inspeksi lalu lintas, routing cerdas, dan manajemen sertifikat terpusat.

## Kesimpulan

**SSL Termination** adalah fitur fundamental dari Load Balancer modern. Ini adalah trade-off yang cerdas: Anda memindahkan batas enkripsi ke "tepi" jaringan Anda (di Load Balancer) untuk mendapatkan keuntungan besar dalam hal performa, skalabilitas, kecerdasan routing, dan kemudahan manajemen, sambil tetap menjaga keamanan di dalam jaringan internal yang terpercaya.