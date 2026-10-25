// ===== data-kas.js =====
// Berisi data contoh (belum pakai database) dan fungsi bantu yang dipakai halaman-halaman kas.
// Nanti di tahap coding, data ini diganti dengan data dari MySQL lewat PHP.


// 1. Daftar nama bulan (urutan ke-0 = Januari)
const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// 2. Daftar anggota kelas (data contoh)
const daftarAnggota = [
    { nim: '3312601044', nama: 'Ariel' },
    { nim: '3312601045', nama: 'Charisa Dwi Putri' },
    { nim: '3312601046', nama: 'Budi Utomo' },
    { nim: '3312601047', nama: 'Siti Aminah' },
    { nim: '3312601048', nama: 'Rizky Pratama' },
    { nim: '3312601049', nama: 'Dewi Lestari' },
    { nim: '3312601050', nama: 'Andi Saputra' },
    { nim: '3312601051', nama: 'Nur Halimah' },
    { nim: '3312601052', nama: 'Fajar Nugroho' }
];

// 3. Daftar jenis iuran = kategori pengeluaran (bisa ditambah, diubah, dihapus)
const daftarJenisIuran = [
    { id: 1, nama: 'Alat Tulis' },
    { id: 2, nama: 'Fotokopi & Cetak' },
    { id: 3, nama: 'Konsumsi' },
    { id: 4, nama: 'Lain-lain' }
];

// 4. Pengaturan umum
const nominalIuran = 50000;                    // iuran per bulan
const bulanSekarang = 10;                      // bulan berjalan = Oktober
const tahunData = 2026;                        // tahun data contoh
const bulanDenganData = [5, 6, 7, 8, 9, 10];   // bulan yang punya transaksi (Mei - Oktober)

// 5. Daftar semester (Ganjil: Agustus - Januari, Genap: Februari - Juli)
const daftarSemester = [
    { nama: 'Genap 2025/2026',  mulai: '2026-02-01', akhir: '2026-07-31' },
    { nama: 'Ganjil 2026/2027', mulai: '2026-08-01', akhir: '2027-01-31' }
];

// 6. Batas tanggal untuk menghitung "semua waktu"
const awalWaktu = '0000-01-01';
const akhirWaktu = '9999-12-31';


// 7. Fungsi bantu -----------------------------------------------------------

// Mengambil elemen HTML berdasarkan id
function ambil(id) {
    return document.getElementById(id);
}

// Mengubah angka 5 menjadi teks "05"
function duaDigit(angka) {
    return String(angka).padStart(2, '0');
}

// Membuat teks tanggal format tahun-bulan-hari, contoh: buatTanggal(5, 1) -> "2026-05-01"
function buatTanggal(bulan, hari) {
    return tahunData + '-' + duaDigit(bulan) + '-' + duaDigit(hari);
}

// Mengubah angka menjadi format rupiah, contoh: 50000 -> "Rp 50.000"
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// Mengubah "2026-10-08" menjadi "08/10/2026"
function formatTanggal(teks) {
    const bagian = teks.split('-');
    return bagian[2] + '/' + bagian[1] + '/' + bagian[0];
}

// Mencari nama anggota dari NIM (kalau tidak ada, hasilnya "-")
function cariNamaAnggota(nim) {
    for (let i = 0; i < daftarAnggota.length; i++) {
        if (daftarAnggota[i].nim === nim) {
            return daftarAnggota[i].nama;
        }
    }
    return '-';
}

// Mencari nama jenis iuran dari id (kalau tidak ada, hasilnya "-")
function cariNamaJenis(id) {
    for (let i = 0; i < daftarJenisIuran.length; i++) {
        if (daftarJenisIuran[i].id === id) {
            return daftarJenisIuran[i].nama;
        }
    }
    return '-';
}


// 8. Data transaksi (contoh) ------------------------------------------------
// Setiap transaksi punya: id, tanggal, jenis ('masuk' atau 'keluar'), nim, idJenis, keterangan, nominal
const daftarTransaksi = [];

// 8a. Pemasukan iuran: jumlah anggota yang sudah membayar di setiap bulan
const jumlahPembayar = { 5: 7, 6: 8, 7: 9, 8: 9, 9: 8, 10: 6 };

