# API Gateway dalam Microservices

## 1. Apa itu API Gateway?
API Gateway adalah **komponen yang menjadi pintu masuk tunggal (single entry point)** bagi semua client (mobile app, web, IoT) untuk mengakses layanan-layanan microservices.  

Alih-alih client langsung memanggil setiap service satu per satu (User Service, Product Service, Payment Service, dll), mereka cukup memanggil API Gateway → gateway yang akan meneruskan ke service yang tepat.  

---

## 2. Kenapa Perlu API Gateway?
Tanpa API Gateway:
- Client harus tahu alamat/endpoint setiap service  
- Kompleks saat jumlah service banyak  
- Sulit menerapkan cross-cutting concern (auth, logging, rate limiting)  

Dengan API Gateway:
- Semua request masuk ke satu pintu  
- Bisa jadi **abstraction layer** → client hanya tahu API Gateway, bukan service di belakangnya  

---

## 3. Fungsi Utama API Gateway
### a. Request Routing
- Gateway menerima request → lalu meneruskan ke microservice sesuai path atau rule tertentu.  
  Contoh:  
  - `/api/users` → User Service  
  - `/api/orders` → Order Service  
  - `/api/payments` → Payment Service  

### b. Authentication & Authorization
- API Gateway bisa integrasi dengan OAuth2, JWT, atau Identity Provider (Keycloak, Auth0, AWS Cognito).  
- Jadi hanya request yang valid yang diteruskan ke backend.  

### c. Rate Limiting & Throttling
- Membatasi jumlah request per user/IP supaya tidak ada abuse (misalnya DDoS).  

### d. Load Balancing
- Jika ada banyak instance dari suatu service, gateway bisa memilih salah satu berdasarkan algoritma (round robin, least connections, dll).  

### e. Caching
- Gateway bisa menyimpan response tertentu untuk mengurangi beban service di belakangnya.  

### f. Monitoring & Logging
- Semua request bisa dicatat di gateway → mudah untuk tracking, debugging, dan observability.  

### g. Protocol Translation
- Client bisa request dengan REST, tapi service bisa menggunakan gRPC, SOAP, atau WebSocket. Gateway yang handle konversinya.  

---

## 4. Contoh Flow dengan API Gateway
User mau ambil daftar pesanan (orders):  

1. Client → `GET /api/orders` ke API Gateway  
2. API Gateway cek JWT token → validasi user  
3. Gateway routing ke **Order Service**  
4. Order Service ambil data dari database  
5. Response kembali ke Gateway  
6. Gateway bisa apply transformasi (misalnya filter field)  
7. Gateway kirim response ke client  

---

## 5. Teknologi Populer API Gateway
- **Nginx / Kong** → banyak dipakai, open-source  
- **Zuul / Spring Cloud Gateway** → ekosistem Java  
- **Express Gateway** → berbasis Node.js  
- **AWS API Gateway / Azure API Management / GCP API Gateway** → solusi cloud-native  
- **Istio / Envoy (Service Mesh)** → level lebih advance, sering dipakai di Kubernetes  

---

## 6. Kelebihan API Gateway
✅ Centralized security dan monitoring  
✅ Menyederhanakan komunikasi antara client dan service  
✅ Bisa handle traffic besar dengan load balancing & caching  
✅ Mudah menambahkan fitur baru (misalnya A/B testing, request shaping)  

---

## 7. Kekurangan API Gateway
❌ Jadi **single point of failure** kalau tidak di-deploy dengan high availability  
❌ Bisa menambah latency karena ada lapisan tambahan  
❌ Konfigurasi lebih kompleks saat jumlah service makin banyak  

---

## 8. Diagram Sederhana API Gateway

```txt
     [ Client ]
        |
        v
  +-------------+
  | API Gateway |
  +-------------+
    |    |    |
    v    v    v
[User] [Order] [Payment]
 Service Service Service
```



