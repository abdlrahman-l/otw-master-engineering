# Memahami Ketersediaan dalam Angka (Availability in Numbers)

**"Availability in Numbers"** adalah cara kuantitatif untuk mendefinisikan, mengukur, dan menargetkan tingkat ketersediaan sebuah sistem. Ini mengubah konsep abstrak "sistem harus selalu aktif" menjadi target yang konkret dan terukur. Konsep ini paling sering diekspresikan dalam bentuk **"The Nines"** (angka sembilan).

## Apa itu "The Nines"?

"The Nines" adalah singkatan untuk persentase ketersediaan yang diukur dalam periode satu tahun. Semakin banyak angka 9, semakin tinggi ketersediaan yang dijamin, dan semakin sedikit waktu henti (*downtime*) yang diizinkan.

Berikut adalah tabel yang menerjemahkan "The Nines" menjadi waktu henti yang diizinkan:

| Availability (%) | Julukan | Total Downtime per Tahun | Total Downtime per Bulan (rata-rata) | Total Downtime per Minggu |
| :--- | :--- | :--- | :--- | :--- |
| 99% | "Two nines" | 3.65 hari | ~7.3 jam | ~1.68 jam |
| 99.9% | "Three nines" | ~8.77 jam | ~43.8 menit | ~10.1 menit |
| 99.99% | "Four nines" | ~52.6 menit | ~4.38 menit | ~1.01 menit |
| 99.999% | "Five nines" | ~5.26 menit | ~26.3 detik | ~6.05 detik |
| 99.9999% | "Six nines" | ~31.6 detik | ~2.6 detik | ~0.6 detik |

**Wawasan Penting:** Perbedaan antara 99.9% dan 99.99% mungkin terlihat kecil, tetapi dalam praktiknya, itu adalah perbedaan antara hampir 9 jam downtime per tahun dan kurang dari 1 jam downtime per tahun.

## Biaya dan Kompleksitas di Balik "The Nines"

Setiap angka "9" tambahan yang ingin dicapai tidak datang dengan gratis. Biaya dan kompleksitasnya meningkat secara eksponensial. Ini berhubungan langsung dengan **Availability Patterns**.

-   **99% (Two Nines):** Mungkin bisa dicapai dengan satu server yang andal dan proses restart manual yang cepat.
-   **99.9% (Three Nines):** Memerlukan **Redundansi** dan **Failover** dasar, seperti setup Active-Passive atau Load Balancer dengan beberapa server aplikasi (**Active-Active**).
-   **99.99% (Four Nines):** Memerlukan **Redundansi antar Availability Zone (AZ)** dan **Replikasi** data yang andal untuk bertahan dari kegagalan skala rak server atau AZ.
-   **99.999% (Five Nines):** Level "mission-critical". Memerlukan **Geo-Redundancy** (replika infrastruktur di lokasi geografis berbeda) dengan mekanisme failover otomatis yang sangat canggih.

## Menghitung Ketersediaan Sistem

Ketersediaan sebuah sistem secara keseluruhan ditentukan oleh ketersediaan komponen-komponennya.

### 1. Komponen Serial (Bergantungan)

Jika layanan A bergantung pada layanan B, ketersediaan total adalah hasil perkalian ketersediaan masing-masing. Ketersediaan sistem selalu lebih rendah daripada komponen terlemahnya.

**Rumus:** `Av(total) = Av(A) * Av(B) * ... * Av(N)`

**Contoh:** Layanan Checkout (99.95%) bergantung pada Layanan Pembayaran (99.9%).
`Av(Total) = 0.9995 * 0.999 = 0.9985` atau **99.85%**

### 2. Komponen Paralel (Redundan)

Jika Anda memiliki beberapa komponen redundan (misalnya, dua server di belakang Load Balancer), ketersediaan total meningkat secara dramatis.

**Rumus:** `Av(total) = 1 - ( (1 - Av(A)) * (1 - Av(B)) * ... )`
Di mana `(1 - Av(A))` adalah probabilitas kegagalan komponen A.

**Contoh:** Dua server aplikasi, masing-masing dengan ketersediaan 99% (probabilitas gagal 1%).
`Av(Total) = 1 - ( (1 - 0.99) * (1 - 0.99) )`
`Av(Total) = 1 - (0.01 * 0.01)`
`Av(Total) = 1 - 0.0001 = 0.9999` atau **99.99%**

Ini secara matematis membuktikan mengapa **Redundansi** adalah pola yang sangat kuat untuk meningkatkan ketersediaan.

## SLA dan SLO

Angka-angka ini bukan hanya metrik internal. Mereka menjadi dasar dari kontrak bisnis:

-   **Service Level Objective (SLO):** Target ketersediaan internal yang ditetapkan oleh tim engineering (misalnya, "Kami menargetkan 99.95% uptime").
-   **Service Level Agreement (SLA):** Janji atau kontrak resmi kepada pelanggan. Jika ketersediaan di bawah angka yang dijanjikan dalam SLA (misalnya, 99.9%), perusahaan mungkin harus memberikan kompensasi kepada pelanggan.

Memahami "Availability in Numbers" sangat penting bagi seorang system designer untuk membuat keputusan yang tepat, menyeimbangkan antara kebutuhan bisnis, ekspektasi pengguna, biaya, dan kompleksitas teknis.