for (let i = 0; i < bulanDenganData.length; i++) {
    const bulan = bulanDenganData[i];
    const banyak = jumlahPembayar[bulan];

    for (let j = 0; j < banyak; j++) {
        daftarTransaksi.push({
            tanggal: buatTanggal(bulan, j + 1),
            jenis: 'masuk',
            nim: daftarAnggota[j].nim,
            idJenis: 0,
            keterangan: 'Iuran Bulan ' + namaBulan[bulan - 1] + ' ' + tahunData,
            nominal: nominalIuran
        });
    }
}

// 8b. Pengeluaran kas (idJenis mengacu ke daftarJenisIuran)
daftarTransaksi.push({ tanggal: '2026-05-20', jenis: 'keluar', nim: '', idJenis: 1, keterangan: 'Beli spidol & penghapus', nominal: 45000 });
daftarTransaksi.push({ tanggal: '2026-07-15', jenis: 'keluar', nim: '', idJenis: 2, keterangan: 'Fotokopi materi',        nominal: 120000 });
daftarTransaksi.push({ tanggal: '2026-09-10', jenis: 'keluar', nim: '', idJenis: 2, keterangan: 'Cetak banner kelas',     nominal: 150000 });
daftarTransaksi.push({ tanggal: '2026-10-08', jenis: 'keluar', nim: '', idJenis: 3, keterangan: 'Konsumsi rapat kelas',   nominal: 85000 });

// 8c. Beri nomor id urut pada setiap transaksi
for (let k = 0; k < daftarTransaksi.length; k++) {
    daftarTransaksi[k].id = k + 1;
}


// 9. Fungsi hitung dan cari -------------------------------------------------

// Menjumlahkan nominal transaksi dengan jenis tertentu pada rentang tanggal tertentu
function hitungTotal(jenis, tanggalMulai, tanggalAkhir) {
    let total = 0;

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const t = daftarTransaksi[i];

        if (t.jenis === jenis && t.tanggal >= tanggalMulai && t.tanggal <= tanggalAkhir) {
            total = total + t.nominal;
        }
    }

    return total;
}

// Saldo kas = total pemasukan - total pengeluaran (FR-06)
function hitungSaldo() {
    return hitungTotal('masuk', awalWaktu, akhirWaktu) - hitungTotal('keluar', awalWaktu, akhirWaktu);
}

// Mengecek apakah seorang anggota sudah membayar iuran pada bulan tertentu
function sudahBayar(anggota, bulan) {
    const kataKunci = 'Iuran Bulan ' + namaBulan[bulan - 1];

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const t = daftarTransaksi[i];

        if (t.jenis === 'masuk' && t.nim === anggota.nim && t.keterangan.includes(kataKunci)) {
            return true;
        }
    }

    return false;
}

// Menghitung berapa transaksi pengeluaran yang memakai jenis iuran tertentu
function hitungPemakaianJenis(idJenis) {
    let jumlah = 0;

    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].jenis === 'keluar' && daftarTransaksi[i].idJenis === idJenis) {
            jumlah = jumlah + 1;
        }
    }

    return jumlah;
}

// Mencari satu transaksi dari id-nya (kalau tidak ada, hasilnya null)
function cariTransaksi(id) {
    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].id === id) {
            return daftarTransaksi[i];
        }
    }
    return null;
}

// Membuat nomor id baru = id terbesar + 1
function nomorTransaksiBerikut() {
    let terbesar = 0;

    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].id > terbesar) {
            terbesar = daftarTransaksi[i].id;
        }
    }

    return terbesar + 1;
}

function nomorJenisBerikut() {
    let terbesar = 0;

    for (let i = 0; i < daftarJenisIuran.length; i++) {
        if (daftarJenisIuran[i].id > terbesar) {
            terbesar = daftarJenisIuran[i].id;
        }
    }

    return terbesar + 1;
}

// Mengurutkan transaksi dari tanggal terbaru (tanggal sama: id terbesar lebih dulu)
function urutkanTransaksi() {
    const salinan = daftarTransaksi.slice();   // disalin supaya urutan data asli tidak berubah

    salinan.sort(function (a, b) {
        if (a.tanggal < b.tanggal) { return 1; }
        if (a.tanggal > b.tanggal) { return -1; }
        return b.id - a.id;
    });

    return salinan;
}