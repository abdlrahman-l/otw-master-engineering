import { useState, useEffect } from 'react';

/**
 * Custom Hook: useFetch
 * Mengambil data dari URL yang diberikan dan mengelola state loading dan error.
 * Ini adalah versi yang lebih tangguh karena menggunakan AbortController
 * untuk membatalkan request jika komponen di-unmount atau URL berubah,
 * mencegah memory leak dan race condition.
 * @param {string} url - URL API untuk mengambil data.
 * @returns {object} - { data, isLoading, error }
 */
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    setIsLoading(true);
    setData(null);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Gagal mengambil data');
        return response.json();
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      })
      .finally(() => setIsLoading(false));

    // Cleanup function: batalkan fetch jika komponen unmount atau url berubah
    return () => controller.abort();
  }, [url]);

  return { data, isLoading, error };
}

/**
 * Custom Hook: useWindowWidth
 * Melacak dan mengembalikan lebar window browser saat ini.
 * @returns {number} - Lebar window dalam pixel.
 */
export function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Array dependensi kosong, hanya berjalan sekali

  return windowWidth;
}

/**
 * Custom Hook: useDocumentTitle
 * Mengupdate judul dokumen (tab browser).
 * @param {string} title - Judul yang ingin ditampilkan.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}