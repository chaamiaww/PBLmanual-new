// ===== login.js =====
// Halaman Masuk. NIM harus terdaftar di Data Anggota; kata sandi wajib diisi.
// (Pengecekan kata sandi yang sebenarnya dibuat nanti dengan PHP + MySQL.)
// Membutuhkan data-kas.js dan sesi.js (dimuat lebih dulu di login.html)

const inputNim = document.getElementById('nim');
const inputPw  = document.getElementById('password');
const mata     = document.getElementById('mata');
const form     = document.querySelector('form');
const pesan    = document.getElementById('pesan-login');

// lihat / sembunyikan kata sandi
mata.addEventListener('click', function () {
    if (inputPw.type === 'password') {
        inputPw.type = 'text';
        mata.className = 'bx bx-hide';
    } else {
        inputPw.type = 'password';
        mata.className = 'bx bx-show';
    }
});

// pesan kesalahan hilang begitu pengguna mengetik lagi
[inputNim, inputPw].forEach(function (kolom) {
    kolom.addEventListener('input', function () {
        pesan.textContent = '';
    });
});

// tombol Masuk
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nim = inputNim.value.trim();

    if (nim === '' || inputPw.value.trim() === '') {
        pesan.textContent = 'NIM dan kata sandi wajib diisi.';
        return;
    }

    const anggota = cariAnggota(nim);
    if (anggota === null) {
        pesan.textContent = 'NIM belum terdaftar. Hubungi Bendahara kelas.';
        return;
    }

    if (!simpanSesi(nim)) {
        pesan.textContent = 'Gagal masuk. Browser tidak mengizinkan penyimpanan sesi.';
        return;
    }

    window.location.href = halamanAwal(peranDari(anggota));
});
