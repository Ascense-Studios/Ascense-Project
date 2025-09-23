// sidebar.js
document.addEventListener("DOMContentLoaded", () => {
    const btnMenu = document.querySelector(".menu");
    const sidebar = document.querySelector(".sidebar");

    // Revisamos si existe el botón antes de agregar el listener
    if (btnMenu) {
        btnMenu.addEventListener("click", () => {
            if (sidebar.style.display === "flex") {
                sidebar.style.display = "none";
            } else {
                sidebar.style.display = "flex";
            }
        });
    }
});
