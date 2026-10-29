// ===== laporan.js =====
// Halaman Laporan (FR-07): kartu ringkasan, rekap per bulan, rekap per semester,
// buku kas, dan status iuran anggota.
// Semua angka DIHITUNG dari data transaksi, bukan diketik manual.
// Membutuhkan data-kas.js (dimuat lebih dulu di laporan.html)


// 1. Ambil elemen yang dibutuhkan
const fSemester     = ambil('f-semester');
const fAnggota      = ambil('f-anggota');
const catatanAnggota = ambil('catatan-anggota');

const lapMasuk  = ambil('lap-masuk');
const lapKeluar = ambil('lap-keluar');
const lapSaldo  = ambil('lap-saldo');
const ketMasuk  = ambil('ket-masuk');
const ketKeluar = ambil('ket-keluar');
const ketSaldo  = ambil('ket-saldo');

const fBulanRekap     = ambil('f-bulan-rekap');
const isiRekapBulan   = ambil('isi-rekap-bulan');
const fSemesterRekap  = ambil('f-semester-rekap');
const isiRekapSemester = ambil('isi-rekap-semester');
const isiBukuKas      = ambil('isi-buku-kas');

const fJenisStatus = ambil('f-jenis-status');
const fBulanStatus = ambil('f-bulan-status');
const fStatus      = ambil('f-status');
const isiStatus    = ambil('isi-status');
const ringkasStatus = ambil('ringkas-status');


// 2. Fungsi bantu hitung ---------------------------------------------------

// Semester yang sedang dipilih di filter utama
function semesterTerpilih() {
    return daftarSemester[Number(fSemester.value)];
}

// Transaksi yang ikut dihitung, mengikuti filter anggota.
// Kalau satu anggota dipilih, hanya pemasukan anggota itu yang ikut (pengeluaran tidak punya anggota).
function transaksiTerfilter() {
    const nim = fAnggota.value;
    const hasil = [];

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const t = daftarTransaksi[i];

        if (nim === '' || (t.tipe === 'masuk' && t.nim === nim)) {
            hasil.push(t);
        }
    }

    return hasil;
}

// Menjumlahkan nominal dari daftar transaksi bertipe 'masuk' atau 'keluar'
function jumlahTipe(daftar, tipe) {
    let total = 0;

    for (let i = 0; i < daftar.length; i++) {
        if (daftar[i].tipe === tipe) {
            total = total + daftar[i].nominal;
        }
    }

    return total;
}

// Transaksi dengan tanggal di antara mulai dan akhir (keduanya ikut)
function dalamRentang(daftar, mulai, akhir) {
    const hasil = [];

    for (let i = 0; i < daftar.length; i++) {
        if (daftar[i].tanggal >= mulai && daftar[i].tanggal <= akhir) {
            hasil.push(daftar[i]);
        }
    }

    return hasil;
}

// Transaksi sebelum tanggal tertentu (dipakai untuk saldo awal semester)
function sebelumTanggal(daftar, tanggal) {
    const hasil = [];

    for (let i = 0; i < daftar.length; i++) {
        if (daftar[i].tanggal < tanggal) {
            hasil.push(daftar[i]);
        }
    }

    return hasil;
}

// Saldo awal = sisa kas dari semester-semester sebelumnya
function hitungSaldoAwal(daftar, semester) {
    const lalu = sebelumTanggal(daftar, semester.mulai);
    return jumlahTipe(lalu, 'masuk') - jumlahTipe(lalu, 'keluar');
}

