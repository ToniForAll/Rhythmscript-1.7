import { createForm } from "./createForm.js";

let userData = localStorage.getItem('userData');


//*Codigo epico que hace q las notas salten*
const formToggle = document.querySelector('.formToggle');
const miDiv = document.getElementsByClassName('bigBtn');
const notas = document.querySelectorAll('.salto');
const miSonido = document.getElementById('efecto');
const menuMusic = document.getElementById('menuMusic');
const pause = document.getElementById('pause');
const resume = document.getElementById('resume');
const boton = document.getElementById('options');
const modal = document.getElementById('modalOptions');
const closeButton = document.getElementById('buttonClose');
const closeCustomAlertBtn = document.querySelector('.closeCustomAlert');
const playBtn = document.querySelector('.playBtn');

let input1 = document.querySelector("#oneButton");
let input2 = document.querySelector("#twoButton");
let input3 = document.querySelector("#threeButton");
let input4 = document.querySelector("#fourButton");
let tecla1storage = localStorage.getItem('teclaP1');
let tecla2storage = localStorage.getItem('teclaP2');
let tecla3storage = localStorage.getItem('teclaP3');
let tecla4storage = localStorage.getItem('teclaP4');
let teclaP1 = '';
let teclaP2 = '';
let teclaP3 = '';
let teclaP4 = '';

if (tecla1storage === null) {
    localStorage.setItem('teclaP1', 'D');
}

if (tecla2storage === null) {
    localStorage.setItem('teclaP2', 'F');
}

if (tecla3storage === null) {
    localStorage.setItem('teclaP3', 'J');
}
if (tecla4storage === null) {
    localStorage.setItem('teclaP4', 'K');
}

tecla1storage = localStorage.getItem('teclaP1');
tecla2storage = localStorage.getItem('teclaP2');
tecla3storage = localStorage.getItem('teclaP3');
tecla4storage = localStorage.getItem('teclaP4');

teclaP1 = tecla1storage;
teclaP2 = tecla2storage;
teclaP3 = tecla3storage;
teclaP4 = tecla4storage;

input1.textContent = teclaP1;
input2.textContent = teclaP2;
input3.textContent = teclaP3;
input4.textContent = teclaP4;

localStorage.setItem('teclaP1', teclaP1);
localStorage.setItem('teclaP2', teclaP2);
localStorage.setItem('teclaP3', teclaP3);
localStorage.setItem('teclaP4', teclaP4);

closeButton.addEventListener('click', agregarClase);

function agregarClase() {
    modal.classList.add('close');
}

modal.onclick = function (event) {
    if (event.target === modal) {
        agregarClase();
    }
}

boton.addEventListener('click', function () {
    modal.classList.remove('close');
    modal.classList.add('open');
});

//hola mundo

//adios mundo

////////////////////////////// input range musica y el control de volumen

const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
let volumen = localStorage.getItem('volumen');

if (volumen === null) {
    localStorage.setItem('volumen', 0.5);
    volumen = 0.5;
}

volumeSlider.value = volumen * 100;
volumeValue.textContent = volumeSlider.value;

menuMusic.volume = volumen;

volumeSlider.addEventListener('input', function () {
    menuMusic.volume = volumeSlider.value / 100;
    miSonido.volume = volumeSlider.value / 100;
    volumeValue.textContent = volumeSlider.value;
    localStorage.setItem('volumen', volumeSlider.value / 100);
});

// boton de reproduccion de musica

if (pause) {
    pause.addEventListener('click', () => {
        resume.classList.remove('hidden');
        resume.classList.add('animation');
        pause.classList.add('hidden');
        menuMusic.pause();
        Array.from(notas).forEach(notas => {
            notas.classList.remove('nota');
        });
    });
}

if (resume) {
    resume.addEventListener('click', () => {
        pause.classList.remove('hidden');
        pause.classList.add('animation');
        resume.classList.add('hidden');
        menuMusic.play();
        Array.from(notas).forEach(notas => {
            notas.classList.add('nota');
        });
    });
}


///////////////////////////////////// Mapeo de Teclas

document.getElementById('oneButton').addEventListener('click', function () {
    input1.textContent = 'Precione una Tecla';
    input1.style.backgroundColor = '#6f00eed0';
    input1.style.fontSize = "15px";
    document.addEventListener('keydown', onKeyPress1);
});
document.getElementById('twoButton').addEventListener('click', function () {
    input2.textContent = 'Precione una Tecla';
    input2.style.backgroundColor = '#6f00eed0';
    input2.style.fontSize = "15px";
    document.addEventListener('keydown', onKeyPress2);
});
document.getElementById('threeButton').addEventListener('click', function () {
    input3.textContent = 'Precione una Tecla';
    input3.style.backgroundColor = '#6f00eed0';
    input3.style.fontSize = "15px";
    document.addEventListener('keydown', onKeyPress3);
});
document.getElementById('fourButton').addEventListener('click', function () {
    input4.textContent = 'Precione una Tecla';
    input4.style.backgroundColor = '#6f00eed0';
    input4.style.fontSize = "15px";
    document.addEventListener('keydown', onKeyPress4);
});

