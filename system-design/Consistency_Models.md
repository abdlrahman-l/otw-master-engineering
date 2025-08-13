# Memahami Model-Model Konsistensi dalam Desain Sistem

Dalam sistem terdistribusi, **konsistensi** mengacu pada bagaimana dan kapan perubahan data (penulisan) terlihat oleh operasi baca berikutnya di berbagai node. Ini bukanlah konsep biner (kuat vs. lemah), melainkan sebuah spektrum dengan berbagai tingkatan jaminan.

Pilihan model konsistensi adalah trade-off fundamental yang dipengaruhi oleh **CAP Theorem**, yang memaksa kita memilih antara Konsistensi (C) dan Ketersediaan (A) ketika terjadi Partisi Jaringan (P).

## Spektrum Konsistensi

Berikut adalah beberapa model konsistensi utama, diurutkan dari yang paling ketat hingga yang paling longgar.

### 1. Strong Consistency (Konsistensi Kuat)

Ini adalah model yang paling ketat dan paling mudah dipahami oleh developer.

*   **Jaminan:** Setiap operasi baca dijamin akan menerima data terbaru yang telah ditulis atau akan menerima error. Tidak ada kemungkinan membaca data usang (*stale data*).
*   **Cara Kerja:** Setelah operasi tulis berhasil, semua operasi baca berikutnya akan melihat data baru tersebut, di mana pun node yang diakses. Sistem akan memblokir operasi lain hingga sinkronisasi selesai.
*   **Trade-off (CAP):** Memilih Konsistensi dan Toleransi Partisi (**CP**). Mengorbankan ketersediaan saat terjadi partisi.
*   **Contoh Kasus:** Sistem perbankan (saldo rekening), sistem reservasi tiket, sistem inventaris.

### 2. Weak Consistency (Konsistensi Lemah)

Ini adalah kategori umum untuk semua model yang tidak sekuat *Strong Consistency*.

*   **Jaminan:** Sangat sedikit. Sistem tidak memberikan jaminan kapan pembaruan data akan terlihat oleh node lain. Operasi baca setelah tulis bisa saja mengembalikan data lama.
*   **Cara Kerja:** Sistem "berusaha" menyebarkan data, tetapi tidak ada jaminan waktu atau urutan.
*   **Penting:** Dalam praktiknya, model "lemah" murni jarang digunakan. Biasanya, developer membutuhkan jaminan yang lebih spesifik, yang melahirkan sub-tipe seperti *Eventual Consistency*.

### 3. Eventual Consistency (Konsistensi pada Akhirnya)

Ini adalah bentuk spesifik dan sangat populer dari *Weak Consistency*.

*   **Jaminan:** Jika tidak ada pembaruan baru yang dilakukan pada data, **pada akhirnya** semua replika akan menyatu (*converge*) ke nilai yang sama. Ada jeda waktu di mana data bisa usang, tetapi ada jaminan bahwa data akan sinkron.
*   **Cara Kerja:** Operasi tulis diterima dengan cepat di satu node, dan sinkronisasi ke node lain terjadi secara asinkron di latar belakang.
*   **Trade-off (CAP):** Memilih Ketersediaan dan Toleransi Partisi (**AP**). Mengorbankan konsistensi sesaat demi ketersediaan.
*   **Contoh Kasus:** Jumlah *like* di media sosial, feed berita, katalog produk e-commerce.

### Model Konsistensi Lainnya (Di Antara Strong dan Eventual)

Ada beberapa model yang memberikan jaminan lebih kuat dari *Eventual* tetapi lebih longgar dari *Strong*. Ini sering disebut sebagai model *session consistency* karena jaminannya sering kali terikat pada sesi pengguna tunggal.

#### a. Read-your-writes Consistency

*   **Jaminan:** Setelah seorang pengguna menulis data, operasi baca berikutnya dari **pengguna yang sama** dijamin akan melihat data yang baru ditulis tersebut. Pengguna lain mungkin masih melihat data lama untuk sementara waktu.
*   **Contoh Kasus:** Anda mengedit komentar Anda di sebuah postingan. Saat halaman dimuat ulang, Anda pasti melihat versi terbaru dari komentar Anda. Teman Anda mungkin baru melihatnya beberapa detik kemudian.

#### b. Monotonic Reads Consistency

*   **Jaminan:** Jika seorang pengguna telah melihat data versi tertentu, mereka tidak akan pernah melihat versi yang lebih lama dari data tersebut pada operasi baca berikutnya. Mereka hanya akan melihat versi yang sama atau yang lebih baru.
*   **Contoh Kasus:** Anda melihat jumlah *view* pada sebuah video adalah 100. Saat Anda me-refresh, jumlahnya bisa tetap 100 atau menjadi 101, tetapi tidak akan pernah kembali menjadi 99. Ini mencegah data "bergerak mundur" dari perspektif satu pengguna.

## Tabel Perbandingan

| Model Konsistensi | Jaminan Utama | Contoh Kasus |
| :--- | :--- | :--- |
| **Strong** | Baca selalu dapat data terbaru atau error. | Saldo bank, reservasi. |
| **Read-your-writes** | Pengguna yang sama selalu membaca tulisannya sendiri. | Mengedit profil/komentar sendiri. |
| **Monotonic Reads** | Pengguna tidak pernah melihat data "kembali ke masa lalu". | Penghitung view, feed berita. |
| **Eventual** | Jika tidak ada update, semua node pada akhirnya akan sama. | Jumlah like, sinkronisasi data non-kritis. |
| **Weak** | Tidak ada jaminan kapan update akan terlihat. | (Kategori umum, jarang diimplementasikan secara murni). |

Pilihan model konsistensi yang tepat sangat bergantung pada kebutuhan spesifik dari fitur yang sedang dibangun. Tidak semua bagian dari sebuah aplikasi membutuhkan *Strong Consistency*. Seringkali, *Eventual Consistency* atau model di antaranya sudah lebih dari cukup dan memberikan performa serta ketersediaan yang lebih baik.
