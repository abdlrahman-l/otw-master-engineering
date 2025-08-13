import React from 'react';

// Ini adalah contoh komponen kelas React yang kompleks dan "campur aduk".
// Tujuannya adalah untuk menunjukkan bagaimana logika yang tidak saling berhubungan
// (seperti fetching data, berlangganan event browser, dan mengelola input form)
// menjadi tercampur di dalam lifecycle methods, membuatnya sulit dibaca dan dipelihara.
// Ini adalah masalah umum yang coba dipecahkan oleh React Hooks.

class UserProfileWithStatus extends React.Component {
  constructor(props) {
    super(props);
    console.log('1. constructor: Inisialisasi state dan binding method');

    // State berisi berbagai macam data yang tidak saling berhubungan:
    // - Data pengguna dari API (user, isLoading, error)
    // - Lebar layar (windowWidth)
    // - Pesan status dari input pengguna (statusMessage)
    this.state = {
      user: null,
      isLoading: true,
      error: null,
      windowWidth: window.innerWidth,
      statusMessage: 'Online',
    };

    // Binding method ke 'this' instance
    this.handleResize = this.handleResize.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  // --- Lifecycle Method: Mounting ---
  componentDidMount() {
    console.log('2. componentDidMount: Melakukan side effects setelah render pertama');

    // --- LOGIC 1: Fetching Data ---
    // Logika untuk mengambil data dari API.
    fetch(`https://jsonplaceholder.typicode.com/users/${this.props.userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Gagal mengambil data pengguna');
        }
        return response.json();
      })
      .then(user => this.setState({ user, isLoading: false }))
      .catch(error => this.setState({ error, isLoading: false }));

    // --- LOGIC 2: Berlangganan Event Browser ---
    // Logika untuk mendengarkan perubahan ukuran window.
    window.addEventListener('resize', this.handleResize);

    // --- LOGIC 3: Mengubah Judul Dokumen ---
    // Logika lain yang tidak berhubungan: mengubah judul halaman.
    document.title = `Profil: ${this.state.statusMessage}`;
  }

  // --- Lifecycle Method: Updating ---
  componentDidUpdate(prevProps, prevState) {
    console.log('4. componentDidUpdate: Melakukan side effects setelah state/props berubah');

    // --- LOGIC 3 (Lanjutan): Mengubah Judul Dokumen ---
    // Logika ini hanya peduli tentang `statusMessage`, tapi ia harus
    // berada di dalam method yang sama dengan logika lain.
    if (prevState.statusMessage !== this.state.statusMessage) {
      console.log('Status berubah, update judul dokumen.');
      document.title = `Profil: ${this.state.statusMessage}`;
    }
  }

  // --- Lifecycle Method: Unmounting ---
  componentWillUnmount() {
    console.log('5. componentWillUnmount: Membersihkan side effects');

    // --- LOGIC 2 (Lanjutan): Membersihkan Event Listener ---
    // Logika pembersihan untuk event 'resize'
    window.removeEventListener('resize', this.handleResize);
  }

  // --- Event Handlers ---

  // Handler untuk LOGIC 2
  handleResize() {
    this.setState({ windowWidth: window.innerWidth });
  }

  // Handler untuk input status
  handleStatusChange(event) {
    this.setState({ statusMessage: event.target.value });
  }

  // --- Render Method ---
  render() {
    console.log('3. render: Menampilkan UI berdasarkan state saat ini');
    const { user, isLoading, error, windowWidth, statusMessage } = this.state;

    if (isLoading) {
      return <div>Memuat profil pengguna...</div>;
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    return (
      <div style={{ border: '2px solid red', padding: '15px', margin: '10px' }}>
        <h2>Contoh Class Component Kompleks (Tanpa Hooks)</h2>
        <p>
          Komponen ini mencampurkan beberapa logika: fetching data, event listener, dan form input.
          Perhatikan bagaimana logikanya tersebar di `componentDidMount`, `componentDidUpdate`, dan `componentWillUnmount`.
        </p>
        <hr />

        {user && (
          <div>
            <h3>Profil Pengguna (dari API)</h3>
            <p><strong>Nama:</strong> {user.name}</p>
          </div>
        )}
        <hr />

        <div>
          <h3>Update Status (Input & Judul Halaman)</h3>
          <input type="text" value={statusMessage} onChange={this.handleStatusChange} />
          <p>Status saat ini: <strong>{statusMessage}</strong></p>
        </div>
        <hr />

        <div>
          <h3>Info Browser (Event Listener)</h3>
          <p>Lebar window saat ini: <strong>{windowWidth}px</strong></p>
        </div>
      </div>
    );
  }
}

export default UserProfileWithStatus;