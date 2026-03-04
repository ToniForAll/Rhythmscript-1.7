//// advertencia de cancer de codigo

document.getElementById('cambiar-a-login').addEventListener('click', function() {
    const registro = document.getElementById('registro');
    const inicioSesion = document.getElementById('inicio-sesion');

    registro.classList.remove('slide-in-right');
    registro.style.transform = 'translateX(100%)';
    registro.style.opacity = '0';
    

    setTimeout(() => {
        registro.classList.add('oculto');
        inicioSesion.classList.remove('oculto');
        inicioSesion.style.opacity = '1';
        inicioSesion.classList.add('slide-in-left');
        setTimeout(() => {
            inicioSesion.classList.remove('slide-in-left');
            registro.style.transform = 'translateX(0)';
        }, 500);
    }, 250);
});

document.getElementById('cambiar-a-registro').addEventListener('click', function() {
    const registro = document.getElementById('registro');
    const inicioSesion = document.getElementById('inicio-sesion');

    inicioSesion.classList.remove('slide-in-left');
    inicioSesion.style.transform = 'translateX(-100%)';
    inicioSesion.style.opacity = '0';

    setTimeout(() => {
        inicioSesion.classList.add('oculto');
        registro.classList.remove('oculto');
        registro.classList.add('slide-in-right');
        registro.style.opacity = '1';
        setTimeout(() => {
            registro.classList.remove('slide-in-right');
            inicioSesion.style.transform = 'translateX(0)';
        }, 500);
    }, 250);
});

// ========================================== manejo de sesion
const API_BASE_URL = 'https://api-rhythmscript.onrender.com/api';

function playClickSound() {
    const audio = document.getElementById('efecto');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Error al reproducir audio:', e));
    }
}

function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'form.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado, inicializando formularios...');
    
    const registroForm = document.getElementById('registro');
    const loginForm = document.getElementById('inicio-sesion');
    const cambiarALogin = document.getElementById('cambiar-a-login');
    const cambiarARegistro = document.getElementById('cambiar-a-registro');
    
    if (!registroForm) {
        console.error('No se encontró el formulario de registro');
        return;
    }
    
    if (!loginForm) {
        console.error('No se encontró el formulario de login');
        return;
    }

    const user = getCurrentUser();
    if (user && !window.location.pathname.includes('form.html')) {
        window.location.href = 'index.html';
    }

    if (cambiarALogin) {
        cambiarALogin.addEventListener('click', function() {
            console.log('Cambiando a login...');
            
            if (!registroForm || !loginForm) return;

            registroForm.classList.remove('slide-in-right');
            registroForm.style.transform = 'translateX(100%)';
            registroForm.style.opacity = '0';

            setTimeout(() => {
                registroForm.classList.add('oculto');
                loginForm.classList.remove('oculto');
                loginForm.style.opacity = '1';
                loginForm.classList.add('slide-in-left');
                
                setTimeout(() => {
                    loginForm.classList.remove('slide-in-left');
                    registroForm.style.transform = 'translateX(0)';
                }, 500);
            }, 250);
        });
    }

    if (cambiarARegistro) {
        cambiarARegistro.addEventListener('click', function() {
            console.log('Cambiando a registro...');
            
            if (!registroForm || !loginForm) return;

            loginForm.classList.remove('slide-in-left');
            loginForm.style.transform = 'translateX(-100%)';
            loginForm.style.opacity = '0';

            setTimeout(() => {
                loginForm.classList.add('oculto');
                registroForm.classList.remove('oculto');
                registroForm.classList.add('slide-in-right');
                registroForm.style.opacity = '1';
                
                setTimeout(() => {
                    registroForm.classList.remove('slide-in-right');
                    loginForm.style.transform = 'translateX(0)';
                }, 500);
            }, 250);
        });
    }
    
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Enviando formulario de registro...');
        
        const inputs = registroForm.querySelectorAll('input');
        const nombre = inputs[0]?.value || '';
        const apellido = inputs[1]?.value || '';
        const username = inputs[2]?.value || '';
        const password = inputs[3]?.value || '';
        const confirmPassword = inputs[4]?.value || '';

        // Validaciones
        if (!nombre || !apellido || !username || !password || !confirmPassword) {
            alert('Todos los campos son obligatorios');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const submitBtn = registroForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent || 'Registrarse';
        if (submitBtn) {
            submitBtn.textContent = 'Registrando...';
            submitBtn.disabled = true;
        }

        try {
            console.log('Enviando a:', `${API_BASE_URL}/auth/register`);
            
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    username,
                    password
                })
            });

            console.log('Respuesta recibida:', response.status);
            
            const data = await response.json();
            console.log('Datos:', data);

            if (response.ok && data.success) {
                alert(`Bienvenido ${data.user.nombre}! Registro exitoso`);
                
                // Guardar usuario en sessionStorage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirigir al inicio
                window.location.href = 'index.html';
            } else {
                alert(`Error: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error detallado:', error);
            alert(`Error al conectar con el servidor: ${error.message}`);
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
    
    // ==========================================
    // EVENTO DE INICIO DE SESIÓN
    // ==========================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Enviando formulario de login...');
        
        const inputs = loginForm.querySelectorAll('input');
        const username = inputs[0]?.value || '';
        const password = inputs[1]?.value || '';

        if (!username || !password) {
            alert('❌ Usuario y contraseña son obligatorios');
            return;
        }

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent || 'Iniciar Sesión';
        if (submitBtn) {
            submitBtn.textContent = 'Iniciando sesión...';
            submitBtn.disabled = true;
        }

        try {
            console.log('Enviando a:', `${API_BASE_URL}/auth/login`);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
                // SIN credentials: 'include'
            });

            console.log('Respuesta recibida:', response.status);
            
            const data = await response.json();

            if (response.ok && data.success) {
                alert(`¡Bienvenido de vuelta ${data.user.nombre}!`);
                
                // Guardar usuario en sessionStorage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirigir al inicio
                window.location.href = 'index.html';
            } else {
                alert(`Error: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error en login:', error);
            alert(`Error al conectar con el servidor: ${error.message}`);
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
    
    document.querySelectorAll('button, .span').forEach(el => {
        el.addEventListener('click', playClickSound);
    });
    
});

window.logout = logout;