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
let input5 = document.querySelector("#fiveButton");
let tecla1storage = localStorage.getItem('teclaP1');
let tecla2storage = localStorage.getItem('teclaP2');
let tecla3storage = localStorage.getItem('teclaP3');
let tecla4storage = localStorage.getItem('teclaP4');
let tecla5storage = localStorage.getItem('teclaP5');
let teclaP1 = '';
let teclaP2 = '';
let teclaP3 = '';
let teclaP4 = '';
let teclaP5 = '';

let volumen = localStorage.getItem('volumen');

if (volumen === null) {
    localStorage.setItem('volumen', 0.5);
    volumen = 0.5;
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
if (tecla5storage === null) {
    localStorage.setItem('teclaP5', ' ');
}

tecla1storage = localStorage.getItem('teclaP1');
tecla2storage = localStorage.getItem('teclaP2');
tecla3storage = localStorage.getItem('teclaP3');
tecla4storage = localStorage.getItem('teclaP4');
tecla5storage = localStorage.getItem('teclaP5');

teclaP1 = tecla1storage;
teclaP2 = tecla2storage;
teclaP3 = tecla3storage;
teclaP4 = tecla4storage;
teclaP5 = tecla5storage;

input1.textContent = teclaP1;
input2.textContent = teclaP2;
input3.textContent = teclaP3;
input4.textContent = teclaP4;
if(teclaP5 == ' '){
    input5.textContent = 'Space';
} else {
    input5.textContent = teclaP5;
}

localStorage.setItem('teclaP1', teclaP1);
localStorage.setItem('teclaP2', teclaP2);
localStorage.setItem('teclaP3', teclaP3);
localStorage.setItem('teclaP4', teclaP4);
localStorage.setItem('teclaP5', teclaP5);

let userData = localStorage.getItem('userData');

// validacion para volver a la pagina de inicio si no inicia sesion

// if (!userData) { window.location.href = 'index.html' };





// validacion para volver a la pagina de inicio si no inicia sesion

// logoutBtn.addEventListener('click', () => {
//     localStorage.removeItem('userData');
//     window.location.href = 'index.html';
// })
/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////

/////////////////////// Musica Selector ///////////////////////
const urlData = new URLSearchParams(window.location.search);
const userId = urlData.get('id');

function navigate(variable) {
    window.location.href = 'game.html?var=' + variable + '&id=' + userId;
}

function editor() {
    window.location.href = 'editor.html';
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
document.getElementById('fiveButton').addEventListener('click', function () {
    input5.textContent = 'Precione una Tecla';
    input5.style.backgroundColor = '#6f00eed0';
    input5.style.fontSize = "15px";
    document.addEventListener('keydown', onKeyPress5);
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

function onKeyPress5(event) {
    teclaP5 = event.key.toUpperCase();
    localStorage.setItem('teclaP5', teclaP5);

    if (teclaP5 == teclaP1 || teclaP5 == teclaP2 || teclaP5 == teclaP3 || teclaP5 == teclaP4) {
        document.getElementById('customAlert').style.display = 'block';
    }

    if(teclaP5 == ' '){
        event.preventDefault();
        input5.textContent = 'Space';
    } else {
        input5.textContent = teclaP5;
    }
    input5.style.backgroundColor = 'transparent';
    input5.style.fontSize = "30px";

    document.removeEventListener('keydown', onKeyPress5);
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


let currentVideoData = null;
let audioPlayer = null;
let isPlaying = false;
let currentVideoId = null;

// Funcion para extraer ID de YouTube
function getYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
        /youtube\.com\/embed\/([^?]+)/,
        /youtube\.com\/v\/([^?]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function searchYouTubeVideo() {
    const urlInput = document.getElementById('youtubeUrlInput');
    const url = urlInput.value.trim();

     if (!url) {
        return;
    }
    
    const videoId = getYouTubeId(url);

    if (!videoId) {
        return;
    }
    
    currentVideoData = {
        id: videoId,
        url: url,
        title: `Video de YouTube (${videoId})`,
        added: new Date().toISOString()
    };
    
    showVideoPreview(videoId);
}

function showVideoPreview(videoId) {
    const previewContainer = document.getElementById('videoPreview');
    const iframe = document.getElementById('previewIframe');
    const videoTitle = document.getElementById('videoTitle');
    const videoIdElement = document.getElementById('videoId');
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
    
    videoIdElement.textContent = `ID: ${videoId}`;
    
    previewContainer.style.display = 'block';
    
    const playButton = document.querySelector('.preview-play-btn');
    playButton.classList.remove('playing');
    playButton.textContent = '▶ Preview';
    isPlaying = false;
    
    if (audioPlayer) {
        audioPlayer.remove();
        audioPlayer = null;
    }
}

function saveToStorage() {
    if (!currentVideoData) {
        return;
    }
    
    const savedVideos = JSON.parse(localStorage.getItem('youtubeVideos') || '[]');
    const existsIndex = savedVideos.findIndex(video => video.id === currentVideoData.id);
    
    if (existsIndex !== -1) {
        savedVideos[existsIndex] = currentVideoData;
    } else {
        savedVideos.push(currentVideoData);
    }
    
    localStorage.setItem('youtubeVideos', JSON.stringify(savedVideos));
    
    loadAndPlayMusic(currentVideoData.id);
    
    setTimeout(() => {
        closeYouTubeModal();
    }, 1500);  
}

function loadAndPlayMusic(videoId) {
    if (audioPlayer) {
        audioPlayer.remove();
        audioPlayer = null;
    }
    
    currentVideoId = videoId;
    
    updatePlayButtonState(false);
    
    console.log('Música cargada:', videoId);
}

// Función para el botón de play/pause principal
function toggleMusicPlayback() {
    if (!currentVideoId) {
        return;
    }
    
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    if (!currentVideoId) return;
    
    if (audioPlayer) {
        audioPlayer.remove();
    }
    
    audioPlayer = document.createElement('div');
    audioPlayer.innerHTML = `
        <iframe 
            width="0" 
            height="0" 
            src="https://www.youtube.com/embed/${currentVideoId}?autoplay=1&controls=0&modestbranding=1&playsinline=1"
            frameborder="0" 
            allow="autoplay; encrypted-media"
            allowfullscreen>
        </iframe>
    `;
    document.body.appendChild(audioPlayer);
    
    isPlaying = true;
    updatePlayButtonState(true);
    
    console.log('Reproduciendo:', currentVideoId);
}

function pauseMusic() {
    if (audioPlayer) {
        audioPlayer.remove();
        audioPlayer = null;
    }
    
    isPlaying = false;
    updatePlayButtonState(false);
    
    console.log('Música pausada');
}

function updatePlayButtonState(playing) {
    const playButton = document.querySelector('.music-play-btn');
    const playIcon = playButton.querySelector('.play-icon');
    const wave = playButton.querySelector('.wave');
    
    if (playing) {
        playButton.classList.add('playing');
        playIcon.innerHTML = '<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Ícono de pausa
        wave.style.animation = 'pulse 1s infinite';
    } else {
        playButton.classList.remove('playing');
        playIcon.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>'; // Ícono de play
        wave.style.animation = 'none';
    }
}

window.addEventListener('load', function() {
    loadLastPlayedSong();
});

function loadLastPlayedSong() {
    try {
        const savedVideos = JSON.parse(localStorage.getItem('youtubeVideos') || '[]');
        if (savedVideos.length > 0) {
            const lastVideo = savedVideos[savedVideos.length - 1];
            loadAndPlayMusic(lastVideo.id);
            console.log('Última canción cargada:', lastVideo.id);
        }
    } catch (error) {
        console.error('Error cargando última canción:', error);
    }
}

// Funcion para reproducir audio
function playPreview() {
    const playButton = document.querySelector('.preview-play-btn');
    
    if (isPlaying) {
        if (audioPlayer) {
            audioPlayer.remove();
            audioPlayer = null;
        }
        playButton.classList.remove('playing');
        playButton.textContent = '▶ Preview';
        isPlaying = false;
    } else {
        playButton.classList.add('playing');
        playButton.textContent = '⏸ Stop Preview';
        isPlaying = true;
        
        audioPlayer = document.createElement('div');
        audioPlayer.innerHTML = `
            <iframe 
                width="0" 
                height="0" 
                src="https://www.youtube.com/embed/${currentVideoData.id}?autoplay=1&controls=0&modestbranding=1"
                frameborder="0" 
                allow="autoplay">
            </iframe>
        `;
        document.body.appendChild(audioPlayer);
        
        setTimeout(() => {
            if (isPlaying) {
                playButton.classList.remove('playing');
                playButton.textContent = '▶ Reproducir Audio';
                isPlaying = false;
                if (audioPlayer) {
                    audioPlayer.remove();
                    audioPlayer = null;
                }
            }
        }, 30000);
    }
}

document.getElementById('youtubeUrlInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchYouTubeVideo();
    }
});

function openYouTubeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; 

    clearModalContent();
}

function closeYouTubeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    clearModalContent();
}

function clearModalContent() {
    document.getElementById('videoPreview').style.display = 'none';
    document.getElementById('youtubeUrlInput').value = '';
    currentVideoData = null;
}

// Cerrar modal con tecla escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeYouTubeModal();
    }
});