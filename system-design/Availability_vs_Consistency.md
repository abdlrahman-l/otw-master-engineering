# Availability vs. Consistency dalam Desain Sistem

Pilihan antara **Availability (Ketersediaan)** dan **Consistency (Konsistensi)** adalah salah satu trade-off paling fundamental dan penting yang harus dibuat saat merancang sistem terdistribusi skala besar. Konsep ini paling baik dijelaskan melalui **CAP Theorem**.

## Apa itu CAP Theorem?

CAP Theorem, juga dikenal sebagai Brewer's Theorem, menyatakan bahwa dalam sistem komputasi terdistribusi, mustahil untuk secara bersamaan memberikan lebih dari dua dari tiga jaminan berikut:

1.  **Consistency (Konsistensi):** Setiap operasi baca (read) akan menerima data yang paling baru ditulis (write) atau sebuah error. Dengan kata lain, semua node dalam sistem melihat data yang sama pada waktu yang sama.
2.  **Availability (Ketersediaan):** Setiap permintaan (request) akan menerima respons (yang bukan error), tanpa jaminan bahwa respons tersebut berisi data yang paling baru ditulis. Sistem selalu beroperasi dan siap merespons.
3.  **Partition Tolerance (Toleransi Partisi):** Sistem terus beroperasi meskipun terjadi partisi jaringan (kegagalan komunikasi) antara node-node di dalam sistem.

### Trade-off yang Sebenarnya: CP vs AP

Dalam dunia nyata, partisi jaringan adalah keniscayaan. Koneksi bisa putus, server bisa down, atau terjadi latensi tinggi antar data center. Oleh karena itu, **Partition Tolerance (P) bukanlah sebuah pilihan, melainkan sebuah keharusan** untuk sistem terdistribusi yang andal.

Ini berarti trade-off yang sebenarnya adalah antara **Consistency (C)** dan **Availability (A)**. Ketika terjadi partisi jaringan, Anda harus memilih salah satu untuk dikorbankan.

---

## Memilih Availability (Sistem AP)

Jika Anda memilih **Availability** daripada Consistency saat terjadi partisi jaringan, sistem Anda akan tetap merespons setiap permintaan.

-   **Bagaimana cara kerjanya?** Ketika partisi jaringan terjadi (misalnya, Node A tidak bisa berkomunikasi dengan Node B), kedua node tetap akan melayani permintaan baca dan tulis. Namun, karena mereka tidak bisa sinkronisasi, data di antara keduanya bisa menjadi tidak konsisten. Node A mungkin memiliki data versi 1, sementara Node B masih memiliki data versi 0.
-   **Konsekuensi:** Pengguna yang terhubung ke Node B mungkin akan melihat data yang "usang" (*stale data*). Namun, dari sudut pandang pengguna, sistem tidak pernah *down*.
-   **Model yang Digunakan:** Sistem seperti ini biasanya mengadopsi model **"Eventual Consistency"**, di mana sistem menjamin bahwa jika tidak ada pembaruan baru, semua replika pada akhirnya akan menyatu ke nilai yang sama.
-   **Kapan Digunakan?**
    -   **Media Sosial:** Jumlah "like" atau "view" pada sebuah postingan. Lebih baik menampilkan jumlah yang sedikit usang daripada menampilkan pesan error.
    -   **E-commerce (Halaman Produk):** Daftar produk atau jumlah stok yang terlihat oleh pengguna. Menampilkan stok yang sedikit tidak akurat (dan menanganinya saat checkout) lebih baik daripada membuat situs tidak bisa diakses.
    -   **Sistem Analitik:** Data analitik yang sedikit tertunda biasanya tidak menjadi masalah besar.

**Contoh Sederhana:** Bayangkan Anda mengubah foto profil Facebook Anda. Teman Anda di belahan dunia lain mungkin masih melihat foto lama Anda selama beberapa detik atau menit. Facebook memilih Availability; mereka lebih memilih Anda dan teman Anda tetap bisa menggunakan platform daripada memblokir akses sampai foto profil Anda tersinkronisasi di seluruh dunia.

---

## Memilih Consistency (Sistem CP)

Jika Anda memilih **Consistency** daripada Availability saat terjadi partisi jaringan, sistem Anda akan menolak merespons jika tidak dapat menjamin bahwa data yang diberikan adalah yang terbaru.

-   **Bagaimana cara kerjanya?** Ketika partisi jaringan terjadi, sistem akan menjadi "tidak tersedia" (*unavailable*) untuk sebagian atau seluruh pengguna. Jika sebuah node tidak dapat memastikan bahwa ia memiliki data terbaru dari node lain, ia akan menolak permintaan tulis atau mengembalikan error pada permintaan baca.
-   **Konsekuensi:** Pengguna mungkin akan mengalami error atau *timeout*, tetapi mereka tidak akan pernah melihat atau memodifikasi data yang salah/usang.
-   **Model yang Digunakan:** Sistem seperti ini menjamin **"Strong Consistency"**.
-   **Kapan Digunakan?**
    -   **Sistem Perbankan:** Transfer uang atau pengecekan saldo. Anda tidak bisa mentolerir data saldo yang tidak konsisten.
    -   **Sistem Reservasi:** Pemesanan tiket pesawat atau kamar hotel. Sistem harus menjamin bahwa satu kursi tidak dipesan oleh dua orang yang berbeda.
    -   **Manajemen Inventaris (Inti):** Sistem gudang yang melacak jumlah barang secara akurat.

**Contoh Sederhana:** Saat Anda mentransfer uang dari rekening bank Anda. Jika sistem tidak dapat mengkonfirmasi bahwa saldo Anda telah berhasil dikurangi di semua replika database, transaksi akan gagal. Bank lebih memilih transaksi gagal (*unavailable*) daripada terjadi inkonsistensi yang menyebabkan uang hilang atau tercipta dari ketiadaan.

---

## Tabel Perbandingan

| Aspek | Availability (AP System) | Consistency (CP System) |
| :--- | :--- | :--- |
| **Prioritas Utama** | Uptime dan responsivitas sistem. | Integritas dan kebenaran data. |
| **Saat Partisi Jaringan** | Tetap merespons, meskipun dengan data yang mungkin usang. | Mengembalikan error atau menunggu hingga konsistensi tercapai. |
| **Pengalaman Pengguna** | Sistem terasa selalu "on", tapi bisa melihat data lama. | Sistem bisa terasa "down" atau lambat, tapi data selalu akurat. |
| **Contoh Kasus** | Like, comment, feed media sosial, daftar produk. | Transaksi keuangan, sistem reservasi, manajemen inventaris. |
| **Model Konsistensi** | Eventual Consistency | Strong Consistency |

Pada akhirnya, tidak ada pilihan yang "benar" atau "salah". Keputusan untuk memprioritaskan Availability atau Consistency sepenuhnya bergantung pada kebutuhan bisnis dan kasus penggunaan spesifik dari aplikasi yang Anda bangun.