// buka/tutup sidebar
const sidebar = document.querySelector('.sidebar');
const toggle = sidebar.querySelector('.toggle');

toggle.addEventListener('click', () => {
    sidebar.classList.toggle('close');
});