// ===== data-kas.js =====
// Sumber data bersama untuk Dashboard, Data Transaksi (dan nanti Laporan, Jenis Iuran).
// Semua data disimpan di localStorage browser, jadi tidak hilang saat halaman di-refresh.
// Nanti di tahap database, bagian "bacaData" dan "simpanData" diganti dengan PHP + MySQL.
//
// Empat "laci" data di localStorage:
//   dataAnggota    : { nim, nama, jabatan, kelas }              (dikelola halaman Data Anggota)
//   dataJenisIuran : { id, nama, nominal, periode }             (tagihan, untuk PEMASUKAN)
//   dataKeperluan  : { id, nama }                               (alasan, untuk PENGELUARAN)
//   dataTransaksi  : { id, tanggal, tipe, nim, idJenis, idKeperluan, bulanIuran, keterangan, nominal }
//                    tipe = 'masuk' atau 'keluar'


// 1. Daftar nama bulan (urutan ke-0 = Januari)
const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// 2. Pengaturan umum
// Data contoh dibuat untuk tahun 2026. Kalau sudah memakai data asli, ganti dengan new Date().
const bulanSekarang = 10;
const tahunSekarang = 2026;
const tahunData = tahunSekarang;

// 3. Daftar semester (Ganjil: Agustus - Januari, Genap: Februari - Juli)
const daftarSemester = [
    { nama: 'Genap 2025/2026',  mulai: '2026-02-01', akhir: '2026-07-31' },
    { nama: 'Ganjil 2026/2027', mulai: '2026-08-01', akhir: '2027-01-31' }
];

// 4. Batas tanggal untuk menghitung "semua waktu"
const awalWaktu = '0000-01-01';
const akhirWaktu = '9999-12-31';


// 5. Fungsi bantu umum -------------------------------------------------------

// Mengambil elemen HTML berdasarkan id
function ambil(id) {
    return document.getElementById(id);
}

// Mengubah angka 5 menjadi teks "05"
function duaDigit(angka) {
    return String(angka).padStart(2, '0');
}

// Membuat teks tanggal, contoh: buatTanggal(5, 1) -> "2026-05-01"
function buatTanggal(bulan, hari) {
    return tahunData + '-' + duaDigit(bulan) + '-' + duaDigit(hari);
}

// Mengubah angka menjadi format rupiah, contoh: 10000 -> "Rp 10.000"
function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

// Mengubah "2026-10-08" menjadi "08/10/2026"
function formatTanggal(teks) {
    const bagian = teks.split('-');
    return bagian[2] + '/' + bagian[1] + '/' + bagian[0];
}

// Mengubah "2026-10" menjadi "Oktober 2026"
function namaBulanIuran(kode) {
    if (!kode) {
        return '-';
    }
    const bagian = kode.split('-');
    return namaBulan[Number(bagian[1]) - 1] + ' ' + bagian[0];
}

