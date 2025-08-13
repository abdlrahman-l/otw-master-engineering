# Layer 7 Load Balancing dalam Desain Sistem

**Layer 7 Load Balancing** adalah jenis load balancing yang paling cerdas dan fleksibel. Nama "Layer 7" mengacu pada **Lapisan Aplikasi (Application Layer)** dalam model OSI, lapisan di mana protokol seperti HTTP, HTTPS, dan WebSocket beroperasi.

Berbeda dengan load balancer yang lebih sederhana (seperti Layer 4), yang hanya bisa melihat informasi jaringan seperti alamat IP dan port, Layer 7 Load Balancer dapat "melihat" dan memahami isi dari permintaan itu sendiri.

*   **Analogi Sederhana:**
    *   **Layer 4 Load Balancer** adalah seperti petugas pos yang hanya melihat alamat jalan dan nomor rumah (IP dan Port) untuk mengantarkan surat. Ia tidak tahu dan tidak peduli siapa penerima surat di dalam rumah itu.
    *   **Layer 7 Load Balancer** adalah seperti resepsionis di sebuah gedung perkantoran besar. Ia tidak hanya tahu alamat gedung, tetapi ia juga bisa membaca "tujuan" surat tersebut (misalnya, "Untuk Departemen Keuangan" atau "Untuk Departemen HRD") dan mengarahkannya ke ruangan yang tepat.

## Bagaimana Cara Kerjanya? (Routing Cerdas)

Karena bisa "membaca" konten permintaan HTTP, Layer 7 Load Balancer dapat membuat keputusan routing yang jauh lebih canggih berdasarkan:

1.  **URL Path:** Ini adalah penggunaan paling umum, seperti yang dijelaskan dalam `Reverse_Proxy.md` saat berfungsi sebagai **API Gateway**.
    *   Permintaan ke `domain.com/video/` bisa diarahkan ke server yang dioptimalkan untuk streaming video.
    *   Permintaan ke `domain.com/api/` bisa diarahkan ke pool server microservices.
    *   Permintaan ke `domain.com/images/` bisa diarahkan ke server file statis atau CDN.

2.  **HTTP Headers:** Load balancer bisa membaca header seperti `User-Agent`, `Accept-Language`, atau header kustom.
    *   Mengarahkan pengguna mobile (`User-Agent` mengandung "Android" atau "iPhone") ke versi situs yang ringan.
    *   Mengarahkan pengguna berdasarkan bahasa (`Accept-Language: id-ID`) ke server dengan konten berbahasa Indonesia.

3.  **Cookies:** Ini memungkinkan implementasi *session persistence* atau "sticky sessions" yang lebih canggih daripada metode `ip_hash`. Load balancer bisa membaca cookie sesi dan memastikan pengguna yang sama selalu terhubung ke server yang sama tempat sesi mereka aktif.

4.  **Host Header:** Memungkinkan satu load balancer untuk melayani beberapa domain atau subdomain dan mengarahkannya ke grup server yang berbeda.
    *   `api.toko.com` -> diarahkan ke server API.
    *   `www.toko.com` -> diarahkan ke server web frontend.

## Contoh Konfigurasi (Nginx)

Konfigurasi Nginx dari `Nginx_as_Load_Balancer.md` adalah contoh sempurna dari Layer 7 Load Balancing. Mari kita kembangkan contoh tersebut untuk menunjukkan routing berbasis path:

```nginx
# Mendefinisikan grup-grup server (backend pools)
upstream frontend_servers {
    server web_server_1:80;
    server web_server_2:80;
}

upstream api_servers {
    # Menggunakan algoritma Least Connections untuk API
    least_conn;
    server api_server_1:3000;
    server api_server_2:3000;
}

upstream static_file_servers {
    server static_server_1:8080;
}

server {
    listen 80;
    server_name your-domain.com;

    # Aturan routing Layer 7
    # 1. Jika path dimulai dengan /api/
    location /api/ {
        proxy_pass http://api_servers;
        # Header penting untuk meneruskan info klien asli
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 2. Jika path dimulai dengan /static/
    location /static/ {
        proxy_pass http://static_file_servers;
        proxy_set_header Host $host;
    }

    # 3. Untuk semua permintaan lainnya (default)
    location / {
        proxy_pass http://frontend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Manfaat Utama Layer 7 Load Balancing

1.  **Routing Konten yang Fleksibel:** Kemampuan untuk mengarahkan traffic berdasarkan konten adalah keunggulan utamanya, yang sangat penting untuk arsitektur microservices.
2.  **Efisiensi Infrastruktur:** Karena cerdas, ia bisa melakukan lebih dari sekadar routing. Seperti yang disebutkan di `Reverse_Proxy.md`, ia bisa melakukan:
    *   **SSL/TLS Termination:** Membebaskan server aplikasi dari beban enkripsi.
    *   **Caching:** Menyimpan konten statis untuk mengurangi beban server backend.
    *   **Kompresi:** Mengompres respons untuk mempercepat pengiriman ke klien.
3.  **Peningkatan Keamanan:** Dengan menyembunyikan arsitektur internal dan menjadi satu-satunya titik masuk, Anda dapat menerapkan Web Application Firewall (WAF) atau rate limiting di level load balancer untuk melindungi semua layanan di belakangnya.
4.  **Penyederhanaan Deployment:** Memungkinkan strategi deployment seperti *Blue-Green Deployment* atau *Canary Releases* dengan mengarahkan sebagian kecil traffic ke versi aplikasi yang baru.

## Kesimpulan

Dalam desain sistem modern, **Layer 7 Load Balancing adalah standar de-facto**. Ia bukan lagi sekadar "pembagi beban" (seperti yang dijelaskan di `Load_Balancer.md`), melainkan komponen strategis yang bertindak sebagai **Reverse Proxy**, **API Gateway**, dan **pengontrol lalu lintas cerdas**. Menggunakan perangkat lunak seperti Nginx, HAProxy, atau layanan cloud (AWS Application Load Balancer, Google Cloud Load Balancing) untuk L7 Load Balancing adalah praktik fundamental untuk membangun sistem yang skalabel, tangguh, dan efisien.