function onKeyPress1(event) {
    teclaP1 = event.key.toUpperCase();
    localStorage.setItem('teclaP1', teclaP1);

    if (teclaP1 == teclaP2 || teclaP1 == teclaP3 || teclaP1 == teclaP4) {
        document.getElementById('customAlert').style.display = 'block';
    }

    input1.textContent = teclaP1;
    input1.style.backgroundColor = 'transparent';
    input1.style.fontSize = "30px";

    document.removeEventListener('keydown', onKeyPress1);
}

function onKeyPress2(event) {
    teclaP2 = event.key.toUpperCase();
    localStorage.setItem('teclaP2', teclaP2);

    if (teclaP2 == teclaP1 || teclaP2 == teclaP3 || teclaP2 == teclaP4) {
        document.getElementById('customAlert').style.display = 'block';
    }

    input2.textContent = teclaP2;
    input2.style.backgroundColor = 'transparent';
    input2.style.fontSize = "30px";

    document.removeEventListener('keydown', onKeyPress2);
}

function onKeyPress3(event) {
    teclaP3 = event.key.toUpperCase();
    localStorage.setItem('teclaP3', teclaP3);

    if (teclaP3 == teclaP1 || teclaP3 == teclaP2 || teclaP3 == teclaP4) {
        document.getElementById('customAlert').style.display = 'block';
    }

    input3.textContent = teclaP3;
    input3.style.backgroundColor = 'transparent';
    input3.style.fontSize = "30px";

    document.removeEventListener('keydown', onKeyPress3);
}

function onKeyPress4(event) {
    teclaP4 = event.key.toUpperCase();
    localStorage.setItem('teclaP4', teclaP4);

    if (teclaP4 == teclaP1 || teclaP4 == teclaP2 || teclaP4 == teclaP3) {
        document.getElementById('customAlert').style.display = 'block';
    }

    input4.textContent = teclaP4;
    input4.style.backgroundColor = 'transparent';
    input4.style.fontSize = "30px";

    document.removeEventListener('keydown', onKeyPress4);
}

function closeCustomAlert() {
    document.getElementById('customAlert').style.display = 'none';
}

closeCustomAlertBtn.addEventListener('click', () => { closeCustomAlert() });

//////////////////////////// menu sound

miSonido.volume = volumen;

Array.from(miDiv).forEach(div => {
    div.addEventListener('mouseover', () => {
        miSonido.currentTime = 0;
        miSonido.play();
    });
});

//manejo de sesion
if (userData) {
    //el boton de login pasa a ser de logout (si hay una session activa)
    formToggle.classList.add('logout-btn');
    formToggle.innerText = 'Log out';
    formToggle.addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    });

    playBtn.addEventListener('click', () => {
        window.location.href = 'music.html?id=' + JSON.parse(userData).userId;
        return;
    });
};

playBtn.addEventListener('click', () => {
    window.location.href = 'music.html';
    return;
});


// Validacion de inicio de sesion para jugar, documentado actualmente para jugar sin la base de datos.

// if (!userData) {

//     playBtn.addEventListener('click', () => {
//         if (userData) {
//             window.location.href = 'music.html?id=' + JSON.parse(userData).userId;
//             return;
//         }

//         createForm();
//     });
//     formToggle.addEventListener('click', () => {
//         if (userData) {
//             return;
//         }

//         createForm()
//     });
// }

// manejo de velocidad de notas

const label = document.getElementById('velocity');
const botonDecrementar = document.getElementById('decrementar');
const botonIncrementar = document.getElementById('incrementar');
const nota = document.getElementsByClassName('circle');
let valorActual = (localStorage.getItem('velocidad') || '0.9');

nota[0].style.animation = `Bajarabajo ${valorActual}s linear infinite`;
valorActual *= 10;
label.textContent = Math.round(valorActual);


function actualizarLabel(valor) {
    label.textContent = valor;
}

function actualizarVelocidad(valor) {
    let velocidad = valor * 0.1;
    localStorage.setItem('velocidad', velocidad);
    
    nota[0].style.animation = `Bajarabajo ${velocidad}s linear infinite`;
}

botonDecrementar.addEventListener('click', () => {
    valorActual = parseInt(label.textContent);
    if (valorActual > 4) {
        valorActual--;
        actualizarLabel(valorActual);
        actualizarVelocidad(valorActual);
    }
});

botonIncrementar.addEventListener('click', () => {
    valorActual = parseInt(label.textContent);
    if (valorActual < 9) {
        valorActual++;
        actualizarLabel(valorActual);
        actualizarVelocidad(valorActual);
    }
});

///////////////// movil

const bodyRemove = document.getElementById('bodyRemove');

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}


document.addEventListener('DOMContentLoaded', function() {
    if (isMobile()) {
        const bodyRemove = document.body;
        while (bodyRemove.firstChild) {
            bodyRemove.removeChild(bodyRemove.firstChild);
        }

        const nuevoDiv = document.createElement('div');

        nuevoDiv.classList.add('Movil');

        const nuevoElemento1 = document.createElement('h1');
        nuevoElemento1.textContent = '¡Advertencia!';

        const nuevoElemento2 = document.createElement('p');
        nuevoElemento2.textContent = 'Tu dispositivo no es compatible con esta aplicación.';

        nuevoDiv.appendChild(nuevoElemento1);
        nuevoDiv.appendChild(nuevoElemento2);

        bodyRemove.appendChild(nuevoDiv);
    }
});