// Mengamankan teks sebelum dimasukkan ke innerHTML (mencegah kode berbahaya)
function esc(teks) {
    return String(teks)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Mengambil huruf pertama nama depan dan belakang: "Budi Utomo" -> "BU"
function inisialNama(nama) {
    const kata = nama.trim().split(/\s+/);
    let inisial = kata[0][0];

    if (kata.length > 1) {
        inisial = inisial + kata[kata.length - 1][0];
    }

    return inisial.toUpperCase();
}


// 6. Membaca dan menyimpan ke localStorage ----------------------------------

function bacaData(kunci, awal) {
    try {
        const teks = localStorage.getItem(kunci);
        if (teks === null) {
            return awal;
        }
        return JSON.parse(teks);
    } catch (err) {
        return awal;
    }
}

// Mengembalikan true kalau berhasil, false kalau gagal
function simpanData(kunci, nilai) {
    try {
        localStorage.setItem(kunci, JSON.stringify(nilai));
        return true;
    } catch (err) {
        return false;
    }
}

// Mengisi data awal HANYA kalau laci itu belum pernah dibuat
function isiAwal(kunci, nilai) {
    try {
        if (localStorage.getItem(kunci) === null) {
            localStorage.setItem(kunci, JSON.stringify(nilai));
        }
    } catch (err) {
        // localStorage tidak tersedia: data awal tetap dipakai dari memori
    }
}


// 7. Data awal (contoh) -----------------------------------------------------

const seedAnggota = [
    { nim: '3312601044', nama: 'Ariel',             jabatan: 'Ketua Kelas', kelas: 'IF-1B' },
    { nim: '3312601045', nama: 'Charisa Dwi Putri', jabatan: 'Bendahara',   kelas: 'IF-1B' },
    { nim: '3312601046', nama: 'Budi Utomo',        jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601047', nama: 'Siti Aminah',       jabatan: 'Sekretaris',  kelas: 'IF-1B' },
    { nim: '3312601048', nama: 'Rizky Pratama',     jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601049', nama: 'Dewi Lestari',      jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601050', nama: 'Andi Saputra',      jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601051', nama: 'Nur Halimah',       jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601052', nama: 'Fajar Nugroho',     jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601053', nama: 'Maya Sari',         jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601054', nama: 'Dimas Prasetyo',    jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601055', nama: 'Putri Rahayu',      jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601056', nama: 'Hendra Wijaya',     jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601057', nama: 'Lina Marlina',      jabatan: 'Anggota',     kelas: 'IF-1B' },
    { nim: '3312601058', nama: 'Yoga Permana',      jabatan: 'Anggota',     kelas: 'IF-1B' }
];

// Jenis iuran = tagihan untuk PEMASUKAN
const seedJenisIuran = [
    { id: 1, nama: 'Kas Bulanan',    nominal: 10000, periode: 'Per Bulan' },
    { id: 2, nama: 'Iuran Kegiatan', nominal: 20000, periode: 'Per Semester' },
    { id: 3, nama: 'Kas Tambahan',   nominal: 5000,  periode: 'Per Bulan' }
];

// Keperluan = alasan untuk PENGELUARAN (bisa ditambah, diubah, dihapus lewat tombol Kelola)
const seedKeperluan = [
    { id: 1, nama: 'Alat Tulis' },
    { id: 2, nama: 'Fotokopi' },
    { id: 3, nama: 'Konsumsi' },
    { id: 4, nama: 'Kegiatan Kelas' }
];

// Membuat transaksi contoh dari daftar anggota yang ada
function buatTransaksiAwal(anggota) {
    const hasil = [];
    const bulanDenganData = [5, 6, 7, 8, 9, 10];                  // Mei - Oktober
    const jumlahPembayar = { 5: 11, 6: 12, 7: 13, 8: 13, 9: 12, 10: 9 };

    // Pemasukan: setiap bulan beberapa anggota membayar Kas Bulanan (jenis id 1)
    for (let i = 0; i < bulanDenganData.length; i++) {
        const bulan = bulanDenganData[i];
        const banyak = Math.min(jumlahPembayar[bulan], anggota.length);

        for (let j = 0; j < banyak; j++) {
            hasil.push({
                tanggal: buatTanggal(bulan, j + 1),
                tipe: 'masuk',
                nim: anggota[j].nim,
                idJenis: 1,
                idKeperluan: 0,
                bulanIuran: tahunData + '-' + duaDigit(bulan),
                keterangan: '',
                nominal: 10000
            });
        }
    }

    // Pemasukan: 12 anggota membayar Iuran Kegiatan (per semester, jenis id 2) untuk semester Ganjil 2026/2027
    const banyakKegiatan = Math.min(12, anggota.length);

    for (let j = 0; j < banyakKegiatan; j++) {
        hasil.push({
            tanggal: buatTanggal(8, j + 2),
            tipe: 'masuk',
            nim: anggota[j].nim,
            idJenis: 2,
            idKeperluan: 0,
            bulanIuran: tahunData + '-08',
            keterangan: '',
            nominal: 20000
        });
    }

    // Pengeluaran (15 data). idKeperluan: 1 Alat Tulis, 2 Fotokopi, 3 Konsumsi, 4 Kegiatan Kelas
    const pengeluaran = [
        ['2026-05-20', 1, 'Beli spidol & penghapus',          45000],
        ['2026-05-28', 2, 'Fotokopi soal latihan',            35000],
        ['2026-06-05', 3, 'Konsumsi rapat akhir semester',    60000],
        ['2026-06-18', 4, 'Perlengkapan perpisahan semester', 80000],
        ['2026-07-02', 1, 'Beli penghapus papan tulis',       25000],
        ['2026-07-15', 2, 'Fotokopi materi',                  60000],
        ['2026-07-25', 3, 'Konsumsi kerja bakti kelas',       50000],
        ['2026-08-14', 4, 'Lomba 17 Agustus antar kelas',     90000],
        ['2026-08-20', 1, 'Spidol dan kertas HVS',            30000],
        ['2026-09-03', 2, 'Fotokopi modul praktikum',         40000],
        ['2026-09-10', 2, 'Cetak tugas kelompok',             70000],
        ['2026-09-22', 3, 'Konsumsi rapat kelas',             55000],
        ['2026-10-02', 1, 'Beli lakban dan stapler',          20000],
        ['2026-10-08', 3, 'Konsumsi rapat kelas',             85000],
        ['2026-10-15', 4, 'Perlengkapan kegiatan kelas',      75000]
    ];

    for (let p = 0; p < pengeluaran.length; p++) {
        hasil.push({
            tanggal: pengeluaran[p][0],
            tipe: 'keluar',
            nim: '',
            idJenis: 0,
            idKeperluan: pengeluaran[p][1],
            bulanIuran: '',
            keterangan: pengeluaran[p][2],
            nominal: pengeluaran[p][3]
        });
    }

    // Beri nomor id urut
    for (let k = 0; k < hasil.length; k++) {
        hasil[k].id = k + 1;
    }

    return hasil;
}

// Isi laci data kalau belum ada (urutannya penting: anggota dulu, baru transaksi)
isiAwal('dataAnggota', seedAnggota);
isiAwal('dataJenisIuran', seedJenisIuran);
isiAwal('dataKeperluan', seedKeperluan);

// Daftar yang dipakai halaman-halaman
let daftarAnggota    = bacaData('dataAnggota', seedAnggota);
let daftarJenisIuran = bacaData('dataJenisIuran', seedJenisIuran);
let daftarKeperluan  = bacaData('dataKeperluan', seedKeperluan);

isiAwal('dataTransaksi', buatTransaksiAwal(daftarAnggota));
let daftarTransaksi  = bacaData('dataTransaksi', buatTransaksiAwal(daftarAnggota));


// 8. Fungsi simpan per daftar -------------------------------------------------
function simpanTransaksi() { return simpanData('dataTransaksi', daftarTransaksi); }
function simpanKeperluan() { return simpanData('dataKeperluan', daftarKeperluan); }
function simpanJenisIuran() { return simpanData('dataJenisIuran', daftarJenisIuran); }


// 9. Fungsi cari --------------------------------------------------------------

function cariAnggota(nim) {
    for (let i = 0; i < daftarAnggota.length; i++) {
        if (daftarAnggota[i].nim === nim) {
            return daftarAnggota[i];
        }
    }
    return null;
}

// Mencari nama anggota dari NIM (kalau tidak ada, hasilnya "-")
function cariNamaAnggota(nim) {
    const a = cariAnggota(nim);
    return a === null ? '-' : a.nama;
}

function cariJenis(id) {
    for (let i = 0; i < daftarJenisIuran.length; i++) {
        if (daftarJenisIuran[i].id === id) {
            return daftarJenisIuran[i];
        }
    }
    return null;
}

function cariNamaJenis(id) {
    const j = cariJenis(id);
    return j === null ? '-' : j.nama;
}

function cariNamaKeperluan(id) {
    for (let i = 0; i < daftarKeperluan.length; i++) {
        if (daftarKeperluan[i].id === id) {
            return daftarKeperluan[i].nama;
        }
    }
    return '-';
}

// Teks untuk kolom "Jenis Iuran / Keperluan"
function namaJenisAtauKeperluan(t) {
    return t.tipe === 'masuk' ? cariNamaJenis(t.idJenis) : cariNamaKeperluan(t.idKeperluan);
}

function cariTransaksi(id) {
    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].id === id) {
            return daftarTransaksi[i];
        }
    }
    return null;
}

