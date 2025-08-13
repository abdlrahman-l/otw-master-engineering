je# Domain Name System (DNS) dalam Desain Sistem

**Domain Name System (DNS)** sering disebut sebagai "buku telepon internet", tetapi dalam konteks desain sistem, perannya jauh lebih strategis daripada sekadar penerjemah nama domain ke alamat IP. DNS adalah lapisan fundamental yang memengaruhi ketersediaan, performa, dan skalabilitas sebuah sistem.

## Apa itu DNS dan Mengapa Penting?

Secara sederhana, DNS adalah sistem terdistribusi global yang menerjemahkan nama domain yang mudah diingat manusia (seperti `google.com`) menjadi alamat IP numerik yang dipahami oleh komputer (seperti `142.250.199.14`).

Dalam alur permintaan pengguna, DNS adalah **langkah paling pertama**. Sebelum browser bisa terhubung ke server Anda, ia harus bertanya pada DNS di mana server itu berada. Jika DNS gagal atau lambat, seluruh sistem Anda, meskipun sehat, tidak akan bisa diakses.

## Bagaimana Proses DNS Bekerja?

Ketika Anda mengetik `www.tokopedia.com` di browser:

1.  **Cache Check:** Browser dan sistem operasi Anda akan memeriksa cache lokal mereka terlebih dahulu. Jika Anda baru saja mengunjungi situs tersebut, alamat IP-nya mungkin masih tersimpan.
2.  **Recursive Resolver:** Jika tidak ada di cache, permintaan akan diteruskan ke *Recursive Resolver* (biasanya disediakan oleh ISP Anda atau layanan publik seperti `8.8.8.8` milik Google).
3.  **The Journey:** Resolver ini akan memulai perjalanan untuk mencari jawaban:
    *   Ia bertanya ke **Root Server**: "Di mana saya bisa menemukan info untuk domain `.com`?"
    *   Root Server menjawab: "Tanya ke **TLD (Top-Level Domain) Server** untuk `.com` di alamat ini."
    *   Resolver bertanya ke TLD Server: "Di mana saya bisa menemukan info untuk `tokopedia.com`?"
    *   TLD Server menjawab: "Info untuk domain itu dipegang oleh **Authoritative Name Server** milik Tokopedia. Ini alamatnya."
    *   Resolver bertanya ke Authoritative Name Server Tokopedia: "Berapa alamat IP untuk `www.tokopedia.com`?"
    *   Authoritative Name Server memberikan jawaban akhir: "Alamatnya adalah `103.24.93.123`."
4.  **Response & Caching:** Resolver memberikan alamat IP ini ke browser Anda dan menyimpannya di cache untuk sementara waktu (sesuai nilai **TTL - Time To Live**) agar tidak perlu mengulang proses ini untuk permintaan berikutnya.

```text
+----------+   (1) "www.example.com?"   +--------------------+   (2) Tanya Root   +-------------+
|          | -------------------------> |                    | -----------------> |             |
|  Browser |                            | Recursive Resolver |                    | Root Server |
|          | <------------------------- |      (e.g., ISP)   | <----------------- |             |
+----------+   (6) "IP is 93.184.216.34" |                    |   (3) Tanya TLD    +-------------+
             +--------------------+                    |
                           ^  |                        |
                           |  | (5) Jawaban            | (4) Tanya Authoritative
                           |  v                        v
                   +------------------+      +-------------------------+
                   | TLD Server (.com)|      | Authoritative Name Server|
                   +------------------+      |     (milik example.com)  |
                                             +-------------------------+
```

## Peran Strategis DNS dalam Desain Sistem

Di sinilah DNS menjadi alat yang sangat kuat, bukan sekadar buku telepon.

### 1. Load Balancing (DNS Round Robin)

Ini adalah bentuk load balancing yang paling dasar. Anda bisa mengonfigurasi beberapa A Record untuk nama domain yang sama.

*   `api.myapp.com` -> `1.1.1.1` (Server 1)
*   `api.myapp.com` -> `1.1.1.2` (Server 2)
*   `api.myapp.com` -> `1.1.1.3` (Server 3)