// Daftar kode bulan dalam satu semester, contoh: ['2026-08', '2026-09', ..., '2027-01']
function bulanDalamSemester(semester) {
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

// Jumlah transaksi bertipe tertentu pada satu bulan (kode bulan seperti '2026-10')
function jumlahBulan(daftar, tipe, kodeBulan) {
    let total = 0;

    for (let i = 0; i < daftar.length; i++) {
        if (daftar[i].tipe === tipe && daftar[i].tanggal.slice(0, 7) === kodeBulan) {
            total = total + daftar[i].nominal;
        }
    }

    return total;
}

// Menulis angka selisih/saldo: kalau minus tampil merah
function tulisSelisih(angka) {
    if (angka < 0) {
        return '<span class="teks-merah">- ' + formatRupiah(-angka) + '</span>';
    }
    return formatRupiah(angka);
}

// Satu baris pesan kosong untuk tabel
function barisKosong(jumlahKolom) {
    return '<tr><td colspan="' + jumlahKolom + '">Data tidak ditemukan</td></tr>';
}


// 3. Mengisi pilihan filter ------------------------------------------------

function isiPilihanAwal() {
    // semester (bawaan: semester berjalan, yaitu yang terakhir di daftar)
    let semester = '';

    for (let i = 0; i < daftarSemester.length; i++) {
        semester += '<option value="' + i + '">Semester ' + esc(daftarSemester[i].nama) + '</option>';
    }
    fSemester.innerHTML = semester;
    fSemester.value = String(daftarSemester.length - 1);

    // anggota
    let anggota = '<option value="">Semua anggota</option>';

    for (let i = 0; i < daftarAnggota.length; i++) {
        anggota += '<option value="' + esc(daftarAnggota[i].nim) + '">' + esc(daftarAnggota[i].nama) + '</option>';
    }
    fAnggota.innerHTML = anggota;

    // filter di tabel rekap per semester
    let semesterRekap = '<option value="">Semua semester</option>';

    for (let i = 0; i < daftarSemester.length; i++) {
        semesterRekap += '<option value="' + i + '">Semester ' + esc(daftarSemester[i].nama) + '</option>';
    }
    fSemesterRekap.innerHTML = semesterRekap;

    // jenis iuran untuk tabel status (bawaan: iuran bulanan wajib)
    let jenis = '';

    for (let i = 0; i < daftarJenisIuran.length; i++) {
        jenis += '<option value="' + daftarJenisIuran[i].id + '">' + esc(daftarJenisIuran[i].nama) + '</option>';
    }
    fJenisStatus.innerHTML = jenis;

    const wajib = jenisWajib();
    if (wajib !== null) {
        fJenisStatus.value = String(wajib.id);
    }
}

// Pilihan bulan mengikuti semester yang dipilih
function isiPilihanBulan() {
    const kode = bulanDalamSemester(semesterTerpilih());
    const lamaRekap  = fBulanRekap.value;
    const lamaStatus = fBulanStatus.value;

    let rekap = '<option value="">Semua bulan</option>';
    let status = '';

    for (let i = 0; i < kode.length; i++) {
        rekap  += '<option value="' + kode[i] + '">' + namaBulanIuran(kode[i]) + '</option>';
        status += '<option value="' + kode[i] + '">' + namaBulanIuran(kode[i]) + '</option>';
    }

    fBulanRekap.innerHTML  = rekap;
    fBulanStatus.innerHTML = status;

    // pertahankan pilihan lama kalau masih ada di semester ini
    fBulanRekap.value = kode.indexOf(lamaRekap) >= 0 ? lamaRekap : '';

    // bulan bawaan untuk status = bulan berjalan, kalau tidak ada di semester ini pakai bulan terakhir
    const bawaan = tahunSekarang + '-' + duaDigit(bulanSekarang);

    if (kode.indexOf(lamaStatus) >= 0) {
        fBulanStatus.value = lamaStatus;
    } else if (kode.indexOf(bawaan) >= 0) {
        fBulanStatus.value = bawaan;
    } else {
        fBulanStatus.value = kode[kode.length - 1];
    }
}


// 4. Tiga kartu ringkasan
function tampilkanKartu() {
    const daftar = transaksiTerfilter();
    const semester = semesterTerpilih();

    const masuk  = jumlahTipe(dalamRentang(daftar, semester.mulai, semester.akhir), 'masuk');
    const keluar = jumlahTipe(dalamRentang(daftar, semester.mulai, semester.akhir), 'keluar');
    const saldoAwal  = hitungSaldoAwal(daftar, semester);
    const saldoAkhir = saldoAwal + masuk - keluar;

    lapMasuk.textContent  = formatRupiah(masuk);
    lapKeluar.textContent = formatRupiah(keluar);
    lapSaldo.textContent  = saldoAkhir < 0 ? '- ' + formatRupiah(-saldoAkhir) : formatRupiah(saldoAkhir);

    ketMasuk.textContent  = 'Semester ' + semester.nama;
    ketKeluar.textContent = 'Semester ' + semester.nama;
    ketSaldo.textContent  = 'Termasuk saldo awal ' + (saldoAwal < 0 ? '- ' + formatRupiah(-saldoAwal) : formatRupiah(saldoAwal));
}


// 5. Rekap per bulan
function tampilkanRekapBulan() {
    const daftar = transaksiTerfilter();
    let kode = bulanDalamSemester(semesterTerpilih());

    // filter bulan: hanya satu bulan yang ditampilkan
    if (fBulanRekap.value !== '') {
        kode = [fBulanRekap.value];
    }

    let isi = '';
    let totalMasuk = 0;
    let totalKeluar = 0;

    for (let i = 0; i < kode.length; i++) {
        const masuk  = jumlahBulan(daftar, 'masuk', kode[i]);
        const keluar = jumlahBulan(daftar, 'keluar', kode[i]);

        totalMasuk  = totalMasuk + masuk;
        totalKeluar = totalKeluar + keluar;

        isi += '<tr>' +
            '<td>' + namaBulanIuran(kode[i]) + '</td>' +
            '<td class="kanan teks-hijau">' + formatRupiah(masuk) + '</td>' +
            '<td class="kanan">' + formatRupiah(keluar) + '</td>' +
            '<td class="kanan">' + tulisSelisih(masuk - keluar) + '</td>' +
            '</tr>';
    }

    if (isi === '') {
        isi = barisKosong(4);
    } else {
        isi += '<tr class="baris-total">' +
            '<td>Total</td>' +
            '<td class="kanan">' + formatRupiah(totalMasuk) + '</td>' +
            '<td class="kanan">' + formatRupiah(totalKeluar) + '</td>' +
            '<td class="kanan">' + tulisSelisih(totalMasuk - totalKeluar) + '</td>' +
            '</tr>';
    }

    isiRekapBulan.innerHTML = isi;
}


// 6. Rekap per semester
function tampilkanRekapSemester() {
    const daftar = transaksiTerfilter();
    let isi = '';

    for (let i = 0; i < daftarSemester.length; i++) {
        // filter semester: lewati semester yang tidak dipilih
        if (fSemesterRekap.value !== '' && Number(fSemesterRekap.value) !== i) {
            continue;
        }

        const s = daftarSemester[i];
        const masuk  = jumlahTipe(dalamRentang(daftar, s.mulai, s.akhir), 'masuk');
        const keluar = jumlahTipe(dalamRentang(daftar, s.mulai, s.akhir), 'keluar');

        // saldo akhir = semua pemasukan dikurangi semua pengeluaran sampai akhir semester itu
        const sampaiAkhir = dalamRentang(daftar, awalWaktu, s.akhir);
        const saldo = jumlahTipe(sampaiAkhir, 'masuk') - jumlahTipe(sampaiAkhir, 'keluar');

        isi += '<tr>' +
            '<td>Semester ' + esc(s.nama) + '</td>' +
            '<td class="kanan teks-hijau">' + formatRupiah(masuk) + '</td>' +
            '<td class="kanan">' + formatRupiah(keluar) + '</td>' +
            '<td class="kanan">' + tulisSelisih(saldo) + '</td>' +
            '</tr>';
    }

    isiRekapSemester.innerHTML = isi === '' ? barisKosong(4) : isi;
}


// 7. Buku kas: daftar transaksi berurutan dengan saldo berjalan
function keteranganBuku(t) {
    if (t.tipe === 'masuk') {
        let teks = esc(cariNamaAnggota(t.nim)) + ', ' + esc(cariNamaJenis(t.idJenis)) + ' (' + namaBulanIuran(t.bulanIuran) + ')';

        if (t.keterangan) {
            teks += ' - ' + esc(t.keterangan);
        }
        return teks;
    }

    let teks = esc(cariNamaKeperluan(t.idKeperluan));

    if (t.keterangan) {
        teks += ' - ' + esc(t.keterangan);
    }
    return teks;
}

function tampilkanBukuKas() {
    const daftar = transaksiTerfilter();
    const semester = semesterTerpilih();

    // transaksi semester ini, diurutkan dari tanggal paling lama (tanggal sama: id terkecil dulu)
    const urut = dalamRentang(daftar, semester.mulai, semester.akhir);

    urut.sort(function (a, b) {
        if (a.tanggal < b.tanggal) { return -1; }
        if (a.tanggal > b.tanggal) { return 1; }
        return a.id - b.id;
    });

    const saldoAwal = hitungSaldoAwal(daftar, semester);
    let saldo = saldoAwal;
    let totalMasuk = 0;
    let totalKeluar = 0;

    // baris pertama: saldo awal semester
    let isi = '<tr class="baris-awal">' +
        '<td>-</td>' +
        '<td>Saldo awal semester</td>' +
        '<td class="kanan">-</td>' +
        '<td class="kanan">-</td>' +
        '<td class="kanan">' + tulisSelisih(saldoAwal) + '</td>' +
        '</tr>';

    for (let i = 0; i < urut.length; i++) {
        const t = urut[i];
        let masuk = '-';
        let keluar = '-';

        if (t.tipe === 'masuk') {
            saldo = saldo + t.nominal;
            totalMasuk = totalMasuk + t.nominal;
            masuk = formatRupiah(t.nominal);
        } else {
            saldo = saldo - t.nominal;
            totalKeluar = totalKeluar + t.nominal;
            keluar = formatRupiah(t.nominal);
        }

        isi += '<tr>' +
            '<td>' + formatTanggal(t.tanggal) + '</td>' +
            '<td>' + keteranganBuku(t) + '</td>' +
            '<td class="kanan">' + masuk + '</td>' +
            '<td class="kanan">' + keluar + '</td>' +
            '<td class="kanan">' + tulisSelisih(saldo) + '</td>' +
            '</tr>';
    }

    if (urut.length === 0) {
        isi += barisKosong(5);
    }

    // baris terakhir: total
    isi += '<tr class="baris-total">' +
        '<td colspan="2">Total</td>' +
        '<td class="kanan">' + formatRupiah(totalMasuk) + '</td>' +
        '<td class="kanan">' + formatRupiah(totalKeluar) + '</td>' +
        '<td class="kanan">' + tulisSelisih(saldo) + '</td>' +
        '</tr>';

    isiBukuKas.innerHTML = isi;
}


// 8. Status iuran anggota (Lunas / Belum Bayar)

// Untuk iuran "Per Semester": lunas kalau ada pembayaran di bulan mana pun dalam semester itu
function sudahBayarSemester(nim, idJenis, semester) {
    const awal  = semester.mulai.slice(0, 7);
    const akhir = semester.akhir.slice(0, 7);

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const t = daftarTransaksi[i];

        if (t.tipe === 'masuk' && t.nim === nim && t.idJenis === idJenis &&
            t.bulanIuran >= awal && t.bulanIuran <= akhir) {
            return true;
        }
    }

    return false;
}

