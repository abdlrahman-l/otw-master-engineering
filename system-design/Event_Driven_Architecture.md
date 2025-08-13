# Arsitektur Berbasis Peristiwa (Event-Driven Architecture)

Arsitektur Berbasis Peristiwa adalah sebuah paradigma desain sistem di mana komponen-komponen berkomunikasi satu sama lain dengan cara memproduksi dan mengonsumsi peristiwa (events). Ini adalah evolusi alami dari pola **Background Jobs** yang memungkinkan sistem menjadi sangat terpisah (*decoupled*), skalabel, dan tangguh.

## Dari "Task Queue" menjadi "Event Bus"

Pada pola background job dasar, Producer secara eksplisit memberikan "tugas" untuk dikerjakan oleh Consumer.

*   **Task-Oriented (Imperatif):** "Worker, kirim email selamat datang ke user@example.com."
*   **Event-Driven (Deklaratif):** "Perhatian semua, peristiwa **`UserSignedUp`** baru saja terjadi untuk user@example.com."

Dalam model event-driven, Producer tidak tahu dan tidak peduli siapa yang akan menanggapi peristiwa tersebut atau apa yang akan mereka lakukan. Ia hanya bertanggung jawab untuk **mengumumkan sebuah fakta** yang telah terjadi.

---

## Arsitektur Umum

Arsitekturnya melibatkan **Event Producer**, **Event Bus** (atau Message Broker), dan beberapa **Event Consumers** (atau Subscribers).

```
+----------------+      +---------------------+      +--------------------+
|                |      |                     |      | Consumer A         |
| Event Producer |  (2) |     Event Bus /     |----->| (Email Service)    |
| (Aplikasi Web) |----->|    Message Broker   |      |                    |
|                |      | (e.g., RabbitMQ, Kafka) |   +--------------------+
+----------------+      |                     |
       ^                +---------------------+      +--------------------+
       | (1)                                    |
       |                                        ----->| Consumer B         |
+------+---------+                                   | (Analytics Service)|
|                |                                   |                    |
|      User      |                                   +--------------------+
|                |
+----------------+                                   +--------------------+
                                                     | Consumer C         |
                                                     | (CRM Service)      |
                                                     |                    |
                                                     +--------------------+
```

1.  **User Action:** Pengguna mendaftar di aplikasi.
2.  **Event Producer:** Aplikasi utama tidak lagi mengirim job "kirim email". Sebaliknya, ia hanya menerbitkan satu peristiwa generik bernama **`UserSignedUp`** ke **Event Bus**.
3.  **Event Consumers (Subscribers):** Beberapa layanan (worker) yang berbeda berlangganan peristiwa `UserSignedUp` dan bereaksi secara independen:
    *   **Consumer A (Email Service):** Saat mendengar `UserSignedUp`, ia mengirim email selamat datang.
    *   **Consumer B (Analytics Service):** Saat mendengar `UserSignedUp`, ia memperbarui dasbor pendaftaran.
    *   **Consumer C (CRM Service):** Saat mendengar `UserSignedUp`, ia menambahkan data pengguna ke sistem CRM.

---

## Keuntungan Utama

1.  **Decoupling (Pemisahan) yang Ekstrem:**
    *   Producer tidak perlu tahu tentang layanan-layanan yang mengonsumsi event-nya.
    *   Anda bisa **menambah atau menghapus consumer baru** (misalnya, "Fraud Detection Service") tanpa mengubah kode di aplikasi utama. Ini membuat sistem sangat fleksibel.

2.  **Skalabilitas dan Paralelisme:**
    *   Satu peristiwa dapat memicu banyak alur kerja secara paralel.
    *   Setiap layanan consumer dapat di-scale secara independen. Jika pengiriman email menjadi bottleneck, Anda bisa menambah lebih banyak worker untuk Email Service tanpa memengaruhi layanan lain.

3.  **Peningkatan Resilience (Ketahanan):**
    *   Jika **CRM Service (Consumer C)** sedang down, hal itu **tidak akan memengaruhi** pengiriman email atau pembaruan analitik. Sisa sistem tetap berfungsi normal. Ini adalah implementasi **Resilience** yang sangat kuat, sejalan dengan `Availability_Patterns.md`.

## Contoh Kasus Nyata: E-commerce (Checkout)
contoh checkout di Tokopedia.

Peristiwa (Event): OrderPaid
Payload Event: { "orderId": "XYZ-123", "userId": "ABC-456", "totalAmount": 500000, ... }
Aplikasi checkout hanya perlu menerbitkan event ini. Kemudian:**`OrderPaid`**.

Kemudian, beberapa layanan akan bereaksi:
*   **Inventory Service** mendengarkan `OrderPaid` -> mengurangi stok barang.
*   **Notification Service** mendengarkan `OrderPaid` -> mengirim email konfirmasi.
*   **Shipping Service** mendengarkan `OrderPaid` -> membuat permintaan pengiriman ke gudang.
*   **Loyalty Service** mendengarkan `OrderPaid` -> menambahkan poin loyalitas ke akun pengguna.

Semua ini terjadi secara asinkron dan paralel, dipicu oleh satu peristiwa tunggal. Ini adalah inti dari bagaimana sistem modern yang kompleks dan skalabel dibangun, dengan mengadopsi prinsip **Eventual Consistency** untuk mencapai **Availability** yang tinggi.