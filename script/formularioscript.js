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