// Nomor id baru = id terbesar + 1 (dipakai untuk daftar apa saja yang punya field id)
function nomorBerikut(daftar) {
    let terbesar = 0;

    for (let i = 0; i < daftar.length; i++) {
        if (daftar[i].id > terbesar) {
            terbesar = daftar[i].id;
        }
    }

    return terbesar + 1;
}


// 10. Fungsi hitung ------------------------------------------------------------

// Menjumlahkan nominal transaksi bertipe tertentu pada rentang tanggal tertentu
function hitungTotal(tipe, tanggalMulai, tanggalAkhir) {
    let total = 0;

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const t = daftarTransaksi[i];

        if (t.tipe === tipe && t.tanggal >= tanggalMulai && t.tanggal <= tanggalAkhir) {
            total = total + t.nominal;
        }
    }

    return total;
}

// Saldo kas = total pemasukan - total pengeluaran (FR-06)
function hitungSaldo() {
    return hitungTotal('masuk', awalWaktu, akhirWaktu) - hitungTotal('keluar', awalWaktu, akhirWaktu);
}

// Jenis iuran yang dipakai untuk status Lunas/Belum Bayar bulanan = jenis pertama berperiode "Per Bulan"
function jenisWajib() {
    for (let i = 0; i < daftarJenisIuran.length; i++) {
        if (daftarJenisIuran[i].periode === 'Per Bulan') {
            return daftarJenisIuran[i];
        }
    }
    return null;
}

