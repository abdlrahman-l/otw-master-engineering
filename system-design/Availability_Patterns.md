# Memahami Availability Patterns dalam Desain Sistem

**Availability Patterns** adalah sekumpulan strategi dan arsitektur yang dirancang untuk memastikan sebuah sistem tetap beroperasi dan dapat diakses oleh pengguna, bahkan ketika terjadi kegagalan pada sebagian komponennya. Tujuan utamanya adalah untuk memaksimalkan *uptime* dan meminimalkan *downtime*.

Pola-pola ini adalah implementasi praktis dari prinsip yang dijelaskan dalam **CAP Theorem**, khususnya untuk membangun sistem **AP (Available & Partition Tolerant)**. Mereka adalah "alat" yang kita gunakan untuk mencapai ketersediaan tinggi.

## 1. Redundancy (Redundansi)

Ini adalah pola paling fundamental. Idenya sederhana: jangan pernah bergantung pada satu komponen saja. Dengan memiliki cadangan, kita menghilangkan *Single Point of Failure* (Satu Titik Kegagalan).

Redundansi dapat diterapkan di berbagai tingkatan:
-   **Redundansi Server/Node:** Menjalankan beberapa *instance* dari aplikasi atau layanan di server yang berbeda.
-   **Redundansi Database:** Menyimpan salinan data di beberapa mesin database (lihat Pola Replikasi).
-   **Redundansi Data Center (Geo-Redundancy):** Menjalankan seluruh infrastruktur di lebih dari satu lokasi geografis untuk melindungi dari bencana skala besar (misalnya, mati listrik satu kota, gempa bumi).

## 2. Failover

Failover adalah mekanisme untuk **secara otomatis** mengalihkan lalu lintas (traffic) dari komponen yang gagal ke komponen cadangan yang sehat. Pola ini bergantung pada Redundansi dan Health Checks.

Ada dua jenis utama:

### a. Active-Passive Failover
-   **Cara Kerja:** Satu server (**Active**) menangani semua permintaan, sementara server lain (**Passive/Standby**) dalam keadaan siaga. Server pasif terus memantau server aktif. Jika server aktif gagal, sistem secara otomatis mengalihkan semua lalu lintas ke server pasif, yang kemudian menjadi aktif.
-   **Kelebihan:** Lebih sederhana untuk diimplementasikan.
-   **Kekurangan:** Sumber daya server pasif tidak digunakan selama operasi normal (boros).

### b. Active-Active Failover (via Load Balancing)
-   **Cara Kerja:** Semua server (dua atau lebih) berada dalam keadaan aktif dan semuanya melayani permintaan secara bersamaan. Sebuah **Load Balancer** berada di depan server-server ini, bertugas mendistribusikan permintaan.
-   **Proses Failover:** Jika salah satu server gagal, Load Balancer akan mendeteksinya (melalui *health check*) dan berhenti mengirimkan permintaan ke server tersebut. Permintaan akan didistribusikan ke server-server lain yang masih sehat.
-   **Kelebihan:** Pemanfaatan sumber daya yang efisien, skalabilitas yang lebih baik, dan failover yang lebih mulus. Ini adalah pola yang paling umum digunakan untuk sistem dengan ketersediaan tinggi.

## 3. Replication (Replikasi)

Replikasi adalah pola menyalin dan menyimpan data yang sama di beberapa server. Ini adalah fondasi untuk **redundansi data** dan memungkinkan **failover database**.

-   **Arsitektur Umum:** **Leader-Follower (Master-Slave)**, di mana satu node (Leader) menerima semua operasi tulis, dan node lain (Follower) menyalin data dari Leader.
-   **Hubungan dengan Availability:** Pilihan cara replikasi sangat menentukan posisi sistem Anda dalam spektrum CAP Theorem.
    -   **Asynchronous Replication:** Leader langsung merespons klien tanpa menunggu konfirmasi dari Follower. Ini memaksimalkan **Availability (AP System)** dengan risiko data di Follower sedikit tertinggal (*Eventual Consistency*). Jika Leader gagal, ada potensi kehilangan data yang belum sempat direplikasi.
    -   **Synchronous Replication:** Leader baru akan merespons klien setelah Follower mengonfirmasi penerimaan data. Ini menjamin **Consistency (CP System)** tetapi mengorbankan ketersediaan, karena proses tulis bisa gagal jika Follower tidak tersedia.

## 4. Health Checks

Ini adalah komponen pendukung yang krusial. Health Check adalah proses di mana sistem (biasanya Load Balancer atau layanan monitoring) secara berkala mengirimkan permintaan sederhana (seperti "ping" atau request ke endpoint `/health`) ke setiap server untuk memeriksa status kesehatannya.

-   Jika server merespons dengan status "sehat" (misalnya, HTTP 200 OK), ia akan tetap menerima lalu lintas.
-   Jika server gagal merespons atau merespons dengan error, ia akan ditandai sebagai "tidak sehat" dan dikeluarkan dari rotasi hingga pulih kembali.

Tanpa Health Check, Load Balancer tidak akan tahu kapan harus melakukan failover.

## 5. Circuit Breaker Pattern

Ini adalah pola di level aplikasi yang mencegah sebuah layanan terus-menerus mencoba menghubungi layanan lain yang diketahui sedang gagal. Ini mencegah *cascading failures* (kegagalan beruntun).

-   **Cara Kerja:**
    1.  **Closed:** Awalnya, sirkuit "tertutup". Permintaan diizinkan mengalir. Sistem melacak jumlah kegagalan.
    2.  **Open:** Jika jumlah kegagalan melebihi ambang batas, sirkuit "terbuka". Semua permintaan selanjutnya akan langsung gagal (*fail fast*) tanpa mencoba menghubungi layanan yang rusak. Ini mencegah pemborosan sumber daya.
    3.  **Half-Open:** Setelah beberapa saat, sirkuit masuk ke status "setengah terbuka". Ia akan mengizinkan satu permintaan percobaan. Jika berhasil, sirkuit kembali "tertutup". Jika gagal, sirkuit tetap "terbuka".

## Bagaimana Semua Bekerja Sama

Pola-pola ini tidak berdiri sendiri, melainkan bekerja dalam satu sistem:

1.  Anda menggunakan **Redundansi** dengan menjalankan beberapa server aplikasi (App-1, App-2) dan beberapa server database (DB-Master, DB-Slave).
2.  Anda menggunakan **Replikasi** (misalnya, asinkron) untuk menyalin data dari DB-Master ke DB-Slave.
3.  Sebuah **Load Balancer** ditempatkan di depan App-1 dan App-2.
4.  Load Balancer terus melakukan **Health Check** ke kedua server aplikasi.
5.  Jika App-1 gagal, **Failover** terjadi: Load Balancer mengalihkan semua traffic ke App-2.
6.  Jika App-1 gagal karena tidak bisa menghubungi DB-Master, pola **Circuit Breaker** di dalam App-1 akan mencegahnya terus-menerus membebani database yang mungkin sedang bermasalah.