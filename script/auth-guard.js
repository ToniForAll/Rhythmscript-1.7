// Función para obtener usuario de sessionStorage
function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Función para verificar si hay sesión activa
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Función para redirigir al login
function redirectToLogin() {
    // Guardar la página que intentaba acceder (opcional)
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    
    // Redirigir al formulario de registro/login
    window.location.href = 'form.html';
}

// Función principal de protección
function protectPage() {
    console.log('Verificando autenticación...');
    
    if (!isAuthenticated()) {
        console.log('Usuario no autenticado - Redirigiendo...');
        redirectToLogin();
    } else {
        console.log('Usuario autenticado - Acceso permitido');
    }
}

// Ejecutar protección inmediatamente
protectPage();

// También proteger contra navegación con botón "atrás"
window.addEventListener('pageshow', function(event) {
    // Si la página se carga desde el caché (botón atrás), verificar de nuevo
    if (event.persisted) {
        protectPage();
    }
});

// Exponer funciones globalmente
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.logout = function() {
    sessionStorage.removeItem('user');
    window.location.href = 'form.html';
};