// Mengecek apakah seorang anggota sudah membayar jenis iuran tertentu untuk bulan tertentu
function sudahBayar(nim, bulan, tahun, idJenis) {
    const kode = tahun + '-' + duaDigit(bulan);

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const t = daftarTransaksi[i];

        if (t.tipe === 'masuk' && t.nim === nim && t.idJenis === idJenis && t.bulanIuran === kode) {
            return true;
        }
    }

    return false;
}

// Menghitung anggota yang belum membayar iuran wajib bulan itu (angka "Tunggakan")
function hitungTunggakan(bulan, tahun) {
    const jenis = jenisWajib();

    if (jenis === null) {
        return 0;
    }

    let belum = 0;

    for (let i = 0; i < daftarAnggota.length; i++) {
        if (!sudahBayar(daftarAnggota[i].nim, bulan, tahun, jenis.id)) {
            belum = belum + 1;
        }
    }

    return belum;
}

// Berapa transaksi yang memakai data master tertentu (untuk aturan: master yang dipakai tidak boleh dihapus)
function hitungPemakaianJenis(idJenis) {
    let jumlah = 0;
    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].tipe === 'masuk' && daftarTransaksi[i].idJenis === idJenis) {
            jumlah = jumlah + 1;
        }
    }
    return jumlah;
}

function hitungPemakaianKeperluan(idKeperluan) {
    let jumlah = 0;
    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].tipe === 'keluar' && daftarTransaksi[i].idKeperluan === idKeperluan) {
            jumlah = jumlah + 1;
        }
    }
    return jumlah;
}

function hitungPemakaianAnggota(nim) {
    let jumlah = 0;
    for (let i = 0; i < daftarTransaksi.length; i++) {
        if (daftarTransaksi[i].nim === nim) {
            jumlah = jumlah + 1;
        }
    }
    return jumlah;
}

// Semester berjalan = semester terakhir di daftarSemester
function ambilSemesterBerjalan() {
    return daftarSemester[daftarSemester.length - 1];
}

// Daftar kode bulan dalam satu semester, contoh: ['2026-08', '2026-09', ..., '2027-01']
function kodeBulanSemester(semester) {
    const hasil = [];

    let tahun = Number(semester.mulai.slice(0, 4));
    let bulan = Number(semester.mulai.slice(5, 7));
    const tahunAkhir = Number(semester.akhir.slice(0, 4));
    const bulanAkhir = Number(semester.akhir.slice(5, 7));

    while (tahun < tahunAkhir || (tahun === tahunAkhir && bulan <= bulanAkhir)) {
        hasil.push(tahun + '-' + duaDigit(bulan));
        bulan = bulan + 1;

        if (bulan > 12) {
            bulan = 1;
            tahun = tahun + 1;
        }
    }

    return hasil;
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