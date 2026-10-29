// ===== data-jenis-iuran.js =====
// Halaman Jenis Iuran (FR-02): tambah, tampil, ubah, hapus, dan cari jenis iuran.
// Jenis iuran = tagihan untuk PEMASUKAN (contoh: Kas Bulanan, Rp 10.000, Per Bulan).
// Membutuhkan data-kas.js (dimuat lebih dulu di data-jenis-iuran.html)


// =====================================================
// 1. Ambil elemen yang dibutuhkan
// =====================================================
const modal        = ambil('modal-iuran');
const form         = ambil('form-iuran');
const tbody        = ambil('isi-tabel');
const jumlah       = ambil('jumlah-iuran');
const kolomCari    = ambil('kolom-cari');
const pesanKosong  = ambil('pesan-kosong');
const infoPaging   = ambil('info-paging');
const tombolPaging = ambil('tombol-paging');
const toastEl      = ambil('toast');

// Berapa baris per halaman
const PER_HALAMAN = 5;

// Penanda mode ubah: berisi id jenis iuran yang sedang diubah (null = sedang menambah)
let idDiedit = null;

// Halaman tabel yang sedang dibuka
let halaman = 1;


// =====================================================
// 2. Notifikasi (toast) berhasil / gagal
// =====================================================
let waktuToast = null;

function tampilToast(pesan, jenis) {
    toastEl.textContent = pesan;
    toastEl.className = 'toast show ' + jenis;     // jenis: 'sukses' atau 'gagal'

    clearTimeout(waktuToast);
    waktuToast = setTimeout(function () {
        toastEl.classList.remove('show');
    }, 2500);
}


// =====================================================
// 3. Pesan error di bawah kolom
// =====================================================
function tampilError(namaField, pesan) {
    const grup = form.elements[namaField].closest('.form-group');
    grup.classList.add('error');
    ambil('err-' + namaField).textContent = pesan;
}

function bersihkanError() {
    form.querySelectorAll('.form-group.error').forEach(function (g) {
        g.classList.remove('error');
    });
    form.querySelectorAll('.pesan-error').forEach(function (p) {
        p.textContent = '';
    });
}

// Error satu kolom hilang begitu pengguna mulai mengisi lagi
form.addEventListener('input', function (e) {
    const grup = e.target.closest('.form-group');
    if (grup === null) return;

    grup.classList.remove('error');
    const pesan = grup.querySelector('.pesan-error');
    if (pesan !== null) pesan.textContent = '';
});

// Kolom nominal otomatis diberi titik ribuan saat diketik: 10000 -> 10.000
form.elements.nominal.addEventListener('input', function () {
    const angka = this.value.replace(/\D/g, '');
    this.value = angka === '' ? '' : Number(angka).toLocaleString('id-ID');
});

// "10.000" -> 10000
function ambilAngka(teks) {
    return Number(String(teks).replace(/\D/g, ''));
}


// =====================================================
// 4. Buka dan tutup modal
// =====================================================
function bukaModal() {
    modal.classList.add('show');
    form.elements.nama.focus();
}

function tutupModal() {
    modal.classList.remove('show');
    form.reset();                      // kosongkan isian
    bersihkanError();

    // kembalikan form ke mode "tambah"
    idDiedit = null;
    ambil('judul-modal').textContent = 'Tambah Jenis Iuran';
}

ambil('btn-buka-modal').addEventListener('click', bukaModal);
ambil('btn-tutup-modal').addEventListener('click', tutupModal);
ambil('btn-batal').addEventListener('click', tutupModal);

// klik area gelap di luar modal = tutup
modal.addEventListener('click', function (e) {
    if (e.target === modal) tutupModal();
});

// tekan Esc = tutup
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tutupModal();
});


