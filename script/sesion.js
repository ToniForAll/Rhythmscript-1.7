const API_BASE_URL = 'https://api-rhythmscript.onrender.com/api';

// Obtener usuario actual de sessionStorage
function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Cerrar sesión
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Mostrar modal de confirmación
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Cerrar dropdown si está abierto
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
}

// Ocultar modal
function hideLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Alternar menú desplegable
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const userButton = document.getElementById('userMenuButton');
    
    if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(event.target) && !userButton?.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    }
});

function updateHeader() {
    const navItems = document.getElementById('navItems');
    const user = getCurrentUser();
    
    if (!navItems) return;
    
    if (user) {
        // Usuario logueado - mostrar nombre y menú
        navItems.innerHTML = `
            <div class="user-menu-container">
                <button id="userMenuButton" class="user-menu-button login-btn formToggle" onclick="toggleUserMenu()">
                    ${user.username}
                </button>
                <div id="userDropdown" class="user-dropdown hidden">
                    <div class="user-info">
                        <span class="user-fullname">${user.nombre} ${user.apellido}</span>
                        <span class="user-username">${user.username}</span>
                    </div>
                    <div class="confirmExit" onclick="showLogoutModal()">Cerrar Sesión</div>
                </div>
            </div>
        `;
    } else {
        // Usuario no logueado - mostrar botón Account
        navItems.innerHTML = `
            <a href="form.html"><button class="login-btn">Account</button></a>
        `;
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar header
    updateHeader();
    
    // Configurar modal de logout
    const confirmBtn = document.getElementById('confirmLogout');
    const cancelBtn = document.getElementById('cancelLogout');
    const modal = document.getElementById('logoutModal');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', logout);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideLogoutModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideLogoutModal();
            }
        });
    }
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.getCurrentUser = getCurrentUser;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.showLogoutModal = showLogoutModal;
window.hideLogoutModal = hideLogoutModal;