// ===== dashboard-anggota.js =====
// Dasbor Anggota (hanya lihat): saldo kas, status iuran saya, tunggakan saya,
// riwayat pembayaran saya, dan tabel pengeluaran kas.
// Anggota TIDAK melihat pembayaran anggota lain (privasi).
// Membutuhkan data-kas.js dan sesi.js (dimuat lebih dulu di dashboard-anggota.html)


// 1. Pastikan yang masuk adalah anggota (kalau bukan, halaman dialihkan)
const saya = jagaHalaman('anggota');

const semesterIni = ambilSemesterBerjalan();
const kodeSekarang = tahunSekarang + '-' + duaDigit(bulanSekarang);


// 2. Pembayaran milik saya, terbaru di atas
function pembayaranSaya() {
    const urut = urutkanTransaksi();
    const hasil = [];

    for (let i = 0; i < urut.length; i++) {
        if (urut[i].tipe === 'masuk' && urut[i].nim === saya.nim) {
            hasil.push(urut[i]);
        }
    }

    return hasil;
}

// Kode bulan di semester ini yang sudah jatuh tempo (sampai bulan sekarang) tetapi belum saya bayar
function bulanTunggakan(jenis) {
    const kode = kodeBulanSemester(semesterIni);
    const hasil = [];

    for (let i = 0; i < kode.length; i++) {
        const bulan = Number(kode[i].slice(5, 7));
        const tahun = Number(kode[i].slice(0, 4));

        if (kode[i] <= kodeSekarang && !sudahBayar(saya.nim, bulan, tahun, jenis.id)) {
            hasil.push(kode[i]);
        }
    }

    return hasil;
}


// 3. Sambutan dan kartu ringkasan
function tampilkanSambutan() {
    ambil('nama-sapa').textContent = saya.nama;
    ambil('avatar-sapa').textContent = inisialNama(saya.nama);
}

function tampilkanKartu() {
    // saldo kas kelas (dihitung dari semua transaksi)
    ambil('saldo-kas').textContent = formatRupiah(hitungSaldo());

    // total iuran saya pada semester ini
    let total = 0;
    const milikku = pembayaranSaya();

    for (let i = 0; i < milikku.length; i++) {
        if (milikku[i].tanggal >= semesterIni.mulai && milikku[i].tanggal <= semesterIni.akhir) {
            total = total + milikku[i].nominal;
        }
    }
    ambil('total-saya').textContent = formatRupiah(total);
    ambil('ket-total').textContent = 'Semester ' + semesterIni.nama;

    // status iuran bulan ini dan tunggakan (memakai iuran bulanan wajib)
    const jenis = jenisWajib();
    ambil('judul-status').textContent = 'Status iuran saya - ' + namaBulan[bulanSekarang - 1];

    if (jenis === null) {
        ambil('status-saya').textContent = '-';
        ambil('ket-status').textContent = 'Belum ada jenis iuran bulanan';
        ambil('tunggakan-saya').textContent = '-';
        ambil('ket-tunggakan').textContent = 'Belum ada jenis iuran bulanan';
        return;
    }

    const lunas = sudahBayar(saya.nim, bulanSekarang, tahunSekarang, jenis.id);

    ambil('status-saya').innerHTML = lunas
        ? '<span class="lbl lbl-hijau">Lunas</span>'
        : '<span class="lbl lbl-merah">Belum Bayar</span>';
    ambil('ket-status').textContent = jenis.nama + ' ' + formatRupiah(jenis.nominal) + ' per bulan';

    const tunggakan = bulanTunggakan(jenis);
    ambil('tunggakan-saya').textContent = tunggakan.length + ' bulan';

    if (tunggakan.length === 0) {
        ambil('ket-tunggakan').textContent = 'Tidak ada tunggakan';
    } else {
        const nama = [];
        for (let i = 0; i < tunggakan.length; i++) {
            nama.push(namaBulan[Number(tunggakan[i].slice(5, 7)) - 1]);
        }
        ambil('ket-tunggakan').textContent = nama.join(', ');
    }
}


// 4. Riwayat pembayaran saya (5 terbaru)
function tampilkanRiwayat() {
    const milikku = pembayaranSaya();
    let isi = '';

    for (let i = 0; i < milikku.length && i < 5; i++) {
        const t = milikku[i];

        isi += '<tr>' +
            '<td>' + formatTanggal(t.tanggal) + '</td>' +
            '<td>' + esc(cariNamaJenis(t.idJenis)) + '</td>' +
            '<td>' + namaBulanIuran(t.bulanIuran) + '</td>' +
            '<td class="teks-hijau">' + formatRupiah(t.nominal) + '</td>' +
            '</tr>';
    }

    if (isi === '') {
        isi = '<tr><td colspan="4">Belum ada pembayaran.</td></tr>';
    }

    ambil('isi-riwayat').innerHTML = isi;
}


// 5. Pengeluaran kas kelas (boleh dilihat semua anggota)
function isiPilihanSemester() {
    let isi = '<option value="">Semua semester</option>';

    for (let i = 0; i < daftarSemester.length; i++) {
        isi += '<option value="' + i + '">Semester ' + esc(daftarSemester[i].nama) + '</option>';
    }

    ambil('f-semester').innerHTML = isi;
    ambil('f-semester').value = String(daftarSemester.length - 1);   // bawaan: semester berjalan
}

function tampilkanPengeluaran() {
    const pilihan = ambil('f-semester').value;
    const urut = urutkanTransaksi();
    let isi = '';
    let total = 0;

    for (let i = 0; i < urut.length; i++) {
        const t = urut[i];

        if (t.tipe !== 'keluar') {
            continue;
        }
        if (pilihan !== '') {
            const s = daftarSemester[Number(pilihan)];
            if (t.tanggal < s.mulai || t.tanggal > s.akhir) {
                continue;
            }
        }

        total = total + t.nominal;
        isi += '<tr>' +
            '<td>' + formatTanggal(t.tanggal) + '</td>' +
            '<td>' + esc(cariNamaKeperluan(t.idKeperluan)) + '</td>' +
            '<td>' + (t.keterangan ? esc(t.keterangan) : '-') + '</td>' +
            '<td class="teks-merah">- ' + formatRupiah(t.nominal) + '</td>' +
            '</tr>';
    }

    if (isi === '') {
        isi = '<tr><td colspan="4">Data tidak ditemukan</td></tr>';
        ambil('sub-pengeluaran').textContent = 'Belum ada pengeluaran pada periode ini';
    } else {
        isi += '<tr class="baris-total"><td colspan="3">Total pengeluaran</td>' +
               '<td class="teks-merah">- ' + formatRupiah(total) + '</td></tr>';
        ambil('sub-pengeluaran').textContent = 'Penggunaan uang kas kelas';
    }

    ambil('isi-pengeluaran').innerHTML = isi;
}


// 6. Jalankan saat halaman dibuka
if (saya !== null) {
    tampilkanSambutan();
    tampilkanKartu();
    tampilkanRiwayat();
    isiPilihanSemester();
    tampilkanPengeluaran();

    ambil('f-semester').addEventListener('change', tampilkanPengeluaran);
}