function tampilkanStatus() {
    const jenis = cariJenis(Number(fJenisStatus.value));
    const semester = semesterTerpilih();

    if (jenis === null) {
        ringkasStatus.textContent = 'Belum ada jenis iuran.';
        isiStatus.innerHTML = barisKosong(3);
        return;
    }

    // iuran per semester tidak dihitung per bulan, jadi pilihan bulan dimatikan
    const perBulan = (jenis.periode === 'Per Bulan');
    fBulanStatus.disabled = !perBulan;

    const kodeBulan = fBulanStatus.value;
    const nimTerpilih = fAnggota.value;

    let isi = '';
    let jumlahAnggota = 0;
    let jumlahLunas = 0;

    for (let i = 0; i < daftarAnggota.length; i++) {
        const a = daftarAnggota[i];

        // filter anggota di bagian atas halaman
        if (nimTerpilih !== '' && a.nim !== nimTerpilih) {
            continue;
        }

        let lunas;

        if (perBulan) {
            lunas = sudahBayar(a.nim, Number(kodeBulan.slice(5, 7)), Number(kodeBulan.slice(0, 4)), jenis.id);
        } else {
            lunas = sudahBayarSemester(a.nim, jenis.id, semester);
        }

        jumlahAnggota = jumlahAnggota + 1;
        if (lunas) {
            jumlahLunas = jumlahLunas + 1;
        }

        // filter status bayar
        if (fStatus.value === 'lunas' && !lunas) { continue; }
        if (fStatus.value === 'belum' && lunas)  { continue; }

        const label = lunas
            ? '<span class="lbl lbl-hijau">Lunas</span>'
            : '<span class="lbl lbl-merah">Belum Bayar</span>';

        isi += '<tr>' +
            '<td>' + esc(a.nama) + '</td>' +
            '<td>' + esc(a.kelas) + '</td>' +
            '<td>' + label + '</td>' +
            '</tr>';
    }

    const periodeTeks = perBulan ? namaBulanIuran(kodeBulan) : 'Semester ' + semester.nama;
    ringkasStatus.textContent = jenis.nama + ', ' + periodeTeks + ': ' +
                                jumlahLunas + ' dari ' + jumlahAnggota + ' anggota lunas';

    isiStatus.innerHTML = isi === '' ? barisKosong(3) : isi;
}


