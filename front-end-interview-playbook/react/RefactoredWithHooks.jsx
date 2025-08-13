import React, { useState, useEffect } from 'react';

// Ini adalah versi refactor dari `UserProfileWithStatus` menggunakan Hooks.
// Tujuannya adalah untuk menunjukkan bagaimana Hooks memungkinkan kita untuk
// mengelompokkan logika yang saling berhubungan, membuatnya lebih bersih dan terorganisir.

function UserProfileWithStatusHooks({ userId }) {
  // --- State Management (`useState`) ---
  // Setiap bagian dari state dikelola secara terpisah.
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Online');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // --- Side Effects (`useEffect`) ---

  // LOGIC 1: Fetching Data
  // Semua logika untuk mengambil data pengguna ada di satu tempat.
  // Hook ini akan berjalan lagi jika `userId` berubah.
  useEffect(() => {
    console.log('useEffect: Fetching data...');
    setIsLoading(true);
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Gagal mengambil data pengguna');
        }
        return response.json();
      })
      .then(userData => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch(fetchError => {
        setError(fetchError);
        setIsLoading(false);
      });
  }, [userId]); // Dependency array: hanya berjalan saat `userId` berubah.

  // LOGIC 2: Berlangganan Event Browser
  // Semua logika untuk event 'resize' ada di satu tempat, termasuk pembersihannya.
  useEffect(() => {
    console.log('useEffect: Menambahkan event listener resize...');
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Cleanup function: React akan memanggil ini saat komponen di-unmount.
    return () => {
      console.log('Cleanup: Menghapus event listener resize...');
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Dependency array kosong: hanya berjalan sekali (seperti componentDidMount).

  // LOGIC 3: Mengubah Judul Dokumen
  // Logika untuk mengubah judul dokumen terisolasi di sini.
  useEffect(() => {
    console.log('useEffect: Mengupdate judul dokumen...');
    document.title = `Profil: ${statusMessage}`;
  }, [statusMessage]); // Dependency array: hanya berjalan saat `statusMessage` berubah.

  // --- Render Logic ---
  if (isLoading) return <div>Memuat profil pengguna...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ border: '2px solid green', padding: '15px', margin: '10px' }}>
      <h2>Contoh Komponen dengan Hooks (Refactored)</h2>
      <p>
        Logika sekarang dikelompokkan berdasarkan fitur menggunakan `useEffect`, bukan tersebar di lifecycle methods.
      </p>
      <hr />

      {user && <h3>Profil: {user.name}</h3>}
      <hr />

      <h3>Update Status</h3>
      <input type="text" value={statusMessage} onChange={e => setStatusMessage(e.target.value)} />
      <p>Status saat ini: <strong>{statusMessage}</strong> (Lihat judul tab browser)</p>
      <hr />

      <h3>Info Browser</h3>
      <p>Lebar window saat ini: <strong>{windowWidth}px</strong></p>
    </div>
  );
}

export default UserProfileWithStatusHooks;