# Horizontal Scaling (Skalabilitas Horizontal)

**Horizontal Scaling**, atau dikenal juga sebagai *scaling out*, adalah salah satu strategi paling fundamental dalam desain sistem untuk meningkatkan kapasitas dan keandalan. Konsepnya sederhana: daripada membuat satu server menjadi lebih kuat (*Vertical Scaling*), kita **menambah lebih banyak server** ke dalam sistem.

Ini adalah pilar utama yang memungkinkan aplikasi modern menangani jutaan pengguna secara bersamaan.

*   **Analogi Sederhana:**
    *   **Vertical Scaling (Scale Up):** Anda memiliki satu toko dengan satu kasir. Saat ramai, Anda mengganti kasir tersebut dengan "super kasir" yang bisa bekerja 3x lebih cepat.
    *   **Horizontal Scaling (Scale Out):** Anda memiliki satu toko dengan satu kasir. Saat ramai, Anda **membuka tiga kasir baru** dengan kemampuan yang sama.

## Peran Krusial Load Balancer

Horizontal Scaling tidak bisa berjalan efektif tanpa komponen kunci: **Load Balancer**. Seperti yang dijelaskan dalam `Load_Balancer.md`, Load Balancer adalah "polisi lalu lintas" yang berdiri di depan semua server Anda.

Tanpa Load Balancer, server-server tambahan Anda tidak akan menerima traffic sama sekali. Load Balancer-lah yang membuat penambahan server menjadi berguna.

## Bagaimana Cara Kerjanya?

Mari kita gunakan skenario **Flash Sale E-commerce** dari `Load_Balancer.md` untuk melihat bagaimana Horizontal Scaling bekerja dalam praktik.

**Kondisi Awal (Beban Normal):**
Sistem berjalan dengan 2 server aplikasi di belakang sebuah Load Balancer. Beban kerja terbagi rata dan semua berjalan lancar.

```text
                 +-----------------+
                 |  Load Balancer  |
                 +-----------------+
                    /           \
                   /             \
         +----------+         +----------+
         | Web Srv 1|         | Web Srv 2|
         | (Beban 50%)|         | (Beban 50%)|
         +----------+         +----------+
```

**Saat Flash Sale (Lonjakan Traffic):**
Tiba-tiba, traffic melonjak 200%. Beban di Server 1 dan 2 mendekati 100%, menyebabkan sistem melambat. Tim engineering memutuskan untuk melakukan *scale out*.

1.  **Menambah Server Baru:** Dua server baru (Server 3 dan Server 4) disiapkan dan dinyalakan.
2.  **Mendaftarkan ke Load Balancer:** Server 3 dan 4 ditambahkan ke dalam *pool* server di konfigurasi Load Balancer.
3.  **Distribusi Beban Otomatis:** Load Balancer langsung mendeteksi server-server baru ini (setelah lolos *health check*) dan mulai mendistribusikan sebagian traffic baru ke sana.

**Kondisi Setelah Scaling Out:**

```text
                 +-----------------+
                 |  Load Balancer  |
                 +-----------------+
              /      |      |      \
             /       |      |       \
      +----------+ +----------+ +----------+ +----------+
      | Web Srv 1| | Web Srv 2| | Web Srv 3| | Web Srv 4|
      | (Beban 50%)| | (Beban 50%)| | (Beban 50%)| | (Beban 50%)|
      +----------+ +----------+ +----------+ +----------+
```

**Hasil:** Kapasitas total sistem meningkat secara instan. Beban di setiap server kembali ke level yang aman, dan performa situs kembali cepat, **semua dilakukan tanpa downtime**.

Dalam konfigurasi Nginx (`Nginx_as_Load_Balancer.md`), ini semudah menambahkan baris baru di blok `upstream`:

```nginx
upstream backend_servers {
    server app_server_1:8080;
    server app_server_2:8080;
    # Menambah dua server baru saat scaling out
    server app_server_3:8080;
    server app_server_4:8080;
}
```

## Kelebihan Utama Horizontal Scaling

1.  **Skalabilitas Hampir Tanpa Batas:** Anda bisa terus menambah server seiring pertumbuhan traffic. Batasannya lebih fleksibel dibandingkan mencari satu server super kuat.
2.  **Ketersediaan Tinggi (High Availability):** Pola ini secara inheren menciptakan redundansi. Jika satu dari empat server gagal, Load Balancer akan berhenti mengirim traffic ke sana dan tiga server lainnya akan tetap melayani pengguna. Ini adalah implementasi dari pola **Active-Active Failover** yang dijelaskan di `Availability_Patterns.md`.
3.  **Fleksibilitas dan Efisiensi Biaya:** Anda bisa menggunakan server komoditas yang lebih murah dalam jumlah banyak. Anda juga bisa menerapkan *auto-scaling*, di mana server ditambahkan atau dikurangi secara otomatis berdasarkan beban traffic, sehingga Anda hanya membayar sumber daya yang benar-benar digunakan.
4.  **Peningkatan Tanpa Downtime:** Penambahan atau pengurangan server dapat dilakukan secara *live* tanpa mengganggu layanan yang sedang berjalan.

## Horizontal vs. Vertical Scaling

| Fitur | Horizontal Scaling (Scale Out) | Vertical Scaling (Scale Up) |
| :--- | :--- | :--- |
| **Cara** | Menambah jumlah server | Menambah sumber daya (CPU, RAM) di server yang ada |
| **Load Balancer** | Wajib digunakan | Tidak diperlukan |
| **Batas Skala** | Sangat tinggi, hampir tak terbatas | Terbatas oleh kapasitas hardware maksimum |
| **Ketersediaan** | Tinggi (tidak ada Single Point of Failure) | Rendah (jika satu server mati, sistem mati) |
| **Biaya** | Biasanya lebih efisien dalam jangka panjang | Bisa menjadi sangat mahal untuk hardware kelas atas |
| **Fleksibilitas** | Tinggi, bisa menambah/mengurangi server sesuai kebutuhan | Rendah, upgrade seringkali butuh downtime |

## Kesimpulan

**Horizontal Scaling**, yang diaktifkan oleh **Load Balancer**, adalah strategi fundamental untuk membangun sistem yang modern, tangguh, dan skalabel. Ia tidak hanya memungkinkan sistem untuk menangani beban yang besar, tetapi juga secara langsung meningkatkan ketersediaannya dengan menghilangkan *single point of failure*. Dalam arsitektur cloud-native dan microservices, ini adalah pendekatan standar untuk mencapai skalabilitas dan keandalan.