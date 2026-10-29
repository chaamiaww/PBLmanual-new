// ===== modal-transaksi.js =====
// Form pop-up yang dipakai bersama oleh Dashboard dan Data Transaksi:
//   - Catat / Ubah Pemasukan   (FR-03)
//   - Catat / Ubah Pengeluaran (FR-04)
//   - Kelola Keperluan         (tambah, ubah, hapus keperluan pengeluaran)
//   - Notifikasi (toast) berhasil / gagal
// Membutuhkan data-kas.js (dimuat lebih dulu).
//
// Cara pakai di halaman:
//   - tombol dengan atribut data-buka="masuk" atau data-buka="keluar" membuka form
//   - halaman mengisi  window.setelahSimpan = function () { ...muat ulang tampilan... }
//   - window.bukaPemasukan(transaksi) dan window.bukaPengeluaran(transaksi) untuk mode ubah

(function () {

    // ---------- 1. Tempelkan HTML pop-up ke halaman ----------
    const kerangka = `
    <div class="modal-overlay" id="modal-masuk">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="judul-masuk">
            <div class="modal-header">
                <h3 id="judul-masuk">Catat Pemasukan</h3>
                <button type="button" class="modal-close" data-tutup aria-label="Tutup"><i class="bx bx-x"></i></button>
            </div>
            <form id="form-masuk" novalidate>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="pm-anggota">Nama Anggota</label>
                        <select id="pm-anggota"></select>
                        <div class="pesan-error" id="err-pm-anggota"></div>
                    </div>
                    <div class="form-group">
                        <label for="pm-jenis">Jenis Iuran</label>
                        <select id="pm-jenis"></select>
                        <div class="pesan-error" id="err-pm-jenis"></div>
                    </div>
                    <div class="dua-kolom">
                        <div class="form-group">
                            <label for="pm-tanggal">Tanggal Pembayaran</label>
                            <input type="date" id="pm-tanggal">
                            <div class="pesan-error" id="err-pm-tanggal"></div>
                        </div>
                        <div class="form-group">
                            <label for="pm-nominal">Nominal (terisi otomatis)</label>
                            <div class="input-awalan">
                                <span>Rp</span>
                                <input type="text" id="pm-nominal" inputmode="numeric" placeholder="0">
                            </div>
                            <div class="pesan-error" id="err-pm-nominal"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="pm-bulan">Iuran Bulan</label>
                        <select id="pm-bulan"></select>
                        <div class="pesan-error" id="err-pm-bulan"></div>
                        <small id="pm-bulan-info">Pembayaran otomatis masuk ke rekap bulan dan semester terkait</small>
                    </div>
                    <div class="form-group">
                        <label for="pm-ket">Keterangan (opsional)</label>
                        <input type="text" id="pm-ket" placeholder="Contoh: Dibayar tunai">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-batal" data-tutup>Batal</button>
                    <button type="submit" class="btn btn-simpan">Simpan Data</button>
                </div>
            </form>
        </div>
    </div>

    <div class="modal-overlay" id="modal-keluar">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="judul-keluar">
            <div class="modal-header">
                <h3 id="judul-keluar">Catat Pengeluaran</h3>
                <button type="button" class="modal-close" data-tutup aria-label="Tutup"><i class="bx bx-x"></i></button>
            </div>
            <form id="form-keluar" novalidate>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="pg-keperluan">Keperluan</label>
                        <div class="baris-input">
                            <select id="pg-keperluan"></select>
                            <button type="button" class="btn-kelola" id="btn-kelola"><i class="bx bx-pencil"></i> Kelola</button>
                        </div>
                        <div class="pesan-error" id="err-pg-keperluan"></div>
                    </div>
                    <div class="dua-kolom">
                        <div class="form-group">
                            <label for="pg-tanggal">Tanggal</label>
                            <input type="date" id="pg-tanggal">
                            <div class="pesan-error" id="err-pg-tanggal"></div>
                        </div>
                        <div class="form-group">
                            <label for="pg-nominal">Nominal</label>
                            <div class="input-awalan">
                                <span>Rp</span>
                                <input type="text" id="pg-nominal" inputmode="numeric" placeholder="0">
                            </div>
                            <div class="pesan-error" id="err-pg-nominal"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="pg-ket">Keterangan (opsional)</label>
                        <input type="text" id="pg-ket" placeholder="Contoh: Fotokopi tugas kelompok">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-batal" data-tutup>Batal</button>
                    <button type="submit" class="btn btn-simpan">Simpan Data</button>
                </div>
            </form>
        </div>
    </div>

    <div class="modal-overlay" id="modal-kelola">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="judul-kelola">
            <div class="modal-header">
                <h3 id="judul-kelola">Kelola Keperluan Pengeluaran</h3>
                <button type="button" class="modal-close" data-tutup aria-label="Tutup"><i class="bx bx-x"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="kl-nama">Tambah keperluan baru</label>
                    <div class="baris-input">
                        <input type="text" id="kl-nama" placeholder="Contoh: Perlengkapan">
                        <button type="button" class="btn btn-simpan" id="kl-tambah">Tambah</button>
                    </div>
                    <div class="pesan-error" id="err-kl-nama"></div>
                </div>
                <div class="tabel-bungkus">
                    <table class="tabel-kelola">
                        <thead><tr><th>Keperluan</th><th class="aksi">Aksi</th></tr></thead>
                        <tbody id="kl-isi"></tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-batal" data-tutup>Tutup</button>
            </div>
        </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', kerangka);


    // ---------- 2. Elemen dan penanda ----------
    function $(id) {
        return document.getElementById(id);
    }

    const modalMasuk  = $('modal-masuk');
    const modalKeluar = $('modal-keluar');
    const modalKelola = $('modal-kelola');
    const formMasuk   = $('form-masuk');
    const formKeluar  = $('form-keluar');
    const toastEl     = $('toast');

    let idMasukDiedit  = null;     // id transaksi yang sedang diubah (null = menambah baru)
    let idKeluarDiedit = null;
    let waktuToast     = null;


    // ---------- 3. Notifikasi (toast) ----------
    window.tampilToast = function (pesan, jenis) {
        toastEl.textContent = pesan;
        toastEl.className = 'toast show ' + jenis;     // jenis: 'sukses' atau 'gagal'

        clearTimeout(waktuToast);
        waktuToast = setTimeout(function () {
            toastEl.classList.remove('show');
        }, 2500);
    };


    // ---------- 4. Buka dan tutup pop-up ----------
    function buka(modal) {
        modal.classList.add('show');
    }

    function tutup(modal) {
        modal.classList.remove('show');

        // setelah Kelola Keperluan ditutup, pilihan keperluan di form pengeluaran diperbarui
        if (modal === modalKelola) {
            isiKeperluan($('pg-keperluan').value);
        }
    }

    document.addEventListener('click', function (e) {
        // tombol Batal / x
        const tombolTutup = e.target.closest('[data-tutup]');
        if (tombolTutup !== null) {
            tutup(tombolTutup.closest('.modal-overlay'));
            return;
        }

        // klik area gelap di luar kotak = tutup
        if (e.target.classList.contains('modal-overlay')) {
            tutup(e.target);
            return;
        }

        // tombol pembuka: data-buka="masuk" atau "keluar"
        const tombolBuka = e.target.closest('[data-buka]');
        if (tombolBuka !== null) {
            if (tombolBuka.dataset.buka === 'masuk') {
                window.bukaPemasukan(null);
            } else if (tombolBuka.dataset.buka === 'keluar') {
                window.bukaPengeluaran(null);
            }
        }
    });

    // Esc menutup pop-up yang paling atas
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') {
            return;
        }
        const terbuka = document.querySelectorAll('.modal-overlay.show');
        if (terbuka.length > 0) {
            tutup(terbuka[terbuka.length - 1]);
        }
    });


    // ---------- 5. Pesan error di bawah kolom ----------
    function tampilError(idField, pesan) {
        $(idField).closest('.form-group').classList.add('error');
        $('err-' + idField).textContent = pesan;
    }

    function bersihkanError(form) {
        form.querySelectorAll('.form-group.error').forEach(function (g) {
            g.classList.remove('error');
        });
        form.querySelectorAll('.pesan-error').forEach(function (p) {
            p.textContent = '';
        });
    }

    // Error satu kolom hilang begitu pengguna mengisi lagi
    [formMasuk, formKeluar].forEach(function (form) {
        form.addEventListener('input', hapusErrorKolom);
        form.addEventListener('change', hapusErrorKolom);
    });

    function hapusErrorKolom(e) {
        const grup = e.target.closest('.form-group');
        if (grup === null) {
            return;
        }
        grup.classList.remove('error');
        const pesan = grup.querySelector('.pesan-error');
        if (pesan !== null) {
            pesan.textContent = '';
        }
    }


    // ---------- 6. Fungsi bantu form ----------
    function hariIni() {
        const d = new Date();
        return d.getFullYear() + '-' + duaDigit(d.getMonth() + 1) + '-' + duaDigit(d.getDate());
    }

    // "10.000" -> 10000
    function ambilAngka(teks) {
        return Number(String(teks).replace(/\D/g, ''));
    }

    // 10000 -> "10.000"
    function tulisAngka(angka) {
        return angka ? Number(angka).toLocaleString('id-ID') : '';
    }

    // Kolom nominal otomatis diberi titik ribuan saat diketik
    ['pm-nominal', 'pg-nominal'].forEach(function (id) {
        $(id).addEventListener('input', function () {
            this.value = tulisAngka(ambilAngka(this.value));
        });
    });

    function isiAnggota(terpilih) {
        let isi = '<option value="">Pilih anggota...</option>';

        for (let i = 0; i < daftarAnggota.length; i++) {
            const a = daftarAnggota[i];
            isi += '<option value="' + esc(a.nim) + '">' + esc(a.nama) + ' - ' + esc(a.nim) + '</option>';
        }

        $('pm-anggota').innerHTML = isi;
        $('pm-anggota').value = terpilih || '';
    }

    function isiJenis(terpilih) {
        let isi = '<option value="">Pilih jenis iuran...</option>';

        for (let i = 0; i < daftarJenisIuran.length; i++) {
            const j = daftarJenisIuran[i];
            isi += '<option value="' + j.id + '">' + esc(j.nama) + ' - ' + formatRupiah(j.nominal) + '</option>';
        }

        $('pm-jenis').innerHTML = isi;
        $('pm-jenis').value = terpilih ? String(terpilih) : '';
    }

    // Pilihan bulan iuran: semua bulan pada semester berjalan (contoh: Agustus 2026 - Januari 2027)
    function isiBulan(terpilih) {
        const semester = daftarSemester[daftarSemester.length - 1];
        const kode = [];

        let tahun = Number(semester.mulai.slice(0, 4));
        let bulan = Number(semester.mulai.slice(5, 7));
        const tahunAkhir = Number(semester.akhir.slice(0, 4));
        const bulanAkhir = Number(semester.akhir.slice(5, 7));

        while (tahun < tahunAkhir || (tahun === tahunAkhir && bulan <= bulanAkhir)) {
            kode.push(tahun + '-' + duaDigit(bulan));
            bulan = bulan + 1;
            if (bulan > 12) { bulan = 1; tahun = tahun + 1; }
        }
        if (terpilih && kode.indexOf(terpilih) < 0) {
            kode.push(terpilih);          // data lama di luar semester tetap bisa diubah
        }

        let isi = '';
        for (let i = 0; i < kode.length; i++) {
            isi += '<option value="' + kode[i] + '">' + namaBulanIuran(kode[i]) + '</option>';
        }

        $('pm-bulan').innerHTML = isi;
        $('pm-bulan').value = terpilih || (tahunSekarang + '-' + duaDigit(bulanSekarang));
    }

    function isiKeperluan(terpilih) {
        let isi = '<option value="">Pilih keperluan...</option>';

        for (let i = 0; i < daftarKeperluan.length; i++) {
            isi += '<option value="' + daftarKeperluan[i].id + '">' + esc(daftarKeperluan[i].nama) + '</option>';
        }

        $('pg-keperluan').innerHTML = isi;
        $('pg-keperluan').value = terpilih ? String(terpilih) : '';
    }

    // Mencari semester dari kode bulan, contoh: '2026-10' -> 'Ganjil 2026/2027'.
    // Kalau bulan di luar semua semester, kode bulannya sendiri dikembalikan (dibandingkan per bulan).
    function semesterDari(kodeBulan) {
        for (let i = 0; i < daftarSemester.length; i++) {
            const s = daftarSemester[i];
            if (kodeBulan >= s.mulai.slice(0, 7) && kodeBulan <= s.akhir.slice(0, 7)) {
                return s.nama;
            }
        }
        return kodeBulan;
    }

    // Petunjuk di bawah pilihan "Iuran Bulan" menyesuaikan periode jenis iuran yang dipilih
    function perbaruiInfoBulan() {
        const jenis = cariJenis(Number($('pm-jenis').value));

        if (jenis !== null && jenis.periode === 'Per Semester') {
            $('pm-bulan-info').textContent = 'Iuran per semester: cukup dibayar sekali. Pilih bulan mana saja dalam semester ini';
        } else {
            $('pm-bulan-info').textContent = 'Pembayaran otomatis masuk ke rekap bulan dan semester terkait';
        }
    }

    // Pilih jenis iuran -> nominal terisi otomatis sesuai tagihan
    $('pm-jenis').addEventListener('change', function () {
        const jenis = cariJenis(Number(this.value));
        $('pm-nominal').value = jenis === null ? '' : tulisAngka(jenis.nominal);
        perbaruiInfoBulan();
    });

    function selesaiSimpan(pesan) {
        window.tampilToast(pesan, 'sukses');
        if (typeof window.setelahSimpan === 'function') {
            window.setelahSimpan();
        }
    }

    // Mengembalikan isi daftarTransaksi ke kondisi semula kalau penyimpanan gagal
    function pulihkan(cadangan) {
        daftarTransaksi.splice(0, daftarTransaksi.length);
        for (let i = 0; i < cadangan.length; i++) {
            daftarTransaksi.push(cadangan[i]);
        }
    }


    // ---------- 7. Form Pemasukan ----------
    window.bukaPemasukan = function (transaksi) {
        formMasuk.reset();
        bersihkanError(formMasuk);

        isiAnggota(transaksi ? transaksi.nim : '');
        isiJenis(transaksi ? transaksi.idJenis : '');
        isiBulan(transaksi ? transaksi.bulanIuran : '');

        if (transaksi) {
            idMasukDiedit = transaksi.id;
            $('judul-masuk').textContent = 'Ubah Pemasukan';
            $('pm-tanggal').value = transaksi.tanggal;
            $('pm-nominal').value = tulisAngka(transaksi.nominal);
            $('pm-ket').value = transaksi.keterangan;
        } else {
            idMasukDiedit = null;
            $('judul-masuk').textContent = 'Catat Pemasukan';
            $('pm-tanggal').value = hariIni();
        }

        perbaruiInfoBulan();
        buka(modalMasuk);
        $('pm-anggota').focus();
    };

    formMasuk.addEventListener('submit', function (e) {
        e.preventDefault();
        bersihkanError(formMasuk);

        const data = {
            tanggal: $('pm-tanggal').value,
            tipe: 'masuk',
            nim: $('pm-anggota').value,
            idJenis: Number($('pm-jenis').value),
            idKeperluan: 0,
            bulanIuran: $('pm-bulan').value,
            keterangan: $('pm-ket').value.trim(),
            nominal: ambilAngka($('pm-nominal').value)
        };

        // ----- validasi -----
        let adaError = false;

        if (data.nim === '') {
            tampilError('pm-anggota', 'Kolom ini wajib diisi');
            adaError = true;
        }
        if (data.idJenis === 0) {
            tampilError('pm-jenis', 'Kolom ini wajib diisi');
            adaError = true;
        }
        if (data.tanggal === '') {
            tampilError('pm-tanggal', 'Kolom ini wajib diisi');
            adaError = true;
        }
        if (data.nominal <= 0) {
            tampilError('pm-nominal', 'Nominal harus lebih dari 0');
            adaError = true;
        }
        if (data.bulanIuran === '') {
            tampilError('pm-bulan', 'Kolom ini wajib diisi');
            adaError = true;
        } else if (data.nim !== '' && data.idJenis !== 0) {
            // anggota yang sama tidak boleh membayar iuran yang sama dua kali:
            //   - iuran "Per Semester": dicek per semester (cukup sekali dalam satu semester)
            //   - iuran lainnya (Per Bulan): dicek per bulan
            const jenisDipilih = cariJenis(data.idJenis);
            const perSemester = (jenisDipilih !== null && jenisDipilih.periode === 'Per Semester');

            const kembar = daftarTransaksi.some(function (t) {
                if (t.tipe !== 'masuk' || t.nim !== data.nim || t.idJenis !== data.idJenis || t.id === idMasukDiedit) {
                    return false;
                }
                if (perSemester) {
                    return semesterDari(t.bulanIuran) === semesterDari(data.bulanIuran);
                }
                return t.bulanIuran === data.bulanIuran;
            });
            if (kembar) {
                tampilError('pm-bulan', perSemester
                    ? 'Anggota ini sudah membayar iuran tersebut untuk semester ini'
                    : 'Anggota ini sudah membayar iuran tersebut untuk bulan ini');
                adaError = true;
            }
        }

        if (adaError) {
            window.tampilToast('Data gagal disimpan. Periksa kembali isian.', 'gagal');
            return;
        }

        // ----- simpan -----
        const cadangan = daftarTransaksi.slice();
        const modeUbah = (idMasukDiedit !== null);

        if (modeUbah) {
            for (let i = 0; i < daftarTransaksi.length; i++) {
                if (daftarTransaksi[i].id === idMasukDiedit) {
                    data.id = idMasukDiedit;
                    daftarTransaksi[i] = data;
                }
            }
        } else {
            data.id = nomorBerikut(daftarTransaksi);
            daftarTransaksi.push(data);
        }

        if (!simpanTransaksi()) {
            pulihkan(cadangan);
            window.tampilToast('Data gagal disimpan.', 'gagal');
            return;
        }

        tutup(modalMasuk);
        selesaiSimpan(modeUbah ? 'Data berhasil diubah' : 'Data berhasil disimpan');
    });


    // ---------- 8. Form Pengeluaran ----------
    window.bukaPengeluaran = function (transaksi) {
        formKeluar.reset();
        bersihkanError(formKeluar);

        isiKeperluan(transaksi ? transaksi.idKeperluan : '');

        if (transaksi) {
            idKeluarDiedit = transaksi.id;
            $('judul-keluar').textContent = 'Ubah Pengeluaran';
            $('pg-tanggal').value = transaksi.tanggal;
            $('pg-nominal').value = tulisAngka(transaksi.nominal);
            $('pg-ket').value = transaksi.keterangan;
        } else {
            idKeluarDiedit = null;
            $('judul-keluar').textContent = 'Catat Pengeluaran';
            $('pg-tanggal').value = hariIni();
        }

        buka(modalKeluar);
        $('pg-keperluan').focus();
    };

    formKeluar.addEventListener('submit', function (e) {
        e.preventDefault();
        bersihkanError(formKeluar);

        const data = {
            tanggal: $('pg-tanggal').value,
            tipe: 'keluar',
            nim: '',
            idJenis: 0,
            idKeperluan: Number($('pg-keperluan').value),
            bulanIuran: '',
            keterangan: $('pg-ket').value.trim(),
            nominal: ambilAngka($('pg-nominal').value)
        };

        let adaError = false;

        if (data.idKeperluan === 0) {
            tampilError('pg-keperluan', 'Kolom ini wajib diisi');
            adaError = true;
        }
        if (data.tanggal === '') {
            tampilError('pg-tanggal', 'Kolom ini wajib diisi');
            adaError = true;
        }
        if (data.nominal <= 0) {
            tampilError('pg-nominal', 'Nominal harus lebih dari 0');
            adaError = true;
        }

        if (adaError) {
            window.tampilToast('Data gagal disimpan. Periksa kembali isian.', 'gagal');
            return;
        }

        // peringatan: pengeluaran lebih besar dari saldo kas (saldo akan jadi minus)
        let saldoTersedia = hitungSaldo();
        if (idKeluarDiedit !== null) {
            const lama = cariTransaksi(idKeluarDiedit);
            if (lama !== null) {
                saldoTersedia = saldoTersedia + lama.nominal;     // nominal lama dikembalikan dulu
            }
        }
        if (data.nominal > saldoTersedia) {
            if (!confirm('Saldo kas ' + formatRupiah(saldoTersedia) + ' tidak cukup untuk pengeluaran ' +
                         formatRupiah(data.nominal) + '. Saldo akan menjadi minus. Tetap simpan?')) {
                return;
            }
        }

        const cadangan = daftarTransaksi.slice();
        const modeUbah = (idKeluarDiedit !== null);

        if (modeUbah) {
            for (let i = 0; i < daftarTransaksi.length; i++) {
                if (daftarTransaksi[i].id === idKeluarDiedit) {
                    data.id = idKeluarDiedit;
                    daftarTransaksi[i] = data;
                }
            }
        } else {
            data.id = nomorBerikut(daftarTransaksi);
            daftarTransaksi.push(data);
        }

        if (!simpanTransaksi()) {
            pulihkan(cadangan);
            window.tampilToast('Data gagal disimpan.', 'gagal');
            return;
        }

        tutup(modalKeluar);
        selesaiSimpan(modeUbah ? 'Data berhasil diubah' : 'Data berhasil disimpan');
    });


    // ---------- 9. Kelola Keperluan (tambah, ubah, hapus) ----------
    function tampilkanKeperluan() {
        let isi = '';

        for (let i = 0; i < daftarKeperluan.length; i++) {
            const k = daftarKeperluan[i];
            isi += '<tr>' +
                '<td>' + esc(k.nama) + '</td>' +
                '<td class="aksi">' +
                    '<button type="button" class="ikon-aksi" data-ubah="' + k.id + '" title="Ubah"><i class="bx bx-pencil"></i></button>' +
                    '<button type="button" class="ikon-aksi hapus" data-hapus="' + k.id + '" title="Hapus"><i class="bx bx-trash"></i></button>' +
                '</td>' +
                '</tr>';
        }

        if (isi === '') {
            isi = '<tr><td colspan="2">Belum ada keperluan.</td></tr>';
        }

        $('kl-isi').innerHTML = isi;
    }

    // Nama keperluan tidak boleh kembar (huruf besar/kecil dianggap sama)
    function namaKeperluanAda(nama, abaikanId) {
        return daftarKeperluan.some(function (k) {
            return k.id !== abaikanId && k.nama.toLowerCase() === nama.toLowerCase();
        });
    }

    $('btn-kelola').addEventListener('click', function () {
        $('kl-nama').value = '';
        $('err-kl-nama').textContent = '';
        tampilkanKeperluan();
        buka(modalKelola);
        $('kl-nama').focus();
    });

    $('kl-tambah').addEventListener('click', function () {
        const nama = $('kl-nama').value.trim();

        if (nama === '') {
            $('err-kl-nama').textContent = 'Kolom ini wajib diisi';
            return;
        }
        if (namaKeperluanAda(nama, 0)) {
            $('err-kl-nama').textContent = 'Keperluan ini sudah ada';
            return;
        }

        daftarKeperluan.push({ id: nomorBerikut(daftarKeperluan), nama: nama });

        if (!simpanKeperluan()) {
            daftarKeperluan.pop();
            window.tampilToast('Data gagal disimpan.', 'gagal');
            return;
        }

        $('kl-nama').value = '';
        $('err-kl-nama').textContent = '';
        tampilkanKeperluan();
        window.tampilToast('Data berhasil disimpan', 'sukses');
    });

    $('kl-nama').addEventListener('input', function () {
        $('err-kl-nama').textContent = '';
    });

    $('kl-isi').addEventListener('click', function (e) {

        // ----- ubah nama -----
        const tombolUbah = e.target.closest('[data-ubah]');
        if (tombolUbah !== null) {
            const id = Number(tombolUbah.dataset.ubah);
            let target = null;

            for (let i = 0; i < daftarKeperluan.length; i++) {
                if (daftarKeperluan[i].id === id) {
                    target = daftarKeperluan[i];
                }
            }
            if (target === null) {
                return;
            }

            const baru = prompt('Ubah nama keperluan:', target.nama);
            if (baru === null) {
                return;                                  // dibatalkan
            }

            const nama = baru.trim();
            if (nama === '') {
                window.tampilToast('Data gagal diubah. Nama tidak boleh kosong.', 'gagal');
                return;
            }
            if (namaKeperluanAda(nama, id)) {
                window.tampilToast('Data gagal diubah. Keperluan sudah ada.', 'gagal');
                return;
            }

            const lama = target.nama;
            target.nama = nama;

            if (!simpanKeperluan()) {
                target.nama = lama;
                window.tampilToast('Data gagal diubah.', 'gagal');
                return;
            }

            tampilkanKeperluan();
            window.tampilToast('Data berhasil diubah', 'sukses');
            return;
        }

        // ----- hapus -----
        const tombolHapus = e.target.closest('[data-hapus]');
        if (tombolHapus !== null) {
            const id = Number(tombolHapus.dataset.hapus);
            let urutan = -1;

            for (let i = 0; i < daftarKeperluan.length; i++) {
                if (daftarKeperluan[i].id === id) {
                    urutan = i;
                }
            }
            if (urutan < 0) {
                return;
            }

            // aturan: data master yang masih dipakai transaksi tidak boleh dihapus
            if (hitungPemakaianKeperluan(id) > 0) {
                window.tampilToast('Tidak dapat dihapus karena masih digunakan oleh transaksi.', 'gagal');
                return;
            }

            if (!confirm('Hapus keperluan "' + daftarKeperluan[urutan].nama + '"?')) {
                return;
            }

            const dihapus = daftarKeperluan.splice(urutan, 1)[0];

            if (!simpanKeperluan()) {
                daftarKeperluan.splice(urutan, 0, dihapus);
                window.tampilToast('Data gagal dihapus.', 'gagal');
                return;
            }

            tampilkanKeperluan();
            window.tampilToast('Data berhasil dihapus', 'sukses');
        }
    });

})();