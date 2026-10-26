// 1. Ambil elemen yang dibutuhkan, simpan ke variabel
const modal  = document.getElementById('modal-anggota');
const form   = document.getElementById('form-anggota');
const tbody  = document.getElementById('isi-tabel');
const jumlah = document.getElementById('jumlah-anggota');

// Samakan angka "N mahasiswa terdaftar" dengan jumlah baris saat halaman dibuka
jumlah.textContent = tbody.rows.length;

// Nama "laci" tempat daftar anggota disimpan di browser//
const kunciSimpan = 'dataAnggota';

//Daftar anggota awal (dipakai kalau belum ada anggota yang tersimpan di browser )//
const dataAwal = [
    {nim: '3312601044', nama: 'Ariel', jabatan: 'Ketua kelas', kelas: 'IF-1B'}
];

//Mengambil daftar anggota yang  tersimpan //
function ambilTersimpan(){
    const teks = localStorage.getItem(kunciSimpan);

    if (teks === null) {
        return dataAwal;
    }

    return JSON.parse(teks);
}

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
    // simpan anggota baru ke browser supaya tidak hilang saat halaman dimuat ulang//
    const daftar = ambilTersimpan();
    daftar.push(data);
    localStorage.setItem(kunciSimpan, JSON.stringify(daftar));

    tbody.appendChild(buatBaris(data));        // tambah baris baru di akhir
    jumlah.textContent = tbody.rows.length;    // update "N mahasiswa terdaftar"
    tutupModal();
    });

// 7. Saat halaman dibuka: tampilkan anggota yang tersimpan ke tabel //
    const tersimpan = ambilTersimpan();

    for (let i = 0; i < tersimpan.length; i++) {
    tbody.appendChild(buatBaris(tersimpan[i]));
    }
jumlah.textContent = tbody.rows.length;
// 8. Tombol hapus di kolom Aksi
tbody.addEventListener('click', function (e) {
    const tombol = e.target.closest('.hapus');   // cek: yang diklik tombol hapus atau bukan

    if (tombol === null) {
        return;                                   // bukan tombol hapus, abaikan
    }

    e.preventDefault();                           // cegah link "#" melompat ke atas halaman

    const baris = tombol.closest('tr');
    const nim   = baris.cells[0].textContent.trim();
    const nama  = baris.querySelector('.td-nama').textContent;

    // minta konfirmasi dulu
    if (!confirm('Hapus anggota ' + nama + ' (' + nim + ')?')) {
        return;
    }

    // buang anggota itu dari daftar yang tersimpan di browser
    const daftar = ambilTersimpan();
    const sisa = [];

    for (let i = 0; i < daftar.length; i++) {
        if (daftar[i].nim !== nim) {
            sisa.push(daftar[i]);
        }
    }

    localStorage.setItem(kunciSimpan, JSON.stringify(sisa));

    baris.remove();                               // hilangkan baris dari tabel
    jumlah.textContent = tbody.rows.length;       // update "N mahasiswa terdaftar"
});