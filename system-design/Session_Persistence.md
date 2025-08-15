# Session Persistence (Sticky Sessions)

**Session Persistence**, yang lebih sering dikenal sebagai **Sticky Sessions**, adalah sebuah strategi konfigurasi pada **Load Balancer** yang memastikan bahwa semua permintaan dari seorang pengguna (klien) selama satu sesi akan **selalu diarahkan ke server aplikasi yang sama**.

Ini adalah fitur krusial untuk aplikasi *stateful*—aplikasi yang menyimpan data sesi sementara di sisi server.

## Masalah yang Dipecahkan: Keranjang Belanja yang Hilang

Bayangkan sebuah skenario e-commerce tanpa session persistence:

1.  Permintaan pertama Anda (melihat produk) diarahkan oleh Load Balancer ke **Server A**.
2.  Anda menambahkan produk ke keranjang belanja. Informasi keranjang belanja ini disimpan sementara di memori **Server A**.
3.  Anda menekan tombol "Checkout". Load balancer, yang tidak tahu apa-apa tentang sesi Anda, mungkin mengarahkan permintaan kedua ini ke **Server B** (karena Server B sedang lebih kosong).
4.  **Hasilnya:** Server B tidak tahu apa-apa tentang keranjang belanja Anda. Dari sudut pandang Anda, keranjang belanja Anda tiba-tiba kosong. Ini adalah pengalaman pengguna yang sangat buruk.

**Session Persistence** memecahkan masalah ini dengan "mengingat" server mana yang harus menangani permintaan Anda, seolah-olah "menempelkan" (making it sticky) sesi Anda ke satu server tertentu.

## Bagaimana Cara Kerjanya?

Ada dua metode utama yang digunakan oleh load balancer untuk mencapai ini, seperti yang disinggung dalam `Load_balancer_algorithm.md`.

### 1. IP Hash (Umumnya di Layer 4 atau Layer 7)

Ini adalah metode yang paling sederhana. Load balancer akan mengambil alamat IP klien, menghitung nilai *hash* dari IP tersebut, dan menggunakan hasilnya untuk secara konsisten memilih server tujuan.

*   **Cara Kerja:** Pengguna dengan alamat IP yang sama akan **selalu** dikirim ke server yang sama.
*   **Kelebihan:** Mudah diimplementasikan dan tidak memerlukan inspeksi konten yang mendalam.
*   **Kekurangan:** Metode ini tidak andal jika banyak pengguna berasal dari satu jaringan yang sama (misalnya, satu gedung perkantoran atau kampus yang menggunakan satu alamat IP publik). Semua pengguna tersebut akan menumpuk di satu server, menyebabkan distribusi beban menjadi tidak merata.

**Contoh Konfigurasi (Nginx):**
Seperti yang ditunjukkan di `Nginx_as_Load_Balancer.md`, Anda cukup menambahkan direktif `ip_hash`.

```nginx
upstream myapp_servers {
    ip_hash;
    server app_server_1:8080;
    server app_server_2:8080;
    server app_server_3:8080;
}

server {
    listen 80;
    location / {
        proxy_pass http://myapp_servers;
    }
}
```

### 2. Berbasis Cookie (Hanya di Layer 7)

Ini adalah metode yang lebih canggih dan andal, yang hanya bisa dilakukan oleh **Layer 7 Load Balancer** (`Layer_7_Load_Balancing.md`) karena ia bisa "membaca" konten permintaan HTTP.

*   **Cara Kerja:**
    1.  Ketika seorang pengguna pertama kali terhubung, load balancer akan memilih sebuah server (misalnya, Server B).
    2.  Load balancer kemudian menyisipkan sebuah *cookie* khusus ke dalam respons yang dikirimkan kembali ke browser pengguna. Cookie ini berisi informasi server mana yang telah dipilih (misalnya, `server_id=B`).
    3.  Untuk semua permintaan selanjutnya dari pengguna tersebut, browser akan menyertakan cookie ini.
    4.  Load balancer akan membaca cookie tersebut dan secara cerdas mengarahkan permintaan ke server yang benar (Server B), mengabaikan algoritma load balancing lainnya.

*   **Kelebihan:** Jauh lebih akurat daripada IP Hash. Tidak terpengaruh oleh masalah IP bersama. Setiap sesi pengguna unik, bahkan jika mereka berasal dari jaringan yang sama.
*   **Kekurangan:** Memerlukan load balancer yang lebih cerdas (Layer 7) yang mampu memanipulasi header HTTP.

## Perbandingan Metode

| Fitur | IP Hash | Berbasis Cookie (Layer 7) |
| :--- | :--- | :--- |
| **Lapisan OSI** | Layer 4 / Layer 7 | Layer 7 (Aplikasi) |
| **Dasar Keputusan** | Alamat IP Klien | Cookie HTTP |
| **Keandalan** | Kurang andal (masalah IP bersama) | Sangat andal |
| **Kecerdasan** | Rendah (hanya melihat IP) | Tinggi (membaca dan menyisipkan cookie) |
| **Kasus Penggunaan** | Aplikasi yang butuh *stickiness* sederhana. | Aplikasi web modern, e-commerce, portal login. |

## Kapan Session Persistence Tidak Diperlukan?

Jika aplikasi Anda dirancang untuk menjadi **stateless** (tidak menyimpan status sesi di server aplikasi), maka session persistence tidak diperlukan. Dalam arsitektur stateless, semua data sesi disimpan di sisi klien (misalnya dalam JWT atau cookie) atau dalam penyimpanan terpusat yang dapat diakses oleh semua server (seperti database atau cache terdistribusi seperti Redis).

## Kesimpulan

**Session Persistence** adalah fitur krusial untuk aplikasi *stateful*. Tanpanya, pengalaman pengguna pada fitur seperti keranjang belanja, status login, atau formulir multi-langkah akan rusak.

Untuk aplikasi web modern, metode **berbasis cookie** yang disediakan oleh Layer 7 Load Balancer hampir selalu menjadi pilihan yang lebih unggul karena keandalan dan akurasinya yang lebih tinggi. Namun, tujuan jangka panjang yang ideal adalah merancang aplikasi agar **stateless** sehingga tidak bergantung pada session persistence sama sekali, yang membuatnya lebih mudah untuk diskalakan.