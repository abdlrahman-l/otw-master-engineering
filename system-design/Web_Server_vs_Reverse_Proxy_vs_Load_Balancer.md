# Perbedaan: Web Server, Reverse Proxy, dan Load Balancer

Ini adalah pertanyaan yang sangat bagus karena ketiga konsep ini saling tumpang tindih, dan seringkali satu perangkat lunak (seperti Nginx) bisa melakukan ketiga peran tersebut.

**Analogi Sederhana:**
*   **Web Server:** "Koki" yang memasak dan menyajikan halaman web.
*   **Reverse Proxy:** "Resepsionis" yang menerima semua tamu dan mengarahkan mereka ke ruangan yang tepat.
*   **Load Balancer:** "Manajer Antrean" yang merupakan jenis resepsionis khusus, yang tugasnya membagi tamu ke banyak koki yang identik agar tidak ada yang terlalu sibuk.

Mari kita bahas lebih dalam.

---

### 1. Web Server

*   **Tugas Utama:** Menyajikan konten (seperti file HTML, CSS, gambar) atau menjalankan logika aplikasi sebagai respons atas permintaan HTTP dari klien (browser). Ia adalah tujuan akhir dari sebuah permintaan.
*   **Cara Kerja:** Ia mendengarkan permintaan yang masuk di port tertentu (misalnya, port 80 untuk HTTP). Ketika permintaan datang untuk sebuah file, ia akan mengambil file tersebut dari disk dan mengirimkannya kembali ke klien.
*   **Analogi:** Sebuah restoran kecil dengan satu koki. Pelanggan datang langsung ke restoran itu dan memesan makanan. Koki memasak dan menyajikannya.
*   **Contoh Perangkat Lunak:** Apache HTTP Server, Microsoft IIS, atau Nginx saat dikonfigurasi untuk menyajikan file statis secara langsung.

---

### 2. Reverse Proxy

*   **Tugas Utama:** Bertindak sebagai perantara yang berdiri di depan satu atau lebih web server. Semua permintaan dari internet masuk ke Reverse Proxy terlebih dahulu, yang kemudian meneruskannya ke server yang sesuai di belakangnya.
*   **Mengapa ini berguna?** Seperti yang dijelaskan dalam `Reverse_Proxy.md`, ia memiliki banyak fungsi strategis:
    *   **Keamanan:** Menyembunyikan alamat IP dan detail server asli Anda.
    *   **SSL/TLS Termination:** Menangani enkripsi HTTPS sehingga server aplikasi tidak perlu terbebani.
    *   **Caching:** Menyimpan konten yang sering diakses untuk mempercepat respons.
    *   **Routing Cerdas:** Mengarahkan permintaan berdasarkan URL. Misalnya, `domain.com/api/` ke server A dan `domain.com/images/` ke server B.
*   **Analogi:** Resepsionis di sebuah gedung perkantoran besar. Anda sebagai pengunjung tidak langsung pergi ke setiap ruangan. Anda memberitahu resepsionis tujuan Anda, dan resepsionis akan mengarahkan Anda. Anda tidak perlu tahu di lantai berapa atau ruangan nomor berapa kantor tujuan Anda.
*   **Contoh Perangkat Lunak:** Nginx, HAProxy, atau layanan cloud seperti AWS Application Load Balancer.

---

### 3. Load Balancer

*   **Tugas Utama:** Ini adalah **jenis khusus dari Reverse Proxy** yang fokus utamanya adalah mendistribusikan lalu lintas ke **beberapa server yang identik** untuk meningkatkan skalabilitas dan ketersediaan.
*   **Cara Kerja:** Seperti yang dijelaskan di `Load_Balancer.md`, ia melakukan dua hal penting:
    1.  **Distribusi Beban:** Menggunakan algoritma (seperti Round Robin atau Least Connections) untuk membagi permintaan secara merata.
    2.  **Health Checks:** Secara aktif memeriksa kesehatan setiap server. Jika satu server mati, ia akan berhenti mengirimkan lalu lintas ke sana (failover otomatis).
*   **Analogi:** Resepsionis (Reverse Proxy) yang sama, tetapi sekarang ia melihat ada antrean panjang untuk "Departemen Penjualan". Untuk mengatasi ini, ia membuka tiga loket "Departemen Penjualan" yang identik dan mengarahkan setiap pengunjung baru ke loket yang paling sepi. Dalam peran ini, resepsionis bertindak sebagai Load Balancer.
*   **Contoh Perangkat Lunak:** Nginx, HAProxy, F5 BIG-IP, atau layanan cloud seperti AWS Elastic Load Balancing (ELB).

---

## Hubungan dan Perbedaan Kunci

Poin terpenting, seperti yang disebutkan dalam `Reverse_Proxy.md`, adalah:

> **Semua Load Balancer adalah Reverse Proxy, tetapi tidak semua Reverse Proxy digunakan sebagai Load Balancer.**

Sebuah Reverse Proxy bisa saja hanya berdiri di depan *satu* server untuk tujuan caching atau keamanan. Saat ia mulai mendistribusikan beban ke *beberapa* server untuk tujuan ketersediaan dan skalabilitas, barulah ia berperan sebagai Load Balancer.

### Tabel Perbandingan

| Fitur | Web Server | Reverse Proxy | Load Balancer |
| :--- | :--- | :--- | :--- |
| **Tujuan Utama** | Menyajikan konten/aplikasi. | Perantara untuk keamanan, caching, routing. | Distribusi beban & ketersediaan tinggi. |
| **Jumlah Server di Belakang** | 0 (dia adalah servernya). | 1 atau lebih (bisa berbeda-beda). | 2 atau lebih (biasanya identik). |
| **Fungsi Kunci** | Menjalankan kode, menyajikan file. | SSL Termination, Caching, Menyembunyikan IP. | Health Checks, Algoritma Distribusi. |
| **Contoh Logika** | "Saya akan berikan file `index.html`." | "Permintaan untuk `/api` akan saya teruskan ke server API." | "Permintaan ini akan saya berikan ke server yang paling sedikit bebannya." |

### Contoh Konkret dengan Nginx

Perangkat lunak Nginx dapat memainkan ketiga peran tersebut:

1.  **Sebagai Web Server:**
    ```nginx
    server {
        listen 80;
        # Langsung menyajikan file dari direktori ini
        root /var/www/html;
        index index.html;
    }
    ```

2.  **Sebagai Reverse Proxy (ke satu server):**
    ```nginx
    server {
        listen 80;
        location / {
            # Meneruskan semua permintaan ke satu server aplikasi
            proxy_pass http://app_server_backend:8080;
        }
    }
    ```

3.  **Sebagai Load Balancer (ke banyak server):**
    ```nginx
    # Mendefinisikan grup server untuk load balancing
    upstream my_app {
        server app_server_1:8080;
        server app_server_2:8080;
    }

    server {
        listen 80;
        location / {
            # Meneruskan dan membagi beban ke grup server
            proxy_pass http://my_app;
        }
    }
    ```

## Kesimpulan

Dalam arsitektur modern, Anda hampir selalu melihat ketiganya bekerja sama. Permintaan dari internet akan diterima oleh **Load Balancer** (yang juga bertindak sebagai **Reverse Proxy**), yang kemudian meneruskannya ke salah satu dari banyak **Web Server** atau server aplikasi yang berjalan di belakangnya.