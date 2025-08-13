# Load Balancer

**Load Balancer** adalah komponen krusial dalam arsitektur sistem modern. Anggap saja ia sebagai "polisi lalu lintas" atau "manajer antrean" untuk server Anda. Ia berdiri di antara pengguna (klien) dan sekelompok server (backend pool), dan tugas utamanya adalah mendistribusikan permintaan (traffic) yang masuk secara cerdas dan efisien ke server-server tersebut.

## Mengapa Load Balancer Sangat Penting?

Tujuan utama penggunaan Load Balancer adalah untuk mencapai tiga hal:

1.  **Meningkatkan Ketersediaan (High Availability):** Ini adalah peran paling vital. Dengan memiliki beberapa server, Anda menghilangkan *Single Point of Failure*. Jika satu server mengalami masalah atau mati, Load Balancer akan mendeteksinya (melalui **Health Check**) dan secara otomatis berhenti mengirimkan traffic ke server tersebut. Semua permintaan akan dialihkan ke server lain yang sehat. Ini adalah implementasi praktis dari pola **Active-Active Failover** yang dijelaskan dalam `Availability_Patterns.md`.

2.  **Meningkatkan Skalabilitas (Scalability):** Ketika traffic ke aplikasi Anda meningkat, Anda tidak bisa hanya meng-upgrade satu server (vertical scaling) selamanya. Load Balancer memungkinkan Anda untuk dengan mudah menambah lebih banyak server di belakangnya (horizontal scaling). Pengguna tetap mengakses satu alamat, tetapi beban kerja dibagi ke lebih banyak mesin, memungkinkan sistem Anda melayani lebih banyak pengguna.

3.  **Meningkatkan Performa dan Keandalan:** Dengan membagi beban kerja, tidak ada satu server pun yang kewalahan. Ini memastikan waktu respons yang lebih cepat dan konsisten bagi semua pengguna. Jika sebuah server melambat karena beban berat, Load Balancer dapat mengarahkan traffic baru ke server lain yang lebih responsif.

## Bagaimana Cara Kerjanya?

Arsitektur dasarnya terlihat seperti ini:

```text
+--------+     +----------------+     +----------------+
|        |     |                |---->| Server 1 (Sehat) |
| Pengguna |---->|  Load Balancer |     +----------------+
|        |     |                |
+--------+     +----------------+     +----------------+
               |                |---->| Server 2 (Sehat) |
               +----------------+     +----------------+
                     |       ^
                     |       | Health Check
                     v       |
               +----------------+
               | Server 3 (Mati)  |
               +----------------+
```

Proses utamanya melibatkan dua hal:

1.  **Health Checks:** Ini adalah mekanisme paling penting. Seperti yang dijelaskan dalam `Availability_Patterns.md`, Load Balancer tidak hanya membagi traffic secara buta. Ia secara aktif dan terus-menerus mengirimkan permintaan sederhana (seperti "ping" atau request ke endpoint `/health`) ke setiap server di dalam pool-nya.
    *   Jika server merespons dengan status "sehat" (misalnya, HTTP 200 OK), ia akan tetap menerima traffic.
    *   Jika server gagal merespons atau merespons dengan error, Load Balancer akan menandainya sebagai "tidak sehat" dan mengeluarkannya dari rotasi hingga pulih kembali.

2.  **Algoritma Distribusi:** Load Balancer menggunakan berbagai strategi untuk memutuskan ke mana permintaan berikutnya akan dikirim. Beberapa yang umum adalah:
    *   **Round Robin:** Mengirimkan permintaan ke setiap server secara bergiliran (Server 1, lalu Server 2, lalu Server 1 lagi, dst.). Sederhana tapi efektif.
    *   **Least Connections:** Mengirimkan permintaan ke server yang sedang memiliki koneksi aktif paling sedikit. Sangat baik untuk menjaga agar beban tetap seimbang.
    *   **IP Hash:** Mengarahkan permintaan dari alamat IP klien yang sama untuk selalu menuju ke server yang sama. Ini berguna untuk menjaga data sesi pengguna (session stickiness) tanpa memerlukan mekanisme terpusat.

## Load Balancer vs. DNS Load Balancing