// =====================================================
// 5. Membuat baris tabel
// =====================================================
function buatBaris(data) {
    const tr = document.createElement('tr');
    tr.dataset.id = data.id;

    // kerangka statis (aman, tidak berisi input pengguna)
    tr.innerHTML = `
        <td class="td-nama"></td>
        <td class="td-nominal" style="text-align: right;"></td>
        <td class="td-periode"></td>
        <td class="col-aksi">
            <div class="aksi-btn">
                <a href="#" title="Ubah" class="edit"><i class="bx bx-pencil"></i></a>
                <a href="#" title="Hapus" class="hapus"><i class="bx bx-trash"></i></a>
            </div>
        </td>
    `;

    // isi data pakai textContent (aman dari kode berbahaya)
    tr.querySelector('.td-nama').textContent    = data.nama;
    tr.querySelector('.td-nominal').textContent = formatRupiah(data.nominal);
    tr.querySelector('.td-periode').textContent = data.periode;

    return tr;
}


// =====================================================
// 6. Menggambar tabel (pencarian + pagination)
// =====================================================
function tampilkan() {
    const kata = kolomCari.value.trim().toLowerCase();

    // a. saring berdasarkan nama iuran
    const hasil = daftarJenisIuran.filter(function (j) {
        return j.nama.toLowerCase().includes(kata);
    });

    // b. hitung halaman
    const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
    if (halaman > totalHalaman) halaman = totalHalaman;
    if (halaman < 1) halaman = 1;

    const mulai = (halaman - 1) * PER_HALAMAN;
    const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

    // c. gambar ulang baris tabel
    tbody.innerHTML = '';
    tampil.forEach(function (j) {
        tbody.appendChild(buatBaris(j));
    });

    // d. jumlah jenis iuran di judul
    jumlah.textContent = daftarJenisIuran.length;

    // e. pesan kosong: dibedakan antara "belum ada data" dan "pencarian tidak cocok"
    if (daftarJenisIuran.length === 0) {
        pesanKosong.textContent = 'Belum ada data jenis iuran.';
        pesanKosong.hidden = false;
    } else if (hasil.length === 0) {
        pesanKosong.textContent = 'Data tidak ditemukan';
        pesanKosong.hidden = false;
    } else {
        pesanKosong.hidden = true;
    }

    // f. teks "Menampilkan 1-3 dari 3 data"
    if (hasil.length === 0) {
        infoPaging.textContent = 'Menampilkan 0 dari 0 data';
    } else {
        infoPaging.textContent = 'Menampilkan ' + (mulai + 1) + '-' +
                                 (mulai + tampil.length) + ' dari ' +
                                 hasil.length + ' data';
    }

    buatPaging(totalHalaman);
}

function buatTombolHalaman(isi, tujuan, nonaktif, aktif, label) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'paging-item' + (aktif ? ' aktif' : '');
    b.innerHTML = isi;
    b.disabled = nonaktif;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', function () {
        halaman = tujuan;
        tampilkan();
    });
    return b;
}

function buatPaging(totalHalaman) {
    tombolPaging.innerHTML = '';

    tombolPaging.appendChild(
        buatTombolHalaman('<i class="bx bx-chevron-left"></i>', halaman - 1, halaman === 1, false, 'Halaman sebelumnya')
    );

    for (let i = 1; i <= totalHalaman; i++) {
        tombolPaging.appendChild(
            buatTombolHalaman(String(i), i, false, i === halaman, 'Halaman ' + i)
        );
    }

    tombolPaging.appendChild(
        buatTombolHalaman('<i class="bx bx-chevron-right"></i>', halaman + 1, halaman === totalHalaman, false, 'Halaman berikutnya')
    );
}


