// ===== riwayat-iuran.js =====
// Halaman Riwayat Iuran Anggota (hanya lihat): semua pembayaran milik sendiri,
// dan status iuran per bulan untuk melihat tunggakan.
// Membutuhkan data-kas.js dan sesi.js (dimuat lebih dulu di riwayat-iuran.html)


// 1. Pastikan yang masuk adalah anggota (kalau bukan, halaman dialihkan)
const saya = jagaHalaman('anggota');

const PER_HALAMAN = 10;
let halaman = 1;

const kodeSekarang = tahunSekarang + '-' + duaDigit(bulanSekarang);


// 2. Pilihan filter
function isiPilihanFilter() {
    let semester = '<option value="">Semua semester</option>';

    for (let i = 0; i < daftarSemester.length; i++) {
        semester += '<option value="' + i + '">Semester ' + esc(daftarSemester[i].nama) + '</option>';
    }
    ambil('f-semester').innerHTML = semester;
    ambil('f-semester').value = String(daftarSemester.length - 1);   // bawaan: semester berjalan

    let jenis = '<option value="">Semua jenis iuran</option>';

    for (let i = 0; i < daftarJenisIuran.length; i++) {
        jenis += '<option value="' + daftarJenisIuran[i].id + '">' + esc(daftarJenisIuran[i].nama) + '</option>';
    }
    ambil('f-jenis').innerHTML = jenis;
}


// 3. Pembayaran milik saya yang sesuai filter
function pembayaranTersaring() {
    const urut = urutkanTransaksi();
    const pilihan = ambil('f-semester').value;
    const idJenis = ambil('f-jenis').value;
    const hasil = [];

    for (let i = 0; i < urut.length; i++) {
        const t = urut[i];

        if (t.tipe !== 'masuk' || t.nim !== saya.nim) {
            continue;
        }
        if (pilihan !== '') {
            const s = daftarSemester[Number(pilihan)];
            if (t.tanggal < s.mulai || t.tanggal > s.akhir) {
                continue;
            }
        }
        if (idJenis !== '' && t.idJenis !== Number(idJenis)) {
            continue;
        }

        hasil.push(t);
    }

    return hasil;
}


// 4. Tabel riwayat (filter + penomoran halaman)
function tampilkanRiwayat() {
    const hasil = pembayaranTersaring();

    // total yang sudah dibayarkan (mengikuti filter)
    let total = 0;
    for (let i = 0; i < hasil.length; i++) {
        total = total + hasil[i].nominal;
    }
    ambil('sub-total').textContent = 'Total dibayarkan ' + formatRupiah(total);

    const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
    if (halaman > totalHalaman) halaman = totalHalaman;

    const mulai = (halaman - 1) * PER_HALAMAN;
    const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

    let isi = '';
    for (let i = 0; i < tampil.length; i++) {
        const t = tampil[i];

        isi += '<tr>' +
            '<td>' + formatTanggal(t.tanggal) + '</td>' +
            '<td>' + esc(cariNamaJenis(t.idJenis)) + '</td>' +
            '<td>' + namaBulanIuran(t.bulanIuran) + '</td>' +
            '<td><span class="lbl lbl-hijau">Lunas</span></td>' +
            '<td class="teks-hijau">' + formatRupiah(t.nominal) + '</td>' +
            '</tr>';
    }
    ambil('isi-riwayat').innerHTML = isi;

    ambil('pesan-kosong').textContent = 'Data tidak ditemukan';
    ambil('pesan-kosong').hidden = hasil.length > 0;

    if (hasil.length === 0) {
        ambil('info-paging').textContent = 'Menampilkan 0 dari 0 data';
    } else {
        ambil('info-paging').textContent = 'Menampilkan ' + (mulai + 1) + '-' +
                                           (mulai + tampil.length) + ' dari ' + hasil.length + ' data';
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
        tampilkanRiwayat();
    });
    return b;
}

function buatPaging(totalHalaman) {
    const tempat = ambil('tombol-paging');
    tempat.innerHTML = '';

    tempat.appendChild(buatTombolHalaman('<i class="bx bx-chevron-left"></i>', halaman - 1, halaman === 1, false, 'Halaman sebelumnya'));

    for (let i = 1; i <= totalHalaman; i++) {
        tempat.appendChild(buatTombolHalaman(String(i), i, false, i === halaman, 'Halaman ' + i));
    }

    tempat.appendChild(buatTombolHalaman('<i class="bx bx-chevron-right"></i>', halaman + 1, halaman === totalHalaman, false, 'Halaman berikutnya'));
}


// 5. Status iuran bulanan per bulan (Lunas / Belum Bayar / belum jatuh tempo)
function cariPembayaranBulan(bulan, tahun, idJenis) {
    const kode = tahun + '-' + duaDigit(bulan);

    for (let i = 0; i < daftarTransaksi.length; i++) {
        const t = daftarTransaksi[i];

        if (t.tipe === 'masuk' && t.nim === saya.nim && t.idJenis === idJenis && t.bulanIuran === kode) {
            return t;
        }
    }

    return null;
}

function tampilkanStatus() {
    const jenis = jenisWajib();

    // status dihitung per semester: kalau "Semua semester", pakai semester berjalan
    const pilihan = ambil('f-semester').value;
    const semester = pilihan === '' ? ambilSemesterBerjalan() : daftarSemester[Number(pilihan)];

    ambil('sub-status').textContent = jenis === null
        ? 'Belum ada jenis iuran bulanan'
        : jenis.nama + ' - Semester ' + semester.nama;

    if (jenis === null) {
        ambil('isi-status').innerHTML = '<tr><td colspan="3">Data tidak ditemukan</td></tr>';
        return;
    }

    const kode = kodeBulanSemester(semester);
    let isi = '';

    for (let i = 0; i < kode.length; i++) {
        const bulan = Number(kode[i].slice(5, 7));
        const tahun = Number(kode[i].slice(0, 4));
        const bayar = cariPembayaranBulan(bulan, tahun, jenis.id);

        let label = '<span class="lbl lbl-abu">Belum jatuh tempo</span>';
        let tanggal = '-';

        if (bayar !== null) {
            label = '<span class="lbl lbl-hijau">Lunas</span>';
            tanggal = formatTanggal(bayar.tanggal);
        } else if (kode[i] <= kodeSekarang) {
            label = '<span class="lbl lbl-merah">Belum Bayar</span>';
        }

        isi += '<tr>' +
            '<td>' + namaBulanIuran(kode[i]) + '</td>' +
            '<td>' + label + '</td>' +
            '<td>' + tanggal + '</td>' +
            '</tr>';
    }

    ambil('isi-status').innerHTML = isi;
}


// 6. Pendengar dan jalankan saat halaman dibuka
function filterBerubah() {
    halaman = 1;
    tampilkanRiwayat();
    tampilkanStatus();
}

if (saya !== null) {
    isiPilihanFilter();

    ambil('f-semester').addEventListener('change', filterBerubah);
    ambil('f-jenis').addEventListener('change', filterBerubah);
    ambil('f-reset').addEventListener('click', function () {
        ambil('f-semester').value = String(daftarSemester.length - 1);
        ambil('f-jenis').value = '';
        filterBerubah();
    });

    filterBerubah();
}
