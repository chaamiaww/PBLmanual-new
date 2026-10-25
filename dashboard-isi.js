// ===== dashboard-isi.js =====
// Halaman Beranda (dashboard Bendahara): kartu ringkasan, grafik, status iuran, transaksi terbaru (FR-06)
// Membutuhkan data-kas.js (dimuat lebih dulu di dashboard.html)


// 1. Ambil elemen yang dibutuhkan, simpan ke variabel
const kartuSaldo       = ambil('saldo-kas');
const kartuPemasukan   = ambil('total-pemasukan');
const kartuPengeluaran = ambil('total-pengeluaran');
const ketPemasukan     = ambil('ket-pemasukan');
const ketPengeluaran   = ambil('ket-pengeluaran');
const subjudulGrafik   = ambil('subjudul-grafik');
const areaGrafik       = ambil('grafik');
const teksLunas        = ambil('teks-lunas');
const batangProgres    = ambil('progres');
const daftarBelumBayar = ambil('daftar-belum');
const filterPeriode    = ambil('filter-periode');
const filterAnggota    = ambil('filter-anggota');
const isiTransaksi     = ambil('isi-transaksi');


// 2. Semester yang ditampilkan di Beranda = semester berjalan (Ganjil 2026/2027)
const semesterBerjalan = daftarSemester[1];

// Enam bulan dalam semester itu (bulan yang belum ada datanya tampil kosong)
const bulanSemester = [
    { bulan: 8,  tahun: 2026 },
    { bulan: 9,  tahun: 2026 },
    { bulan: 10, tahun: 2026 },
    { bulan: 11, tahun: 2026 },
    { bulan: 12, tahun: 2026 },
    { bulan: 1,  tahun: 2027 }
];

// Tinggi batang paling panjang di grafik (dalam piksel)
const tinggiMaksimal = 160;


// 3. Tiga kartu ringkasan di bagian atas
function tampilkanKartu() {
    // Saldo dihitung dari semua transaksi, karena sisa kas terbawa dari semester sebelumnya
    kartuSaldo.textContent = formatRupiah(hitungSaldo());

    // Total pemasukan dan pengeluaran hanya untuk semester berjalan
    kartuPemasukan.textContent   = formatRupiah(hitungTotal('masuk', semesterBerjalan.mulai, semesterBerjalan.akhir));
    kartuPengeluaran.textContent = formatRupiah(hitungTotal('keluar', semesterBerjalan.mulai, semesterBerjalan.akhir));

    ketPemasukan.textContent   = 'Semester ' + semesterBerjalan.nama;
    ketPengeluaran.textContent = 'Semester ' + semesterBerjalan.nama;
}


// 4. Grafik batang pemasukan vs pengeluaran

// Menghitung total pemasukan dan pengeluaran dalam satu bulan
function hitungPerBulan(tahun, bulan) {
    const awal  = tahun + '-' + duaDigit(bulan) + '-01';
    const akhir = tahun + '-' + duaDigit(bulan) + '-31';

    return {
        pemasukan:   hitungTotal('masuk', awal, akhir),
        pengeluaran: hitungTotal('keluar', awal, akhir)
    };
}

function tampilkanGrafik() {
    subjudulGrafik.textContent = 'Semester ' + semesterBerjalan.nama;

    // Cari nilai terbesar dari semua bulan, supaya batang tertinggi pas dengan tinggiMaksimal
    let terbesar = 1;

    for (let i = 0; i < bulanSemester.length; i++) {
        const total = hitungPerBulan(bulanSemester[i].tahun, bulanSemester[i].bulan);

        if (total.pemasukan > terbesar) {
            terbesar = total.pemasukan;
        }
        if (total.pengeluaran > terbesar) {
            terbesar = total.pengeluaran;
        }
    }

    // Buat sepasang batang untuk setiap bulan: tinggi batang = nilai dibagi nilai terbesar
    let isi = '';

    for (let i = 0; i < bulanSemester.length; i++) {
        const bulan = bulanSemester[i].bulan;
        const total = hitungPerBulan(bulanSemester[i].tahun, bulan);
        const tinggiMasuk  = total.pemasukan / terbesar * tinggiMaksimal;
        const tinggiKeluar = total.pengeluaran / terbesar * tinggiMaksimal;

        isi += '<div class="kolom">' +
            '<div class="pasang">' +
                '<i class="batang batang-masuk" style="height: ' + tinggiMasuk + 'px"></i>' +
                '<i class="batang batang-keluar" style="height: ' + tinggiKeluar + 'px"></i>' +
            '</div>' +
            '<span>' + namaBulan[bulan - 1].slice(0, 3) + '</span>' +
            '</div>';
    }

    areaGrafik.innerHTML = isi;
}


// 5. Status iuran bulan berjalan