// 9. Menampilkan semuanya
function tampilkanSemua() {
    // catatan kecil muncul kalau filter anggota dipakai
    catatanAnggota.hidden = (fAnggota.value === '');

    tampilkanKartu();
    tampilkanRekapBulan();
    tampilkanRekapSemester();
    tampilkanBukuKas();
    tampilkanStatus();
}


// 10. Pasang pendengar
fSemester.addEventListener('change', function () {
    isiPilihanBulan();      // bulan mengikuti semester
    tampilkanSemua();
});
fAnggota.addEventListener('change', tampilkanSemua);

// Filter di setiap tabel hanya menggambar ulang tabelnya sendiri
fBulanRekap.addEventListener('change', tampilkanRekapBulan);
fSemesterRekap.addEventListener('change', tampilkanRekapSemester);
fJenisStatus.addEventListener('change', tampilkanStatus);
fBulanStatus.addEventListener('change', tampilkanStatus);
fStatus.addEventListener('change', tampilkanStatus);

// Kolom pencarian di topbar: tekan Enter untuk mencari di halaman Data Transaksi (FR-05)
ambil('cari').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        window.location.href = 'data-transaksi.html?q=' + encodeURIComponent(this.value);
    }
});


// 11. Jalankan saat halaman dibuka
isiPilihanAwal();
isiPilihanBulan();
tampilkanSemua();