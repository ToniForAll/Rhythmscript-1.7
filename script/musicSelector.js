const logoutBtn = document.querySelector('.logout-btn');
const miDiv = document.getElementById('music4');
const miSonido = document.getElementById('efecto4');
const notas = document.querySelectorAll('.nota');
const menuMusic = document.getElementById('menuMusic');
const pause = document.getElementById('pause');
const resume = document.getElementById('resume');
const boton = document.getElementById('options');
const modal = document.getElementById('modalOptions');
const closeButton = document.getElementById('buttonClose');
const closeCustomAlertBtn = document.querySelector('.closeCustomAlert');

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

let volumen = localStorage.getItem('volumen');

if (volumen === null) {
    localStorage.setItem('volumen', 0.5);
    volumen = 0.5;
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

let userData = localStorage.getItem('userData');

// validacion para volver a la pagina de inicio si no inicia sesion

// if (!userData) { window.location.href = 'index.html' };

miDiv.addEventListener('mouseenter', () => {
    miSonido.volume = volumen;
    miSonido.currentTime = 0;
    miSonido.play();
});

miDiv.addEventListener('mouseleave', () => {
    miSonido.pause();
});



// validacion para volver a la pagina de inicio si no inicia sesion

// logoutBtn.addEventListener('click', () => {
//     localStorage.removeItem('userData');
//     window.location.href = 'index.html';
// })
/////////////////////////////////////////////////////////

const miDiv2 = document.getElementById('music1');
const miSonido2 = document.getElementById('efecto1');
miSonido2.volume = volumen;

miDiv2.addEventListener('mouseenter', () => {
    miSonido2.volume = volumen;
    miSonido2.currentTime = 0;
    miSonido2.play();
});

miDiv2.addEventListener('mouseleave', () => {
    miSonido2.pause();
});


/////////////////////////////////////////////////////////

const miDiv3 = document.getElementById('music2');
const miSonido3 = document.getElementById('efecto2');
miSonido3.volume = volumen;

miDiv3.addEventListener('mouseenter', () => {
    miSonido3.volume = volumen;
    miSonido3.currentTime = 0;
    miSonido3.play();
});

miDiv3.addEventListener('mouseleave', () => {
    miSonido3.pause();
});

/////////////////////////////////////////////////////////

const miDiv4 = document.getElementById('music3');
const miSonido4 = document.getElementById('efecto3');
miSonido4.volume = volumen;

miDiv4.addEventListener('mouseenter', () => {
    miSonido4.volume = volumen;
    miSonido4.currentTime = 0;
    miSonido4.play();
});

miDiv4.addEventListener('mouseleave', () => {
    miSonido4.pause();
});

/////////////////////// Musica Selector ///////////////////////
const urlData = new URLSearchParams(window.location.search);
const userId = urlData.get('id');

function navigate(variable) {
    window.location.href = 'game.html?var=' + variable + '&id=' + userId;
}

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


////////////////////////////// input range music 

const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

volumeSlider.value = volumen * 100;
volumeValue.textContent = volumeSlider.value;

volumeSlider.addEventListener('input', function () {

    volumeValue.textContent = volumeSlider.value;
    localStorage.setItem('volumen', volumeSlider.value / 100);
    volumen = volumeSlider.value / 100;
    
});

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