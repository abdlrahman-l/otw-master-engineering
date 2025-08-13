# Layer 4 Load Balancing dalam Desain Sistem

**Layer 4 Load Balancing** adalah jenis load balancing yang beroperasi pada **Lapisan Transport (Transport Layer)** dalam model OSI. Nama "Layer 4" mengacu pada lapisan di mana protokol seperti **TCP** dan **UDP** beroperasi.

Load balancer ini membuat keputusan perutean hanya berdasarkan informasi jaringan yang terbatas:
*   Alamat IP Sumber (Source IP)
*   Port Sumber (Source Port)
*   Alamat IP Tujuan (Destination IP)
*   Port Tujuan (Destination Port)

Ia tidak memeriksa atau memahami isi (konten) dari paket data yang melewatinya.

*   **Analogi Sederhana:**
    *   **Layer 7 Load Balancer** adalah resepsionis gedung yang bisa membaca tujuan surat ("Untuk Departemen HRD") dan mengarahkannya ke ruangan yang benar.
    *   **Layer 4 Load Balancer** adalah seperti petugas pos yang hanya melihat alamat jalan dan nomor rumah (IP dan Port) untuk mengantarkan surat. Ia tidak tahu dan tidak peduli siapa atau apa isi surat di dalamnya. Ia hanya bertugas memastikan surat sampai ke alamat gedung yang benar.

## Bagaimana Cara Kerjanya? (Packet-level Routing)

Prosesnya sangat cepat dan efisien karena kesederhanaannya:

1.  Klien mengirimkan permintaan ke alamat IP publik milik Load Balancer.
2.  Load Balancer menerima paket jaringan (TCP/UDP).
3.  Ia memilih server backend dari pool berdasarkan algoritma yang dikonfigurasi (misalnya, Round Robin, Least Connections).
4.  Load Balancer kemudian melakukan **Network Address Translation (NAT)**. Ia mengubah alamat IP tujuan pada paket dari IP-nya sendiri menjadi IP server backend yang dipilih.
5.  Paket diteruskan ke server backend.
6.  Server backend memproses permintaan dan mengirimkan respons kembali ke Load Balancer.
7.  Load Balancer melakukan NAT lagi untuk mengubah IP sumber dari IP server backend menjadi IP-nya sendiri, lalu mengirimkannya kembali ke klien.

Bagi klien, seolah-olah mereka hanya berkomunikasi dengan satu entitas, yaitu Load Balancer.

```text
+----------+      +------------------+      +--------------------+
|          |      | L4 Load Balancer |      | App Server 1       |
|  Klien   |----->| (IP: 203.0.113.1)|----->| (IP: 10.0.0.1)     |
|          |      | Port: 80         |      +--------------------+
+----------+      +------------------+
                  | (melakukan NAT)  |      +--------------------+
                  |                  |----->| App Server 2       |
                  +------------------+      | (IP: 10.0.0.2)     |
                                            +--------------------+
```

## Kelebihan Layer 4 Load Balancing

1.  **Sangat Cepat (High Performance):** Karena tidak perlu memeriksa konten paket (seperti header HTTP atau payload), prosesnya sangat ringan dan cepat. Ini membuatnya ideal untuk menangani volume traffic yang sangat besar.
2.  **Sederhana:** Konfigurasinya lebih mudah dan logikanya tidak rumit dibandingkan L7.
3.  **Aman (dari segi enkripsi):** Karena tidak perlu membaca konten, ia tidak perlu melakukan dekripsi SSL/TLS. Enkripsi bisa terjadi secara *end-to-end* langsung antara klien dan server backend.
4.  **Fleksibel untuk Berbagai Protokol:** Dapat menyeimbangkan beban untuk protokol apa pun yang berjalan di atas TCP/UDP, tidak hanya HTTP. Contohnya termasuk lalu lintas database, game server, atau layanan streaming.

## Kekurangan Layer 4 Load Balancing

1.  **Tidak "Cerdas" (Content-unaware):** Kekurangan terbesarnya adalah ia tidak memiliki konteks aplikasi. Ia tidak bisa membedakan antara permintaan ke `/api/users` dan `/static/images`. Semua permintaan ke port yang sama akan diperlakukan sama.
2.  **Tidak Bisa Melakukan Optimasi Konten:** Ia tidak dapat melakukan fungsi canggih seperti **caching**, **kompresi**, atau **SSL termination**.
3.  **Session Persistence Terbatas:** Satu-satunya cara untuk mencapai *sticky sessions* adalah dengan mengandalkan alamat IP sumber klien. Ini tidak selalu andal, terutama jika banyak klien berada di belakang satu NAT (misalnya, satu jaringan kantor).

## Contoh Konfigurasi (Nginx sebagai L4 Load Balancer)

Meskipun Nginx terkenal sebagai L7 proxy, ia memiliki modul `stream` yang memungkinkannya berfungsi sebagai L4 Load Balancer untuk lalu lintas TCP dan UDP.

```nginx
# Konfigurasi ini berada di luar blok http {}

# Mendefinisikan grup server TCP
stream {
    upstream tcp_backend {
        # Menggunakan algoritma Least Connections
        least_conn;
        server app_server_1:8080;
        server app_server_2:8080;
    }

    server {
        # Nginx akan mendengarkan traffic TCP di port 80
        listen 80;

        # Meneruskan traffic ke grup server yang didefinisikan
        proxy_pass tcp_backend;
    }
}
```

## Perbandingan: Layer 4 vs. Layer 7

| Fitur | Layer 4 Load Balancer | Layer 7 Load Balancer |
| :--- | :--- | :--- |
| **Lapisan OSI** | 4 (Transport) | 7 (Aplikasi) |
| **Protokol** | TCP, UDP | HTTP, HTTPS, WebSocket |
| **Keputusan Routing**| Berdasarkan IP dan Port | Berdasarkan URL, Header, Cookies |
| **Kecepatan** | Sangat Cepat | Lebih Lambat (karena inspeksi konten) |
| **Kecerdasan** | Rendah (tidak tahu konten) | Tinggi (tahu konten aplikasi) |
| **Fitur** | Hanya routing paket | Routing, SSL Termination, Caching, Kompresi |
| **Kasus Penggunaan** | Traffic volume tinggi, non-HTTP, kesederhanaan | Aplikasi web modern, microservices |

## Kesimpulan

**Layer 4 Load Balancing** adalah alat yang sangat kuat dan efisien untuk mendistribusikan lalu lintas pada tingkat jaringan. Kecepatannya membuatnya tak tertandingi untuk kasus penggunaan yang membutuhkan throughput tinggi dan latensi rendah.

Namun, untuk aplikasi web modern yang kompleks, terutama yang dibangun dengan arsitektur microservices, **Layer 7 Load Balancing** (`Layer_7_Load_Balancing.md`) hampir selalu menjadi pilihan yang lebih baik karena fleksibilitas dan kecerdasannya dalam memahami konteks aplikasi. Seringkali, arsitektur yang sangat besar bahkan menggunakan kombinasi keduanya: L4 Load Balancer di depan untuk menangani volume traffic mentah, yang kemudian meneruskannya ke sekelompok L7 Load Balancer untuk routing yang lebih cerdas.