// =====================================================
// 7. Simpan form (tambah / ubah)
// =====================================================
form.addEventListener('submit', function (e) {
    e.preventDefault();      // cegah halaman reload
    bersihkanError();

    const modeUbah = (idDiedit !== null);

    const data = {
        nama:    form.elements.nama.value.trim(),
        nominal: ambilAngka(form.elements.nominal.value),
        periode: form.elements.periode.value
    };

    // ----- validasi -----
    let adaError = false;

    if (data.nama === '') {
        tampilError('nama', 'Kolom ini wajib diisi');
        adaError = true;
    } else if (daftarJenisIuran.some(function (j) {
        return j.id !== idDiedit && j.nama.toLowerCase() === data.nama.toLowerCase();
    })) {
        tampilError('nama', 'Jenis iuran ini sudah ada');
        adaError = true;
    }

    if (form.elements.nominal.value.trim() === '') {
        tampilError('nominal', 'Kolom ini wajib diisi');
        adaError = true;
    } else if (data.nominal <= 0) {
        tampilError('nominal', 'Nominal harus lebih dari 0');
        adaError = true;
    }

    if (adaError) {
        tampilToast('Data gagal disimpan. Periksa kembali isian.', 'gagal');
        return;
    }

    // ----- simpan -----
    if (modeUbah) {
        const jenis = cariJenis(idDiedit);
        const lama = { nama: jenis.nama, nominal: jenis.nominal, periode: jenis.periode };

        jenis.nama    = data.nama;
        jenis.nominal = data.nominal;
        jenis.periode = data.periode;

        if (!simpanJenisIuran()) {
            // gagal menyimpan: kembalikan seperti semula
            jenis.nama    = lama.nama;
            jenis.nominal = lama.nominal;
            jenis.periode = lama.periode;
            tampilToast('Data gagal disimpan.', 'gagal');
            return;
        }
    } else {
        data.id = nomorBerikut(daftarJenisIuran);
        daftarJenisIuran.push(data);

        if (!simpanJenisIuran()) {
            daftarJenisIuran.pop();
            tampilToast('Data gagal disimpan.', 'gagal');
            return;
        }

        kolomCari.value = '';                                       // hapus pencarian supaya data baru terlihat
        halaman = Math.ceil(daftarJenisIuran.length / PER_HALAMAN); // lompat ke halaman terakhir
    }

    tutupModal();
    tampilkan();
    tampilToast(modeUbah ? 'Data berhasil diubah' : 'Data berhasil disimpan', 'sukses');
});


// =====================================================
// 8. Tombol edit dan hapus di kolom Aksi
// =====================================================
tbody.addEventListener('click', function (e) {

    // ----- hapus -----
    const tombolHapus = e.target.closest('.hapus');
    if (tombolHapus !== null) {
        e.preventDefault();

        const id = Number(tombolHapus.closest('tr').dataset.id);
        const jenis = cariJenis(id);
        if (jenis === null) return;

        // aturan: data master yang masih dipakai transaksi tidak boleh dihapus
        if (hitungPemakaianJenis(id) > 0) {
            tampilToast('Tidak dapat dihapus karena masih digunakan oleh transaksi.', 'gagal');
            return;
        }

        // dialog konfirmasi
        if (!confirm('Hapus jenis iuran "' + jenis.nama + '"?')) {
            return;
        }

        const urutan = daftarJenisIuran.indexOf(jenis);
        daftarJenisIuran.splice(urutan, 1);

        if (!simpanJenisIuran()) {
            daftarJenisIuran.splice(urutan, 0, jenis);
            tampilToast('Data gagal dihapus.', 'gagal');
            return;
        }

        tampilkan();
        tampilToast('Data berhasil dihapus', 'sukses');
        return;
    }

    // ----- edit -----
    const tombolEdit = e.target.closest('.edit');
    if (tombolEdit !== null) {
        e.preventDefault();

        const id = Number(tombolEdit.closest('tr').dataset.id);
        const jenis = cariJenis(id);
        if (jenis === null) return;

        // isi form dengan data jenis iuran itu
        form.elements.nama.value    = jenis.nama;
        form.elements.nominal.value = Number(jenis.nominal).toLocaleString('id-ID');
        form.elements.periode.value = jenis.periode;

        // ubah form menjadi mode ubah
        idDiedit = id;
        ambil('judul-modal').textContent = 'Ubah Jenis Iuran';

        bukaModal();
    }
});


// =====================================================
// 9. Pencarian nama iuran
// =====================================================
kolomCari.addEventListener('input', function () {
    halaman = 1;          // setiap pencarian baru mulai dari halaman 1
    tampilkan();
});


// =====================================================
// 10. Tampilkan tabel saat halaman dibuka
// =====================================================
tampilkan();

// Kolom pencarian di topbar: tekan Enter untuk mencari di halaman Data Transaksi (FR-05)
document.getElementById('cari-atas').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        window.location.href = 'data-transaksi.html?q=' + encodeURIComponent(this.value);
    }
});
