export function initTheme() {
    const toggleButton = document.querySelector(".theme-switcher");
    const icon = document.getElementById("theme-icon");

    const applyTheme = (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        icon.textContent = theme === "light" ? "🌞" : "🌙";
    };

    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    toggleButton.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    });
}