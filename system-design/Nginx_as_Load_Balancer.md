# Nginx sebagai Load Balancer

**Nginx** adalah salah satu perangkat lunak yang paling populer dan kuat untuk diimplementasikan sebagai **Load Balancer**. Meskipun Nginx dikenal sebagai web server, salah satu fungsi utamanya dalam arsitektur modern adalah sebagai *reverse proxy* dan *load balancer*. Ia adalah implementasi konkret dari konsep yang dijelaskan dalam dokumen `Load_Balancer.md`.

## Bagaimana Nginx Bekerja sebagai Load Balancer?

Nginx berdiri di depan server-server aplikasi Anda (yang disebut *upstream servers*). Semua permintaan dari pengguna masuk ke Nginx terlebih dahulu. Kemudian, Nginx, berdasarkan konfigurasinya, akan memutuskan ke server mana permintaan tersebut akan diteruskan.

Ini adalah contoh konfigurasi Nginx yang sangat umum untuk load balancing:

```nginx
# /etc/nginx/nginx.conf

# 1. Mendefinisikan grup server (backend pool)
# Blok 'upstream' ini mendefinisikan sekelompok server yang akan menerima traffic.
# Kita beri nama grup ini 'backend_servers'.
upstream backend_servers {
    # Algoritma default adalah Round Robin
    server app_server_1:8080;
    server app_server_2:8080;
    server app_server_3:8080;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        # 2. Meneruskan permintaan ke grup server
        # Semua permintaan yang masuk ke '/' akan diteruskan
        # ke salah satu server di dalam grup 'backend_servers'.
        proxy_pass http://backend_servers;

        # Header tambahan untuk memberikan informasi asli ke server backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Dari konfigurasi di atas, ada dua bagian penting:
1.  **Blok `upstream`**: Di sinilah Anda mendaftarkan semua server aplikasi yang siap menerima beban. Nginx akan mendistribusikan permintaan ke server-server yang terdaftar di sini.
2.  **Direktif `proxy_pass`**: Perintah ini memberitahu Nginx untuk meneruskan permintaan ke grup `upstream` yang telah didefinisikan.

## Algoritma Distribusi di Nginx

Nginx mendukung beberapa algoritma distribusi yang sama seperti yang dijelaskan dalam `Load_Balancer.md`, memberikan fleksibilitas untuk berbagai kasus penggunaan.

### 1. Round Robin (Default)
Jika Anda tidak menentukan algoritma apa pun, Nginx akan menggunakan Round Robin. Permintaan akan dikirim ke setiap server secara bergiliran. Ini sederhana dan seringkali cukup efektif.
```nginx
upstream backend_servers {
    server server1.example.com;
    server server2.example.com;
}
```

### 2. Least Connections (`least_conn`)
Nginx akan mengirim permintaan ke server yang memiliki jumlah koneksi aktif paling sedikit. Ini sangat berguna jika beberapa permintaan membutuhkan waktu lebih lama untuk diproses daripada yang lain, karena ini membantu menyeimbangkan beban kerja aktual, bukan hanya jumlah permintaan.
```nginx
upstream backend_servers {
    least_conn;
    server server1.example.com;
    server server2.example.com;
}
```

### 3. IP Hash (`ip_hash`)
Nginx akan memastikan bahwa permintaan dari alamat IP klien yang sama akan selalu dikirim ke server yang sama. Ini sangat berguna untuk *session persistence* atau "sticky sessions", di mana data sesi pengguna disimpan di server aplikasi itu sendiri.
```nginx
upstream backend_servers {
    ip_hash;
    server server1.example.com;
    server server2.example.com;
}
```

## Health Checks di Nginx

Ini adalah fitur krusial untuk mencapai **High Availability**. Nginx secara otomatis melakukan *passive health checks*.

*   **Cara Kerja**: Jika Nginx mencoba mengirim permintaan ke sebuah server dan gagal (misalnya, karena server mati atau tidak merespons), Nginx akan menandai server tersebut sebagai "gagal" untuk sementara waktu dan berhenti mengirimkan traffic ke sana.
*   **Konfigurasi**: Anda bisa mengontrol perilaku ini dengan parameter `max_fails` dan `fail_timeout`.
```nginx
upstream backend_servers {
    # Jika server gagal merespons 3 kali dalam 60 detik,
    # anggap server itu mati selama 60 detik ke depan.
    server 127.0.0.1:8081 max_fails=3 fail_timeout=60s;
    server 127.0.0.1:8082;
}
```

Mekanisme ini secara langsung mengimplementasikan pola **Failover** yang dijelaskan dalam `Availability_Patterns.md`. Ketika Server 1 gagal, Nginx secara otomatis mengalihkan semua traffic ke Server 2, memastikan sistem tetap tersedia.

## Fitur Tambahan yang Kuat

Saat bertindak sebagai load balancer, Nginx juga sering digunakan untuk:

*   **SSL Termination:** Nginx menangani enkripsi dan dekripsi SSL/TLS. Ini berarti server aplikasi di belakangnya tidak perlu dibebani dengan tugas komputasi yang berat ini. Mereka bisa berkomunikasi melalui HTTP biasa di dalam jaringan internal yang aman.
*   **Caching:** Nginx dapat menyimpan cache respons dari server backend. Untuk permintaan yang sama, Nginx bisa langsung menyajikan respons dari cache tanpa perlu mengganggu server aplikasi, mirip dengan cara kerja **CDN** pada skala yang lebih kecil.
*   **Serving Static Files:** Nginx sangat efisien dalam menyajikan file statis (gambar, CSS, JS). Anda bisa mengonfigurasinya untuk menangani file-file ini secara langsung, dan hanya meneruskan permintaan dinamis ke server aplikasi.

## Kesimpulan: Nginx dalam Desain Sistem

Menggunakan Nginx sebagai load balancer adalah pilihan yang sangat baik karena:

*   **Performa Tinggi**: Nginx dirancang untuk menangani ribuan koneksi secara bersamaan dengan penggunaan sumber daya yang minimal.
*   **Fleksibilitas**: Selain load balancing, ia bisa berfungsi sebagai web server, SSL termination, dan caching, mengurangi beban dari server aplikasi.
*   **Hemat Biaya**: Versi open-source-nya sangat kuat dan gratis.
*   **Kematangan**: Nginx sudah teruji dalam pertempuran (*battle-tested*) dan digunakan oleh banyak situs web terbesar di dunia.

Dalam arsitektur yang tangguh, Nginx adalah komponen fundamental yang memungkinkan **skalabilitas horizontal**, **ketersediaan tinggi**, dan **failover otomatis**, yang merupakan pilar utama dalam membangun sistem yang andal.