// Mengambil huruf pertama nama depan dan nama belakang: "Budi Utomo" -> "BU"
function ambilInisial(nama) {
    const kata = nama.trim().split(' ');
    let inisial = kata[0][0];

    if (kata.length > 1) {
        inisial = inisial + kata[kata.length - 1][0];
    }

    return inisial.toUpperCase();
}

function tampilkanStatusIuran() {
    let jumlahLunas = 0;
    let daftar = '';

    for (let i = 0; i < daftarAnggota.length; i++) {
        const anggota = daftarAnggota[i];

        if (sudahBayar(anggota, bulanSekarang)) {
            jumlahLunas = jumlahLunas + 1;
        } else {
            // Anggota yang belum bayar masuk ke daftar
            daftar += '<div class="baris-anggota">' +
                '<span class="avatar-kecil">' + ambilInisial(anggota.nama) + '</span>' +
                '<span class="nama">' + anggota.nama + '</span>' +
                '<span class="lbl lbl-merah">Belum Bayar</span>' +
                '</div>';
        }
    }

    const persen = jumlahLunas / daftarAnggota.length * 100;

    teksLunas.textContent = jumlahLunas + ' dari ' + daftarAnggota.length + ' anggota lunas';
    batangProgres.style.width = persen + '%';
    daftarBelumBayar.innerHTML = daftar;
}


// 6. Pilihan filter: periode (per bulan) dan anggota
function isiPilihanFilter() {
    let periode = '<option value="">Semua periode</option>';

    for (let i = 0; i < bulanDenganData.length; i++) {
        const bulan = bulanDenganData[i];
        periode += '<option value="' + bulan + '">' + namaBulan[bulan - 1] + ' ' + tahunData + '</option>';
    }
    filterPeriode.innerHTML = periode;

    let anggota = '<option value="">Semua anggota</option>';

    for (let i = 0; i < daftarAnggota.length; i++) {
        anggota += '<option value="' + daftarAnggota[i].nim + '">' + daftarAnggota[i].nama + '</option>';
    }
    filterAnggota.innerHTML = anggota;
}


// 7. Tabel ringkasan: lima transaksi terbaru yang sesuai filter
function tampilkanTransaksi() {
    const urut = urutkanTransaksi();
    let isi = '';
    let sudahTampil = 0;

    for (let i = 0; i < urut.length; i++) {
        const t = urut[i];

        // Berhenti kalau sudah ada 5 baris
        if (sudahTampil === 5) {
            break;
        }

        // Filter periode: lewati transaksi di luar bulan yang dipilih
        if (filterPeriode.value !== '') {
            const bulan = Number(filterPeriode.value);

            if (t.tanggal < buatTanggal(bulan, 1) || t.tanggal > buatTanggal(bulan, 31)) {
                continue;
            }
        }
        // Filter anggota: pengeluaran tidak punya anggota, jadi ikut disembunyikan
        if (filterAnggota.value !== '' && t.nim !== filterAnggota.value) {
            continue;
        }

        // Pemasukan: label hijau dan nominal plus. Pengeluaran: label merah, nominal minus, plus jenis iuran
        let label = '<span class="lbl lbl-hijau">Pemasukan</span>';
        let nominal = '<span class="teks-hijau">+ ' + formatRupiah(t.nominal) + '</span>';
        let keterangan = t.keterangan;

        if (t.jenis === 'keluar') {
            label = '<span class="lbl lbl-merah">Pengeluaran</span>';
            nominal = '<span class="teks-merah">- ' + formatRupiah(t.nominal) + '</span>';
            keterangan = t.keterangan + '<span class="kecil">Jenis iuran: ' + cariNamaJenis(t.idJenis) + '</span>';
        }

        isi += '<tr>' +
            '<td>' + formatTanggal(t.tanggal) + '</td>' +
            '<td>' + label + '</td>' +
            '<td>' + cariNamaAnggota(t.nim) + '</td>' +
            '<td>' + keterangan + '</td>' +
            '<td>' + nominal + '</td>' +
            '</tr>';

        sudahTampil = sudahTampil + 1;
    }

    if (isi === '') {
        isi = '<tr><td colspan="5">Tidak ada transaksi untuk filter ini.</td></tr>';
    }

    isiTransaksi.innerHTML = isi;
}


// 8. Pasang pendengar: tabel diperbarui setiap filter diganti
filterPeriode.addEventListener('change', tampilkanTransaksi);
filterAnggota.addEventListener('change', tampilkanTransaksi);

// Kolom pencarian di topbar: tekan Enter untuk mencari di halaman Data Transaksi (FR-05)
ambil('cari').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        window.location.href = 'data-transaksi.html?q=' + encodeURIComponent(this.value);
    }
});


// 9. Jalankan semuanya saat halaman dibuka
isiPilihanFilter();
tampilkanKartu();
tampilkanGrafik();
tampilkanStatusIuran();
tampilkanTransaksi();