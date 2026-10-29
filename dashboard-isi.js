// ===== dashboard-isi.js =====
// Halaman Dashboard Bendahara: kartu ringkasan, grafik, status iuran, transaksi terbaru (FR-06)
// Membutuhkan data-kas.js dan modal-transaksi.js (dimuat lebih dulu di dashboard.html)


// 1. Ambil elemen yang dibutuhkan, simpan ke variabel
const kartuSaldo       = ambil('saldo-kas');
const kartuPemasukan   = ambil('total-pemasukan');
const kartuPengeluaran = ambil('total-pengeluaran');
const kartuTunggakan   = ambil('total-tunggakan');
const ketPemasukan     = ambil('ket-pemasukan');
const ketPengeluaran   = ambil('ket-pengeluaran');
const ketTunggakan     = ambil('ket-tunggakan');
const subjudulGrafik   = ambil('subjudul-grafik');
const areaGrafik       = ambil('grafik');
const sumbuY           = ambil('sumbu-y');
const judulStatus      = ambil('judul-status');
const teksLunas        = ambil('teks-lunas');
const batangProgres    = ambil('progres');
const daftarBelumBayar = ambil('daftar-belum');
const filterPeriode    = ambil('filter-periode');
const filterAnggota    = ambil('filter-anggota');
const isiTransaksi     = ambil('isi-transaksi');


// 2. Semester yang ditampilkan = semester berjalan (Ganjil 2026/2027)
const semesterBerjalan = ambilSemesterBerjalan();

// Tinggi batang paling panjang di grafik (dalam piksel)
const tinggiMaksimal = 160;

// Jumlah baris di tabel ringkasan
const maksTransaksi = 5;


// 3. Empat kartu ringkasan di bagian atas
function tampilkanKartu() {
    // Saldo dihitung dari semua transaksi, karena sisa kas terbawa dari semester sebelumnya
    kartuSaldo.textContent = formatRupiah(hitungSaldo());

    // Total pemasukan dan pengeluaran hanya untuk semester berjalan
    kartuPemasukan.textContent   = formatRupiah(hitungTotal('masuk', semesterBerjalan.mulai, semesterBerjalan.akhir));
    kartuPengeluaran.textContent = formatRupiah(hitungTotal('keluar', semesterBerjalan.mulai, semesterBerjalan.akhir));

    ketPemasukan.textContent   = 'Semester ' + semesterBerjalan.nama;
    ketPengeluaran.textContent = 'Semester ' + semesterBerjalan.nama;

    // Tunggakan = anggota yang belum membayar iuran wajib bulan ini
    kartuTunggakan.textContent = hitungTunggakan(bulanSekarang, tahunSekarang) + ' anggota';
    ketTunggakan.textContent   = 'Belum membayar ' + namaBulan[bulanSekarang - 1];
}


// 4. Grafik batang pemasukan vs pengeluaran

// Daftar bulan dalam semester berjalan, contoh: Agustus 2026 sampai Januari 2027
function bulanDalamSemester() {
    const hasil = [];
    const awal  = semesterBerjalan.mulai.split('-');
    const akhir = semesterBerjalan.akhir.split('-');

    let tahun = Number(awal[0]);
    let bulan = Number(awal[1]);
    const tahunAkhir = Number(akhir[0]);
    const bulanAkhir = Number(akhir[1]);

    while (tahun < tahunAkhir || (tahun === tahunAkhir && bulan <= bulanAkhir)) {
        hasil.push({ tahun: tahun, bulan: bulan });
        bulan = bulan + 1;

        if (bulan > 12) {
            bulan = 1;
            tahun = tahun + 1;
        }
    }

    return hasil;
}

// Menghitung total pemasukan dan pengeluaran dalam satu bulan
function hitungPerBulan(tahun, bulan) {
    const awal  = tahun + '-' + duaDigit(bulan) + '-01';
    const akhir = tahun + '-' + duaDigit(bulan) + '-31';

    return {
        pemasukan:   hitungTotal('masuk', awal, akhir),
        pengeluaran: hitungTotal('keluar', awal, akhir)
    };
}

