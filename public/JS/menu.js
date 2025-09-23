
// Menu
const menu = document.querySelector(".menu");
const navContent = document.querySelector(".nav-content");

menu.addEventListener("click", ()=> {
    // menu.style.backgroundColor = "red";
    navContent.classList.toggle("hidden-menu");
});
