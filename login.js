const inputNim = document.getElementById("nim");
const inputPw = document.getElementById("password");
const mata = document.getElementById("mata");
const form = document.querySelector("form");

// lihat / sembunyikan password
mata.addEventListener("click", function () {
  if (inputPw.type === "password") {
    inputPw.type = "text";
    mata.className = "bx bx-hide";
  } else {
    inputPw.type = "password";
    mata.className = "bx bx-show";
  }
});

// tombol Masuk
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!inputNim.value.trim() || !inputPw.value.trim()) {
    alert("NIM dan password wajib diisi.");
    return;
  }

  window.location.href = "dashboard.html";
  });