Seperti yang disebutkan dalam dokumen `Domain_Name_System.md`, Anda bisa melakukan bentuk load balancing yang sangat dasar menggunakan **DNS Round Robin**. Anda cukup membuat beberapa A Record untuk domain yang sama yang menunjuk ke IP server yang berbeda.

Namun, metode ini memiliki kelemahan fatal: **DNS tidak melakukan Health Check**. Jika salah satu server Anda mati, DNS tidak tahu dan akan tetap mengirim sebagian pengguna Anda ke server yang mati tersebut.

Load Balancer yang sesungguhnya (seperti AWS ELB, Nginx, HAProxy) jauh lebih cerdas karena ia secara aktif memonitor kesehatan server dan menjamin traffic hanya dikirim ke server yang benar-benar siap melayani.

## Contoh Kasus Nyata: Flash Sale E-commerce

Bayangkan sebuah situs e-commerce akan mengadakan flash sale besar-besaran. Tepat pukul 12:00, ratusan ribu pengguna akan mengakses situs secara bersamaan.

### Tanpa Load Balancer

Jika situs hanya berjalan di satu server, server tersebut akan langsung kewalahan, menyebabkan situs menjadi sangat lambat, menampilkan error "503 Service Unavailable", atau bahkan crash total. Ini adalah contoh klasik dari **Single Point of Failure**.

### Dengan Load Balancer

Arsitektur yang tangguh akan menggunakan Load Balancer untuk menangani skenario ini:

1.  **Distribusi Beban (Load Distribution):**
    *   Semua pengguna mengakses satu alamat, yang mengarah ke Load Balancer.
    *   Load Balancer membagi ribuan permintaan secara merata ke beberapa server (misalnya, Server 1, Server 2, Server 3).
    *   **Hasil:** Tidak ada satu server pun yang bebannya mencapai 100%. Beban kerja terbagi rata, dan situs tetap responsif untuk semua orang.

2.  **Penanganan Kegagalan (Automatic Failover):**
    *   Di tengah puncak traffic, **Server 2** mengalami masalah dan berhenti merespons.
    *   Load Balancer, melalui **Health Check**, mendeteksi bahwa Server 2 "tidak sehat".
    *   Secara otomatis, Load Balancer **berhenti mengirimkan traffic** ke Server 2 dan hanya mendistribusikannya ke Server 1 dan 3 yang sehat.
    *   **Hasil:** Sebagian besar pengguna tidak akan pernah tahu ada masalah. Situs tetap berjalan, mengimplementasikan **High Availability**.

3.  **Skalabilitas Elastis (Horizontal Scaling):**
    *   Tim engineering melihat beban di server yang tersisa mulai meningkat.
    *   Mereka dengan cepat **menambahkan dua server baru** (Server 4 dan Server 5) ke dalam pool.
    *   Load Balancer langsung mulai mengirimkan sebagian traffic ke server baru tersebut.
    *   **Hasil:** Kapasitas total sistem meningkat secara instan untuk menangani lonjakan traffic, semua dilakukan **tanpa downtime**.

## Kesimpulan

Dalam desain sistem, Load Balancer adalah komponen fundamental yang memungkinkan arsitektur Anda menjadi:
*   **Tangguh (Resilient):** Tahan terhadap kegagalan server tunggal.
*   **Skalabel (Scalable):** Mampu menangani pertumbuhan traffic dengan mudah.
*   **Berperforma Tinggi (Performant):** Menjaga waktu respons tetap cepat.

Tanpanya, mencapai tingkat ketersediaan tinggi seperti "three nines" (99.9%) atau lebih, seperti yang dibahas dalam `Availability_in_Numbers.md`, akan sangat sulit dan tidak praktis.

Skenario: Flash Sale Pukul 12:00 Siang
Bayangkan sebuah situs e-commerce akan mengadakan flash sale besar-besaran untuk produk populer. Tepat pukul 12:00, puluhan ribu, bahkan ratusan ribu pengguna akan mengakses situs secara bersamaan untuk mencoba membeli produk tersebut.

Tanpa Load Balancer (Arsitektur Tradisional)
Jika situs ini hanya berjalan di satu server tunggal (meskipun sangat kuat), inilah yang akan terjadi:

Pukul 11:59: Situs berjalan normal.
Pukul 12:00:00: Gelombang traffic raksasa menghantam server.
Pukul 12:00:01: CPU dan memori server langsung melonjak ke 100%. Server mulai kewalahan memproses ribuan koneksi yang masuk.
Hasil:
Bagi pengguna, situs menjadi sangat lambat (lemot).
Banyak pengguna akan mendapatkan pesan error "503 Service Unavailable" atau halaman tidak termuat sama sekali.
Server bisa crash dan mati total, membuat situs tidak bisa diakses oleh semua orang.
Ini adalah contoh klasik dari Single Point of Failure. Seluruh bisnis bergantung pada kesehatan satu server tunggal.

Dengan Load Balancer (Arsitektur Modern dan Tangguh)
Sekarang, mari kita lihat bagaimana situs e-commerce yang dirancang dengan baik menangani skenario ini menggunakan Load Balancer.

Arsitekturnya:

text
                               +-----------------+
                               | Load Balancer   |
                               | (IP: 203.0.113.1) |
                               +-----------------+
                                  /      |      \
                                 /       |       \
                   Health Check /        |        \ Health Check
                               /         |         \
                              v          v          v
                      +----------+ +----------+ +----------+
                      | Web Srv 1| | Web Srv 2| | Web Srv 3|
                      | (Sehat)  | | (Sehat)  | | (Sehat)  |
                      +----------+ +----------+ +----------+
Apa yang terjadi saat Flash Sale:

Distribusi Beban (Load Distribution):

Semua pengguna mengakses satu alamat, misalnya www.tokopedia.com. DNS akan mengarahkan mereka ke alamat IP milik Load Balancer.
Ketika ribuan permintaan masuk, Load Balancer tidak meneruskannya ke satu server. Ia secara cerdas membaginya ke semua server di belakangnya.
Permintaan dari Pengguna A mungkin ke Server 1, Pengguna B ke Server 2, Pengguna C ke Server 3, Pengguna D kembali ke Server 1, dan seterusnya. Ini menggunakan algoritma seperti Round Robin atau Least Connections.
Hasil: Tidak ada satu server pun yang bebannya mencapai 100%. Beban kerja terbagi rata, dan situs tetap responsif untuk semua orang.
Penanganan Kegagalan (Automatic Failover):

Tiba-tiba, di tengah puncak traffic, Web Server 2 mengalami masalah software dan berhenti merespons.
Load Balancer, yang terus-menerus melakukan Health Check (seperti yang dijelaskan di Availability_Patterns.md), akan mendeteksi dalam hitungan detik bahwa Server 2 "tidak sehat".
Secara otomatis, Load Balancer berhenti mengirimkan traffic baru ke Server 2. Semua permintaan sekarang hanya didistribusikan antara Server 1 dan Server 3 yang sehat.
Hasil: Sebagian besar pengguna tidak akan pernah tahu ada masalah. Situs tetap berjalan seolah-olah tidak terjadi apa-apa. Ini adalah implementasi nyata dari High Availability.
Skalabilitas Elastis (Horizontal Scaling):

Tim engineering melihat bahwa meskipun situs masih berjalan, beban di Server 1 dan 3 mulai mendekati batas aman.
Mereka dengan cepat menambahkan dua server baru (Server 4 dan Server 5) ke dalam pool server.
Begitu server baru ini ditambahkan ke konfigurasi Load Balancer, ia akan langsung mulai mengirimkan sebagian traffic ke sana.
Hasil: Kapasitas total sistem meningkat secara instan untuk menangani lonjakan traffic yang lebih tinggi lagi, semua dilakukan tanpa downtime.
Kesimpulan Kasus Nyata
Dalam contoh ini, Load Balancer bukan sekadar "pembagi lalu lintas". Ia adalah otak dari arsitektur yang memungkinkan:

Ketersediaan Tinggi: Situs tidak mati meskipun salah satu komponennya gagal. Ini adalah kunci untuk mencapai target ketersediaan "three nines" (99.9%) atau lebih, seperti yang dibahas di Availability_in_Numbers.md.
Skalabilitas: Memungkinkan bisnis untuk menangani pertumbuhan dari 10.000 pengguna menjadi 1.000.000 pengguna hanya dengan menambahkan lebih banyak server, bukan mengganti server yang ada.
Performa: Menjaga waktu respons tetap cepat dan konsisten bagi semua pengguna, bahkan di bawah tekanan beban berat.
