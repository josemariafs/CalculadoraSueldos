// Script para cambiar el tema claro/oscuro
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

// Cargar preferencia guardada
const savedTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', savedTheme);

// Función para alternar tema
function toggleTheme() {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Event listener para el botón toggle
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    
    // También permitir cambio con Enter o Espacio
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
} 