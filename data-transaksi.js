// ===== data-transaksi.js =====
// Halaman Data Transaksi: tab, pencarian dan filter (FR-05), tabel, pagination, ubah dan hapus.
// Membutuhkan data-kas.js dan modal-transaksi.js (dimuat lebih dulu di data-transaksi.html)


// 1. Ambil elemen yang dibutuhkan
const tabBar       = ambil('tab-bar');
const fCari        = ambil('f-cari');
const fAnggota     = ambil('f-anggota');
const fJenis       = ambil('f-jenis');
const fDari        = ambil('f-dari');
const fSampai      = ambil('f-sampai');
const tombolReset  = ambil('f-reset');
const isiTransaksi = ambil('isi-transaksi');
const pesanKosong  = ambil('pesan-kosong');
const infoPaging   = ambil('info-paging');
const tombolPaging = ambil('tombol-paging');

// Berapa baris per halaman
const PER_HALAMAN = 10;

// Tab yang sedang dibuka: 'semua', 'masuk', atau 'keluar'
let tabAktif = 'semua';

// Halaman tabel yang sedang dibuka
let halaman = 1;


// 2. Pilihan filter
function isiPilihanFilter() {
    // ingat pilihan sekarang supaya tidak hilang saat daftar diperbarui
    const anggotaLama = fAnggota.value;
    const jenisLama   = fJenis.value;

    let anggota = '<option value="">Semua anggota</option>';

    for (let i = 0; i < daftarAnggota.length; i++) {
        anggota += '<option value="' + esc(daftarAnggota[i].nim) + '">' + esc(daftarAnggota[i].nama) + '</option>';
    }
    fAnggota.innerHTML = anggota;
    fAnggota.value = anggotaLama;

    // Satu kotak berisi dua kelompok: jenis iuran (pemasukan) dan keperluan (pengeluaran)
    let jenis = '<option value="">Semua jenis iuran / keperluan</option>';

    jenis += '<optgroup label="Jenis Iuran (Pemasukan)">';
    for (let i = 0; i < daftarJenisIuran.length; i++) {
        jenis += '<option value="j:' + daftarJenisIuran[i].id + '">' + esc(daftarJenisIuran[i].nama) + '</option>';
    }
    jenis += '</optgroup><optgroup label="Keperluan (Pengeluaran)">';
    for (let i = 0; i < daftarKeperluan.length; i++) {
        jenis += '<option value="k:' + daftarKeperluan[i].id + '">' + esc(daftarKeperluan[i].nama) + '</option>';
    }
    jenis += '</optgroup>';

    fJenis.innerHTML = jenis;
    fJenis.value = jenisLama;
}


// 3. Menyaring transaksi berdasarkan semua filter
// abaikanTab = true dipakai untuk menghitung angka kecil di tab (jumlah per tipe)
function saring(abaikanTab) {
    const kata = fCari.value.trim().toLowerCase();
    const urut = urutkanTransaksi();
    const hasil = [];

    for (let i = 0; i < urut.length; i++) {
        const t = urut[i];

        // tab
        if (!abaikanTab && tabAktif !== 'semua' && t.tipe !== tabAktif) {
            continue;
        }

        // pencarian: keterangan, nama anggota, nama jenis iuran / keperluan, atau tanggal (08/10/2026 atau 2026-10-08)
        if (kata !== '') {
            const gabungan = (t.keterangan + ' ' + cariNamaAnggota(t.nim) + ' ' + namaJenisAtauKeperluan(t) + ' ' +
                              formatTanggal(t.tanggal) + ' ' + t.tanggal).toLowerCase();

            if (!gabungan.includes(kata)) {
                continue;
            }
        }

        // anggota: pengeluaran tidak punya anggota, jadi ikut disembunyikan
        if (fAnggota.value !== '' && t.nim !== fAnggota.value) {
            continue;
        }

        // jenis iuran / keperluan
        if (fJenis.value !== '') {
            const bagian = fJenis.value.split(':');
            const id = Number(bagian[1]);

            if (bagian[0] === 'j' && !(t.tipe === 'masuk' && t.idJenis === id)) {
                continue;
            }
            if (bagian[0] === 'k' && !(t.tipe === 'keluar' && t.idKeperluan === id)) {
                continue;
            }
        }

        // rentang tanggal
        if (fDari.value !== '' && t.tanggal < fDari.value) {
            continue;
        }
        if (fSampai.value !== '' && t.tanggal > fSampai.value) {
            continue;
        }

        hasil.push(t);
    }

    return hasil;
}


// 4. Menggambar tabel (filter + pagination)
function buatBaris(t) {
    let label = '<span class="lbl lbl-hijau">Pemasukan</span>';
    let nominal = '<span class="teks-hijau">+ ' + formatRupiah(t.nominal) + '</span>';

    if (t.tipe === 'keluar') {
        label = '<span class="lbl lbl-merah">Pengeluaran</span>';
        nominal = '<span class="teks-merah">- ' + formatRupiah(t.nominal) + '</span>';
    }

    return '<tr data-id="' + t.id + '">' +
        '<td>' + formatTanggal(t.tanggal) + '</td>' +
        '<td>' + label + '</td>' +
        '<td>' + esc(cariNamaAnggota(t.nim)) + '</td>' +
        '<td>' + esc(namaJenisAtauKeperluan(t)) + '</td>' +
        '<td>' + (t.tipe === 'masuk' ? namaBulanIuran(t.bulanIuran) : '-') + '</td>' +
        '<td>' + (t.keterangan ? esc(t.keterangan) : '-') + '</td>' +
        '<td>' + nominal + '</td>' +
        '<td class="aksi">' +
            '<button type="button" class="ikon-aksi edit" title="Ubah"><i class="bx bx-pencil"></i></button>' +
            '<button type="button" class="ikon-aksi hapus" title="Hapus"><i class="bx bx-trash"></i></button>' +
        '</td>' +
        '</tr>';
}

