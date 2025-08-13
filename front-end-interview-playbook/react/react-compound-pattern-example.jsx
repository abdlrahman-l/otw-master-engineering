import React, { useState, useContext, createContext } from 'react';

// 1. Buat Context untuk berbagi state antar komponen
const TabsContext = createContext();

/**
 * Komponen Induk (Provider)
 * Mengelola state `activeTab` dan membagikannya melalui Context Provider.
 * Menerima `defaultTab` sebagai prop untuk menentukan tab awal yang aktif.
 */
export function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const value = {
    activeTab,
    setActiveTab,
  };

  return (
    <TabsContext.Provider value={value}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

/**
 * Komponen Anak (Consumer)
 * Tombol untuk setiap tab. Menggunakan context untuk mengetahui tab mana
 * yang aktif dan untuk mengubah tab aktif saat diklik.
 * Menerima `id` sebagai identitas uniknya.
 */
export function Tab({ children, id }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  const isActive = activeTab === id;

  const activeStyle = {
    borderBottom: '2px solid blue',
    fontWeight: 'bold',
    color: 'blue',
  };

  const style = {
    padding: '10px 15px',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    ...(isActive ? activeStyle : {}),
  };

  return (
    <button style={style} onClick={() => setActiveTab(id)}>
      {children}
    </button>
  );
}

/**
 * Komponen Anak (Consumer)
 * Panel konten untuk setiap tab. Hanya akan merender `children`-nya
 * jika `id`-nya cocok dengan `activeTab` dari context.
 */
export function TabPanel({ children, id }) {
  const { activeTab } = useContext(TabsContext);

  return activeTab === id ? <div>{children}</div> : null;
}


// --- Contoh Penggunaan ---

function App() {
  return (
    <div>
      <h1>Contoh Compound Component: Tabs</h1>
      <Tabs defaultTab="profile">
        {/* Pengguna punya fleksibilitas untuk menata letak */}
        <div>
          <Tab id="profile">Profil</Tab>
          <Tab id="settings">Pengaturan</Tab>
          <Tab id="billing">Tagihan</Tab>
        </div>

        <hr />

        {/* Konten bisa diletakkan di mana saja di dalam Provider */}
        <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '10px' }}>
          <TabPanel id="profile"><p>Ini adalah konten untuk halaman profil pengguna.</p></TabPanel>
          <TabPanel id="settings"><p>Ubah pengaturan akun Anda di sini.</p></TabPanel>
          <TabPanel id="billing"><p>Lihat riwayat tagihan dan metode pembayaran.</p></TabPanel>
        </div>
      </Tabs>
    </div>
  );
}