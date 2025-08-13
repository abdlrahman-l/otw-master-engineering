# Reverse Proxy dalam Desain Sistem

**Reverse Proxy** adalah sebuah server yang bertindak sebagai perantara antara klien (pengguna di internet) dan satu atau lebih server di belakangnya (server aplikasi, database, dll.). Konsep ini sangat berkaitan erat dengan **Load Balancer**, bahkan seringkali diimplementasikan oleh perangkat lunak yang sama.

Bayangkan sebuah gedung perkantoran besar. Anda sebagai pengunjung (klien) tidak langsung pergi ke setiap ruangan kantor. Anda datang ke **resepsionis (Reverse Proxy)**. Anda memberitahu resepsionis tujuan Anda, dan resepsionis akan mengarahkan Anda ke ruangan yang tepat. Anda tidak perlu tahu di lantai berapa atau di ruangan nomor berapa kantor tujuan Anda berada. Resepsionis menyembunyikan semua detail internal itu dari Anda.

Dalam dunia digital:
*   Klien mengirim permintaan ke alamat Reverse Proxy.
*   Reverse Proxy menerima permintaan tersebut dan meneruskannya (*forwards*) ke salah satu server backend yang sesuai.
*   Server backend memproses permintaan dan mengirimkan respons kembali ke Reverse Proxy.
*   Reverse Proxy mengirimkan respons tersebut kembali ke klien.

Dari sudut pandang klien, mereka hanya berkomunikasi dengan satu entitas: Reverse Proxy. Mereka tidak pernah tahu dan tidak perlu tahu arsitektur di belakangnya.

```text
+----------+      +----------------+      +--------------------+
|          |      |                |----->| App Server 1       |
|  Klien   |----->|  Reverse Proxy |      +--------------------+
|          |      |                |
+----------+      +----------------+      +--------------------+
                  |                |----->| API Service (Server 2) |
                  +----------------+      +--------------------+
                  |                |
                  |                |----->| Static File Server |
                  +----------------+      +--------------------+
```

## Apa Bedanya dengan Load Balancer?

Ini adalah poin penting: **Load Balancing adalah salah satu fungsi utama dari Reverse Proxy.**

*   Sebuah **Reverse Proxy** adalah konsep arsitektur yang lebih umum: sebuah perantara yang menerima permintaan atas nama server lain.
*   Sebuah **Load Balancer** adalah implementasi spesifik dari Reverse Proxy yang fokus utamanya adalah mendistribusikan permintaan ke *beberapa* server yang identik untuk meningkatkan skalabilitas dan ketersediaan, seperti yang dijelaskan dalam `Load_Balancer.md`.

Jadi, bisa dikatakan **semua Load Balancer adalah Reverse Proxy, tetapi tidak semua Reverse Proxy digunakan sebagai Load Balancer.**

## Fungsi dan Manfaat Utama Reverse Proxy

Selain Load Balancing, Reverse Proxy memiliki banyak peran strategis lainnya, yang membuatnya menjadi komponen fundamental dalam desain sistem modern.

1.  **Peningkatan Keamanan (Security)**
    *   **Menyembunyikan Infrastruktur:** Karena klien hanya berinteraksi dengan Reverse Proxy, alamat IP dan detail teknis dari server backend Anda tetap tersembunyi dari internet. Ini mengurangi permukaan serangan (*attack surface*).
    *   **Titik Kontrol Terpusat:** Anda dapat menerapkan keamanan di satu tempat. Misalnya, memasang Web Application Firewall (WAF) atau sistem mitigasi serangan DDoS di Reverse Proxy untuk melindungi semua server di belakangnya.

2.  **SSL/TLS Termination**
    *   Seperti yang disebutkan dalam `Nginx_as_Load_Balancer.md`, proses enkripsi dan dekripsi SSL/TLS (HTTPS) memakan sumber daya komputasi.
    *   Reverse Proxy dapat mengambil alih tugas ini. Komunikasi antara klien dan Reverse Proxy dienkripsi (HTTPS), tetapi komunikasi antara Reverse Proxy dan server backend di jaringan internal yang aman bisa menggunakan HTTP biasa. Ini membebaskan server aplikasi dari beban enkripsi.

3.  **Caching**
    *   Reverse Proxy dapat menyimpan salinan (cache) dari respons yang sering diminta, terutama untuk konten statis (gambar, CSS, JavaScript).
    *   Ketika permintaan yang sama datang lagi, Reverse Proxy bisa langsung memberikan respons dari cache tanpa perlu mengganggu server aplikasi. Ini sangat mempercepat waktu respons dan mengurangi beban server, mirip dengan cara kerja **CDN** dalam skala yang lebih kecil.

4.  **Kompresi (Compression)**
    *   Reverse Proxy dapat mengompresi respons (misalnya dengan Gzip) sebelum mengirimkannya ke klien. Ini mengurangi ukuran data yang ditransfer, menghemat bandwidth, dan mempercepat waktu muat halaman bagi pengguna dengan koneksi lambat.

5.  **Routing dan API Gateway**
    *   Dalam arsitektur microservices, Reverse Proxy bisa bertindak sebagai **API Gateway**. Ia dapat mengarahkan permintaan ke layanan yang berbeda berdasarkan path URL.
        *   `domain.com/api/users/` -> diteruskan ke layanan User.
        *   `domain.com/api/orders/` -> diteruskan ke layanan Order.
        *   `domain.com/` -> diteruskan ke layanan Frontend.

## Perbedaan dengan Forward Proxy

Penting untuk tidak bingung antara Reverse Proxy dan Forward Proxy.

*   **Forward Proxy:** Digunakan oleh **klien** untuk mengakses internet. Ia duduk di jaringan klien (misalnya, di kantor atau sekolah) untuk menyaring atau menyembunyikan identitas klien.
*   **Reverse Proxy:** Digunakan oleh **server** untuk menerima permintaan dari internet. Ia duduk di jaringan server untuk melindungi, mengelola, dan mendistribusikan permintaan ke server.

## Kesimpulan

Dalam desain sistem, **Reverse Proxy** adalah komponen multifungsi yang sangat kuat. Ia bukan hanya "pembagi beban", tetapi juga penjaga gerbang, akselerator, dan manajer lalu lintas untuk seluruh arsitektur Anda. Menggunakan Reverse Proxy (seperti Nginx, HAProxy, atau layanan cloud seperti AWS Application Load Balancer) adalah praktik standar untuk membangun sistem yang aman, skalabel, dan berkinerja tinggi.