function tampilkan() {
    // angka kecil di tab (mengikuti pencarian dan filter, tetapi tidak mengikuti tab)
    const semuaTipe = saring(true);
    let jumlahMasuk = 0;
    let jumlahKeluar = 0;

    for (let i = 0; i < semuaTipe.length; i++) {
        if (semuaTipe[i].tipe === 'masuk') {
            jumlahMasuk = jumlahMasuk + 1;
        } else {
            jumlahKeluar = jumlahKeluar + 1;
        }
    }
    ambil('jml-semua').textContent  = semuaTipe.length;
    ambil('jml-masuk').textContent  = jumlahMasuk;
    ambil('jml-keluar').textContent = jumlahKeluar;

    // data yang tampil di tabel
    const hasil = saring(false);

    const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
    if (halaman > totalHalaman) halaman = totalHalaman;
    if (halaman < 1) halaman = 1;

    const mulai = (halaman - 1) * PER_HALAMAN;
    const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

    let isi = '';
    for (let i = 0; i < tampil.length; i++) {
        isi += buatBaris(tampil[i]);
    }
    isiTransaksi.innerHTML = isi;

    // pesan kosong: dibedakan antara "belum ada data" dan "filter tidak cocok"
    if (daftarTransaksi.length === 0) {
        pesanKosong.textContent = 'Belum ada data transaksi.';
        pesanKosong.hidden = false;
    } else if (hasil.length === 0) {
        pesanKosong.textContent = 'Data tidak ditemukan';
        pesanKosong.hidden = false;
    } else {
        pesanKosong.hidden = true;
    }

    // teks "Menampilkan 1-6 dari 6 data"
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


// 5. Pasang pendengar

// Ganti tab
tabBar.addEventListener('click', function (e) {
    const tombol = e.target.closest('.tab');
    if (tombol === null) {
        return;
    }

    tabAktif = tombol.dataset.tab;
    halaman = 1;

    tabBar.querySelectorAll('.tab').forEach(function (t) {
        t.classList.toggle('aktif', t === tombol);
    });

    tampilkan();
});

// Setiap filter berubah: kembali ke halaman 1 lalu gambar ulang
function filterBerubah() {
    halaman = 1;

    if (fDari.value !== '' && fSampai.value !== '' && fDari.value > fSampai.value) {
        window.tampilToast('Tanggal "Dari" tidak boleh lebih besar dari "Sampai".', 'gagal');
    }

    tampilkan();
}

fCari.addEventListener('input', filterBerubah);
fAnggota.addEventListener('change', filterBerubah);
fJenis.addEventListener('change', filterBerubah);
fDari.addEventListener('change', filterBerubah);
fSampai.addEventListener('change', filterBerubah);

tombolReset.addEventListener('click', function () {
    fCari.value    = '';
    fAnggota.value = '';
    fJenis.value   = '';
    fDari.value    = '';
    fSampai.value  = '';
    filterBerubah();
});

// Tombol ubah dan hapus di kolom Aksi
isiTransaksi.addEventListener('click', function (e) {
    const tombolEdit  = e.target.closest('.edit');
    const tombolHapus = e.target.closest('.hapus');

    if (tombolEdit === null && tombolHapus === null) {
        return;
    }

    const id = Number(e.target.closest('tr').dataset.id);
    const transaksi = cariTransaksi(id);

    if (transaksi === null) {
        return;
    }

    // ----- ubah: buka form yang sama dengan Catat, tetapi sudah terisi -----
    if (tombolEdit !== null) {
        if (transaksi.tipe === 'masuk') {
            window.bukaPemasukan(transaksi);
        } else {
            window.bukaPengeluaran(transaksi);
        }
        return;
    }

    // ----- hapus: dengan dialog konfirmasi -----
    const nama = transaksi.tipe === 'masuk' ? cariNamaAnggota(transaksi.nim) : 'pengeluaran';

    if (!confirm('Hapus transaksi ' + nama + ' tanggal ' + formatTanggal(transaksi.tanggal) +
                 ' sebesar ' + formatRupiah(transaksi.nominal) + '?')) {
        return;
    }

    const cadangan = daftarTransaksi.slice();

    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].id === id) {
            daftarTransaksi.splice(i, 1);
            break;
        }
    }

    if (!simpanTransaksi()) {
        // gagal menyimpan: kembalikan seperti semula
        daftarTransaksi.splice(0, daftarTransaksi.length);
        for (let i = 0; i < cadangan.length; i++) {
            daftarTransaksi.push(cadangan[i]);
        }
        window.tampilToast('Data gagal dihapus.', 'gagal');
        return;
    }

    tampilkan();
    window.tampilToast('Data berhasil dihapus', 'sukses');
});

// Kolom pencarian di topbar: Enter mengisi kolom pencarian halaman ini
ambil('cari').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        fCari.value = this.value;
        filterBerubah();
    }
});

// Setelah form Catat / Ubah disimpan, tabel ikut diperbarui
window.setelahSimpan = function () {
    isiPilihanFilter();
    tampilkan();
};


// 6. Jalankan saat halaman dibuka
isiPilihanFilter();

// Kalau dibuka dari pencarian di dashboard (data-transaksi.html?q=kata), isi kolom pencarian
const kataDariUrl = new URLSearchParams(window.location.search).get('q');
if (kataDariUrl) {
    fCari.value = kataDariUrl;
    ambil('cari').value = kataDariUrl;
}

tampilkan();