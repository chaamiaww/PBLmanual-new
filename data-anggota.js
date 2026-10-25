// 1. Ambil elemen yang dibutuhkan, simpan ke variabel
const modal  = document.getElementById('modal-anggota');
const form   = document.getElementById('form-anggota');
const tbody  = document.getElementById('isi-tabel');
const jumlah = document.getElementById('jumlah-anggota');

// Samakan angka "N mahasiswa terdaftar" dengan jumlah baris saat halaman dibuka
jumlah.textContent = tbody.rows.length;

// 2. Fungsi buka dan tutup modal
function bukaModal() {
    modal.classList.add('show');
    document.getElementById('nim').focus();   // kursor langsung ke kolom NIM
}

function tutupModal() {
    modal.classList.remove('show');
    form.reset();                             // kosongkan isian
}

// 3. Pasang "pendengar" klik
document.getElementById('btn-buka-modal').addEventListener('click', bukaModal);
document.getElementById('btn-tutup-modal').addEventListener('click', tutupModal);
document.getElementById('btn-batal').addEventListener('click', tutupModal);

// klik area gelap di luar modal = tutup
modal.addEventListener('click', function (e) {
    if (e.target === modal) tutupModal();
});

// tekan Esc = tutup
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tutupModal();
});

// 4. Ambil inisial untuk avatar: "Budi Utomo" -> "BU"
function ambilInisial(nama) {
    const kata  = nama.trim().split(/\s+/);          // pecah per spasi
    const awal  = kata[0][0];
    const akhir = kata.length > 1 ? kata[kata.length - 1][0] : '';
    return (awal + akhir).toUpperCase();
}

// 5. Buat satu baris tabel dari data
function buatBaris(data) {
    const tr = document.createElement('tr');

    // kerangka statis (aman, tidak berisi input pengguna)
    tr.innerHTML = `
        <td class="td-nim"></td>
        <td>
            <div class="nama-cell">
                <span class="avatar-kecil"></span>
                <span class="td-nama"></span>
            </div>
        </td>
        <td class="td-kelas"></td>
        <td class="td-jabatan"></td>
        <td class="col-aksi">
            <div class="aksi-btn">
                <a href="#" title="Edit"><i class="bx bx-pencil"></i></a>
                <a href="#" title="Reset"><i class="bx bx-key"></i></a>
                <a href="#" title="Hapus" class="hapus"><i class="bx bx-trash"></i></a>
            </div>
        </td>
    `;

    // isi data pakai textContent (aman dari kode berbahaya)
    tr.querySelector('.td-nim').textContent       = data.nim;
    tr.querySelector('.avatar-kecil').textContent = ambilInisial(data.nama);
    tr.querySelector('.td-nama').textContent      = data.nama;
    tr.querySelector('.td-kelas').textContent     = data.kelas;
    tr.querySelector('.td-jabatan').textContent   = data.jabatan;

    return tr;
}

// 6. Saat form disubmit
form.addEventListener('submit', function (e) {
    e.preventDefault();      // cegah halaman reload

    const data = {
        nim:     form.elements.nim.value.trim(),
        nama:    form.elements.nama.value.trim(),
        jabatan: form.elements.jabatan.value,
        kelas:   form.elements.kelas.value
    };

    // validasi: NIM harus 10 digit angka
    if (!/^\d{10}$/.test(data.nim)) {
        alert('NIM harus berupa 10 digit angka.');
        return;
    }

    // validasi: NIM tidak boleh kembar
    for (const baris of tbody.rows) {
        if (baris.cells[0].textContent.trim() === data.nim) {
            alert('NIM ini sudah terdaftar.');
            return;
        }
    }

    tbody.appendChild(buatBaris(data));        // tambah baris baru di akhir
    jumlah.textContent = tbody.rows.length;    // update "N mahasiswa terdaftar"
    tutupModal();
});