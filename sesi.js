// ===== sesi.js =====
// Mengingat siapa yang sedang masuk (disimpan di sessionStorage, hilang saat tab ditutup)
// dan menjaga halaman sesuai peran:
//   - Bendahara  -> halaman pengelola (dashboard.html, data-anggota.html, dst.)
//   - Anggota    -> halaman lihat saja (dashboard-anggota.html, riwayat-iuran.html)
// Catatan: ini masih simulasi di sisi browser. Login yang sebenarnya dibuat nanti dengan PHP + MySQL.
// Membutuhkan data-kas.js (dimuat lebih dulu).

(function () {

    const kunciSesi = 'nimLogin';

    function bacaNim() {
        try {
            return sessionStorage.getItem(kunciSesi);
        } catch (err) {
            return null;
        }
    }

    // Mengembalikan true kalau berhasil menyimpan
    window.simpanSesi = function (nim) {
        try {
            sessionStorage.setItem(kunciSesi, nim);
            return true;
        } catch (err) {
            return false;
        }
    };

    function hapusSesi() {
        try {
            sessionStorage.removeItem(kunciSesi);
        } catch (err) {
            // tidak ada yang perlu dilakukan
        }
    }

    // Anggota yang sedang masuk (null kalau belum masuk)
    window.penggunaLogin = function () {
        const nim = bacaNim();
        return nim === null ? null : cariAnggota(nim);
    };

    // Peran: jabatan Bendahara -> 'bendahara', selain itu -> 'anggota' (hanya lihat)
    window.peranDari = function (anggota) {
        return anggota.jabatan === 'Bendahara' ? 'bendahara' : 'anggota';
    };

    window.halamanAwal = function (peran) {
        return peran === 'bendahara' ? 'dashboard.html' : 'dashboard-anggota.html';
    };

    // Dipanggil di awal setiap halaman.
    // Mengembalikan data pengguna kalau boleh masuk, atau null kalau dialihkan.
    window.jagaHalaman = function (peranHalaman) {
        const pengguna = window.penggunaLogin();

        if (pengguna === null) {
            window.location.replace('login.html');
            return null;
        }

        const peran = window.peranDari(pengguna);
        if (peran !== peranHalaman) {
            window.location.replace(window.halamanAwal(peran));
            return null;
        }

        // isi nama dan peran di sidebar dan bilah atas
        const nama   = document.querySelector('.user-name');
        const jabatan = document.querySelector('.user-role');
        const avatar = document.querySelector('.avatar');
        const pil    = document.querySelector('.user-pill span');

        if (nama !== null)    { nama.textContent = pengguna.nama; }
        if (jabatan !== null) { jabatan.textContent = pengguna.jabatan; }
        if (avatar !== null)  { avatar.textContent = inisialNama(pengguna.nama).slice(0, 1); }
        if (pil !== null)     { pil.textContent = pengguna.nama.split(' ')[0]; }

        // tombol Keluar menghapus sesi
        const keluar = document.querySelector('.logout a');
        if (keluar !== null) {
            keluar.addEventListener('click', hapusSesi);
        }

        return pengguna;
    };

})();