// Mempersingkat angka untuk label sumbu: 25000 -> "25 rb", 1500000 -> "1,5 jt"
function singkatRupiah(angka) {
    if (angka >= 1000000) {
        return (angka / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
    }
    if (angka >= 1000) {
        return (angka / 1000) + ' rb';
    }
    return String(angka);
}

function tampilkanGrafik() {
    subjudulGrafik.textContent = 'Semester ' + semesterBerjalan.nama;

    const bulanBulan = bulanDalamSemester();

    // Cari nilai terbesar dari semua bulan
    let terbesar = 0;

    for (let i = 0; i < bulanBulan.length; i++) {
        const total = hitungPerBulan(bulanBulan[i].tahun, bulanBulan[i].bulan);

        if (total.pemasukan > terbesar) {
            terbesar = total.pemasukan;
        }
        if (total.pengeluaran > terbesar) {
            terbesar = total.pengeluaran;
        }
    }

    // Skala sumbu: 4 selang, kelipatan 5.000 (batas atas minimal 20.000)
    const selang = Math.max(5000, Math.ceil(terbesar / 4 / 5000) * 5000);
    const batasAtas = selang * 4;

    // Label sumbu Y dari atas ke bawah
    let label = '';
    for (let n = 4; n >= 0; n--) {
        label += '<span>' + singkatRupiah(selang * n) + '</span>';
    }
    sumbuY.innerHTML = label;

    // Sepasang batang untuk setiap bulan: tinggi batang = nilai dibagi batas atas
    let isi = '';

    for (let i = 0; i < bulanBulan.length; i++) {
        const bulan = bulanBulan[i].bulan;
        const total = hitungPerBulan(bulanBulan[i].tahun, bulan);
        const tinggiMasuk  = total.pemasukan / batasAtas * tinggiMaksimal;
        const tinggiKeluar = total.pengeluaran / batasAtas * tinggiMaksimal;

        isi += '<div class="kolom-grafik">' +
            '<div class="pasang">' +
                '<i class="batang batang-masuk" style="height: ' + tinggiMasuk + 'px" title="Pemasukan ' + formatRupiah(total.pemasukan) + '"></i>' +
                '<i class="batang batang-keluar" style="height: ' + tinggiKeluar + 'px" title="Pengeluaran ' + formatRupiah(total.pengeluaran) + '"></i>' +
            '</div>' +
            '<span>' + namaBulan[bulan - 1].slice(0, 3) + '</span>' +
            '</div>';
    }

    areaGrafik.innerHTML = isi;
}


// 5. Status iuran bulan berjalan
function tampilkanStatusIuran() {
    const jenis = jenisWajib();

    judulStatus.textContent = 'Status Iuran ' + namaBulan[bulanSekarang - 1];

    // Belum ada jenis iuran bulanan: tidak ada yang bisa dihitung
    if (jenis === null) {
        teksLunas.textContent = 'Belum ada jenis iuran bulanan';
        batangProgres.style.width = '0%';
        daftarBelumBayar.innerHTML = '';
        return;
    }

    if (daftarAnggota.length === 0) {
        teksLunas.textContent = 'Belum ada anggota';
        batangProgres.style.width = '0%';
        daftarBelumBayar.innerHTML = '';
        return;
    }

    let jumlahLunas = 0;
    let daftar = '';

    for (let i = 0; i < daftarAnggota.length; i++) {
        const anggota = daftarAnggota[i];

        if (sudahBayar(anggota.nim, bulanSekarang, tahunSekarang, jenis.id)) {
            jumlahLunas = jumlahLunas + 1;
        } else {
            // Anggota yang belum bayar masuk ke daftar
            daftar += '<div class="baris-anggota">' +
                '<span class="avatar-kecil">' + esc(inisialNama(anggota.nama)) + '</span>' +
                '<span class="nama">' + esc(anggota.nama) + '</span>' +
                '<span class="lbl lbl-merah">Belum Bayar</span>' +
                '</div>';
        }
    }

    if (daftar === '') {
        daftar = '<p class="keterangan-kecil">Semua anggota sudah lunas.</p>';
    }

    const persen = jumlahLunas / daftarAnggota.length * 100;

    teksLunas.textContent = jumlahLunas + ' dari ' + daftarAnggota.length + ' anggota lunas (' + jenis.nama + ')';
    batangProgres.style.width = persen + '%';
    daftarBelumBayar.innerHTML = daftar;
}


// 6. Pilihan filter: periode (per bulan) dan anggota
function isiPilihanFilter() {
    // ingat pilihan sekarang supaya tidak hilang saat daftar diperbarui
    const periodeLama = filterPeriode.value;
    const anggotaLama = filterAnggota.value;

    // bulan yang punya transaksi, diambil dari data (terbaru di atas)
    const bulanAda = [];

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const kode = daftarTransaksi[i].tanggal.slice(0, 7);

        if (bulanAda.indexOf(kode) < 0) {
            bulanAda.push(kode);
        }
    }
    bulanAda.sort().reverse();

    let periode = '<option value="">Semua periode</option>';

    for (let i = 0; i < bulanAda.length; i++) {
        periode += '<option value="' + bulanAda[i] + '">' + namaBulanIuran(bulanAda[i]) + '</option>';
    }
    filterPeriode.innerHTML = periode;
    filterPeriode.value = periodeLama;

    let anggota = '<option value="">Semua anggota</option>';

    for (let i = 0; i < daftarAnggota.length; i++) {
        anggota += '<option value="' + esc(daftarAnggota[i].nim) + '">' + esc(daftarAnggota[i].nama) + '</option>';
    }
    filterAnggota.innerHTML = anggota;
    filterAnggota.value = anggotaLama;
}