Ketika klien meminta alamat `api.myapp.com`, DNS server akan memberikan alamat IP secara bergiliran.
*   **Kelebihan:** Sangat sederhana dan tidak memerlukan hardware tambahan.
*   **Kekurangan:**
    *   **Tidak ada Health Check:** DNS tidak tahu jika Server 2 sedang mati. Ia akan tetap mengirim sebagian pengguna ke server yang mati tersebut.
    *   **Masalah Caching:** Karena klien/resolver melakukan cache, distribusi beban bisa tidak merata.

### 2. Failover dan Geo-Redundancy

Ini adalah penggunaan DNS yang lebih canggih dan sangat penting untuk ketersediaan tinggi, seperti yang dijelaskan dalam `Availability_Patterns.md`.

*   **Cara Kerja:** Layanan DNS canggih (seperti Amazon Route 53 atau Cloudflare DNS) dapat dikonfigurasi dengan aturan failover. Mereka akan terus melakukan **Health Check** ke alamat IP utama Anda.
*   **Skenario Failover:**
    1.  Anda memiliki server utama di Jakarta (`1.1.1.1`) dan server cadangan di Singapura (`2.2.2.2`).
    2.  DNS dikonfigurasi untuk selalu mengarahkan `www.myapp.com` ke `1.1.1.1`.
    3.  Layanan DNS mendeteksi bahwa server di Jakarta tidak merespons (gagal health check).
    4.  DNS secara **otomatis** mengubah A Record untuk `www.myapp.com` agar menunjuk ke server cadangan di Singapura (`2.2.2.2`).
    5.  Lalu lintas pengguna dialihkan ke server cadangan, mengimplementasikan pola **Failover** pada level infrastruktur global.

### 3. Geo-Routing (Latency-Based Routing)

Untuk sistem skala global, Anda ingin pengguna dilayani oleh data center terdekat untuk mengurangi latensi.

*   **Cara Kerja:** Layanan DNS mendeteksi lokasi geografis pengguna (berdasarkan alamat IP resolver mereka).
*   **Contoh:**
    *   Jika permintaan datang dari Indonesia, DNS akan mengembalikan IP data center Singapura.
    *   Jika permintaan datang dari Eropa, DNS akan mengembalikan IP data center Frankfurt.
    *   Jika permintaan datang dari Amerika, DNS akan mengembalikan IP data center Virginia.

Ini adalah cara kerja **CDN (Content Delivery Network)** dan aplikasi global untuk memastikan performa yang cepat di seluruh dunia.

## Jenis-Jenis DNS Record yang Penting

*   **A Record:** `nama.domain` -> `Alamat IPv4`. Paling umum. Digunakan untuk memetakan domain ke server web Anda.
*   **AAAA Record:** `nama.domain` -> `Alamat IPv6`. Versi modern dari A Record untuk mendukung jaringan IPv6.
*   **CNAME (Canonical Name):** `alias.domain` -> `nama.domain.asli`. Sangat berguna untuk mengabstraksikan nama layanan. Misalnya, `api.myapp.com` (CNAME) bisa menunjuk ke nama host yang rumit dari cloud provider seperti `elb-12345.ap-southeast-1.amazonaws.com`. Jika alamat load balancer berubah, Anda hanya perlu mengubah satu CNAME record.
*   **MX (Mail Exchange):** Menentukan server mana yang bertanggung jawab untuk menerima email untuk domain Anda (misalnya, mengarahkan email ke server Google Workspace atau Microsoft 365).
*   **TXT (Text):** Memungkinkan Anda menyimpan teks arbitrer. Sering digunakan untuk verifikasi kepemilikan domain (misalnya, untuk Google Search Console) atau konfigurasi keamanan email (SPF, DKIM).

## Kesimpulan

Dalam desain sistem, DNS bukanlah komponen pasif. Ia adalah lapisan kontrol aktif yang bisa Anda manfaatkan untuk:
*   **Meningkatkan Ketersediaan:** Melalui mekanisme failover otomatis.
*   **Meningkatkan Performa:** Dengan mengarahkan pengguna ke server terdekat (Geo-Routing).
*   **Menyederhanakan Infrastruktur:** Dengan menggunakan CNAME untuk mengabstraksikan nama-nama layanan.

Mengabaikan strategi DNS sama dengan membangun gedung pencakar langit di atas fondasi yang rapuh. Memahaminya dengan baik adalah kunci untuk merancang sistem yang tangguh, skalabel, dan berperforma tinggi.