// 7. Tabel ringkasan: lima transaksi terbaru yang sesuai filter
function tampilkanTransaksi() {
    const urut = urutkanTransaksi();
    let isi = '';
    let sudahTampil = 0;

    for (let i = 0; i < urut.length; i++) {
        const t = urut[i];

        // Berhenti kalau sudah ada 5 baris
        if (sudahTampil === maksTransaksi) {
            break;
        }

        // Filter periode: lewati transaksi di luar bulan yang dipilih
        if (filterPeriode.value !== '' && t.tanggal.slice(0, 7) !== filterPeriode.value) {
            continue;
        }

        // Filter anggota: pengeluaran tidak punya anggota, jadi ikut disembunyikan
        if (filterAnggota.value !== '' && t.nim !== filterAnggota.value) {
            continue;
        }

        // Pemasukan: label hijau dan nominal plus. Pengeluaran: label merah dan nominal minus
        let label = '<span class="lbl lbl-hijau">Pemasukan</span>';
        let nominal = '<span class="teks-hijau">+ ' + formatRupiah(t.nominal) + '</span>';

        if (t.tipe === 'keluar') {
            label = '<span class="lbl lbl-merah">Pengeluaran</span>';
            nominal = '<span class="teks-merah">- ' + formatRupiah(t.nominal) + '</span>';
        }

        isi += '<tr>' +
            '<td>' + formatTanggal(t.tanggal) + '</td>' +
            '<td>' + label + '</td>' +
            '<td>' + esc(cariNamaAnggota(t.nim)) + '</td>' +
            '<td>' + esc(namaJenisAtauKeperluan(t)) + '</td>' +
        '<td>' + (t.tipe === 'masuk' ? namaBulanIuran(t.bulanIuran) : '-') + '</td>' +
            '<td>' + (t.keterangan ? esc(t.keterangan) : '-') + '</td>' +
            '<td>' + nominal + '</td>' +
            '</tr>';

        sudahTampil = sudahTampil + 1;
    }

    if (isi === '') {
        isi = '<tr><td colspan="7">Data tidak ditemukan</td></tr>';
    }

    isiTransaksi.innerHTML = isi;
}


// 8. Muat ulang semua bagian (dipanggil saat halaman dibuka dan setelah menyimpan data)
function tampilkanSemua() {
    isiPilihanFilter();
    tampilkanKartu();
    tampilkanGrafik();
    tampilkanStatusIuran();
    tampilkanTransaksi();
}

// Setelah Catat Pemasukan / Pengeluaran disimpan, dashboard ikut diperbarui
window.setelahSimpan = tampilkanSemua;

// Pasang pendengar: tabel diperbarui setiap filter diganti
filterPeriode.addEventListener('change', tampilkanTransaksi);
filterAnggota.addEventListener('change', tampilkanTransaksi);

// Kolom pencarian di topbar: tekan Enter untuk mencari di halaman Data Transaksi (FR-05)
ambil('cari').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        window.location.href = 'data-transaksi.html?q=' + encodeURIComponent(this.value);
    }
});


// 9. Jalankan semuanya saat halaman dibuka
tampilkanSemua();