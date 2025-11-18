import { endScreen } from "./endScreen.js";

// let userData = localStorage.getItem('userData');

// validacion para volver a la pagina de inicio si no inicia sesion

// if (!userData) { window.location.href = 'index.html' };

const hit = new Audio('/sfx/soft-hitsoft.mp3');
const hitclam = new Audio('/sfx/drum-hitnormal.mp3');

let musicName = '';
let audioPlayer = null;

hit.load();
hitclam.load();

const params = new URLSearchParams(window.location.search);
const levelId = params.get('level');

function getLevelById(id) {
    const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    return levels.find(level => level.id == id);
}

const currentLevel = getLevelById(levelId);

if (currentLevel) {
    musicName = `${currentLevel.name} - ${currentLevel.creator}, ${currentLevel.difficulty}`;
    console.log('Nivel cargado:', currentLevel);
} else {
    console.error('Nivel no encontrado');
    document.body.innerHTML = '<h1>Nivel no encontrado</h1><p>El nivel que buscas no existe.</p>';
}

function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function loadYouTubeMusic() {
    if (!currentLevel || !currentLevel.songUrl) return;
    
    const videoId = getYouTubeVideoId(currentLevel.songUrl);
    if (videoId) {
        createYouTubePlayer(videoId);
    } else {
        console.error('URL de YouTube no válida');
    }
}

function createYouTubePlayer(videoId) {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
            initYouTubePlayer(videoId);
        };
    } else {
        initYouTubePlayer(videoId);
    }
}

function initYouTubePlayer(videoId) {
    const playerContainer = document.createElement('div');
    playerContainer.id = 'youtube-player-container';
    playerContainer.style.display = 'none';
    document.body.appendChild(playerContainer);
    
    audioPlayer = new YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
            'autoplay': 0, // No autoplay, lo controlaremos manualmente
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'fs': 0,
            'iv_load_policy': 3,
            'modestbranding': 1,
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    console.log('Reproductor de YouTube listo y cargado');
    // La música está cargada pero no reproducida aún
    startCountdown();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        console.log('Música de YouTube reproduciéndose');
    } else if (event.data === YT.PlayerState.ENDED) {
        console.log('Música de YouTube terminada');
    }
}

function onPlayerError(event) {
    console.error('Error en reproductor YouTube:', event.data);
    // Iniciar contador incluso si hay error
    startCountdown();
}

function setYouTubeVolume(volume) {
    if (audioPlayer && audioPlayer.setVolume) {
        const youtubeVolume = Math.round(volume * 100);
        audioPlayer.setVolume(youtubeVolume);
    }
}

function main() {
    
    const fail = new Audio('/sfx/failsound.ogg');
    const finishsong = new Audio('/sfx/applause.ogg');
    const comboBreak = new Audio('/sfx/combobreak.wav');
    const volumen = localStorage.getItem('volumen');

    const tecla1 = (localStorage.getItem('teclaP1') || 'd').toLowerCase();
    const tecla2 = (localStorage.getItem('teclaP2') || 'f').toLowerCase();
    const tecla3 = (localStorage.getItem('teclaP3') || 'j').toLowerCase();
    const tecla4 = (localStorage.getItem('teclaP4') || 'k').toLowerCase();
    const tecla5 = (localStorage.getItem('teclaP5') || ' ').toLowerCase();
    const valorActual = (localStorage.getItem('velocidad') || '1');

    // Removemos la variable 'level' ya que usamos YouTube
    fail.volume = volumen;
    finishsong.volume = volumen;
    hit.volume = volumen;
    comboBreak.volume = volumen;
    hitclam.volume = volumen;
    setYouTubeVolume(volumen);

    const keys = {
        [tecla1]: { pressed: false, button: "myButton1", sound: hit },
        [tecla2]: { pressed: false, button: "myButton2", sound: hit },
        [tecla3]: { pressed: false, button: "myButton3", sound: hit },
        [tecla4]: { pressed: false, button: "myButton4", sound: hit },
        [tecla5]: { pressed: false, button: "myButton5", sound: hitclam }
    };

    document.addEventListener("keydown", function (event) {
        const key = event.key.toLowerCase();
        if (keys[key] && !keys[key].pressed) {
            keys[key].pressed = true;

            keys[key].sound.volume = volumen;
            keys[key].sound.pause();
            keys[key].sound.currentTime = 0;
            keys[key].sound.play();

            document.getElementById(keys[key].button).click();
            const boton = document.getElementById(keys[key].button);
            if((!keys[" "].pressed)){
                boton.style.backgroundColor = '#6054bd';
            }
        }
    });

    document.addEventListener("keyup", function (event) {
        const key = event.key.toLowerCase();
        if (keys[key]) {
            keys[key].pressed = false;
            const boton = document.getElementById(keys[key].button);
            boton.style.backgroundColor = 'transparent';
        }
    });

    function createImageElement(src) {
        const img = document.createElement('img');
        img.classList.add('pointIcon');
        img.src = src;
        return img;
    }

    function changeHeight() {
        document.querySelector('.life').style.height = life + '%';
    }

    function createCircles(musicArray, index, pathBtn, path, pathClass) {
        for (let i = 0; i < musicArray.length; i++) {
            
            
            // Staggered timeout to create circles
            setTimeout(() => {
                console.log(`Creating circle for musicArray[${i}]:`, musicArray[i]);
                indexes[index] = musicArray[i]; // Update the local variable
                
                if (musicArray[i] === 1) {
                    const circle = document.createElement("div");
                    circle.classList.add("circle", pathClass, "circle" + i);
                    circle.style.animation = `Bajarabajo ${valorActual}s linear`;
                    path.appendChild(circle);
                    
                    let circleRemoved = false;
    
                    const timerId = setTimeout(() => {
                        if (!circleRemoved) {
                            const circle2 = document.querySelector(".circle" + i);
                            if (circle2) {
                                const circleRect = circle2.getBoundingClientRect();
                                const buttonRect = pathBtn.getBoundingClientRect();
                    
                                console.log('circleRect:', circleRect);
                                console.log('buttonRect:', buttonRect);
                    
                                // Agregar un margen para la verificación
                                const margin = 5; // Ajusta este valor según sea necesario
                                if (circleRect.bottom + margin < buttonRect.top) {
                                    if (combo >= 20) {
                                        comboBreak.play();
                                    }
                    
                                    combo = 0;
                                    life -= 10;
                                    scorePoints.innerText = life;
                                    changeHeight();
                    
                                    const container = document.getElementById('pointIcon');
                                    const existingElement = container.querySelector(`.pointIcon`);
                                    if (existingElement) {
                                        container.removeChild(existingElement);
                                    }
                                    container.appendChild(img1);
                    
                                    comboNumber.classList.add('great');
                                    comboNumber.innerText = '';
                                    missNotes++;
                                    path.removeChild(circle2);
                                    circleRemoved = true; // Mark as removed
                                }
                            }
                        }
                    }, 1050);
                }
            }, 150 * i); // Adjust this value if needed
        }
    }

    function checkForClick(pathBtn, path, pathClass) {
        setTimeout(() => {
            if (combo > maxcombo) {
                maxcombo = combo;
            }
        }, 100);

        pathBtn.style.transition = 'box-shadow 0.1s ease';
        const circles = document.querySelectorAll(`.${pathClass}`);
        const buttonRect = pathBtn.getBoundingClientRect();
        const buttonThreshold = buttonRect.top + (buttonRect.height * 0.75); // 75% del botón
        const buttonTopAmplified = buttonRect.top - (buttonRect.height * 1.1);
        const buttonBottomAmplified = buttonRect.bottom + (buttonRect.height * 1.1);
        let circleRect;
        let circleRemoved = false;

        if (circles.length > 0) {
            circleRect = circles[0].getBoundingClientRect();
        } else {
            return;
        }

        if (circleRect.bottom > buttonRect.top && circleRect.top < buttonRect.bottom && circleRect.right > buttonRect.left && circleRect.left < buttonRect.right) {
            if (circleRect.bottom > buttonThreshold) {
                score += 300;

                pathBtn.style.boxShadow = '0 0 20px 5px rgb(19, 47, 255), inset 0 0 20px 5px rgb(19, 47, 255)';
                setTimeout(() => {
                    pathBtn.style.boxShadow = '';
                }, 150); 

                combo++;
                perfectNotes++;
                correctNotes++;
                comboNumber.innerText = combo;
                displayPointIcon(img3);
                if (!circleRemoved) {
                    path.removeChild(circles[0]);
                    circleRemoved = true;
                }
            } else if (circleRect.top >= buttonTopAmplified && circleRect.bottom <= buttonBottomAmplified) {
                score += 100;
                
                pathBtn.style.boxShadow = '0 0 20px 5px rgb(91, 255, 31), inset 0 0 20px 5px rgb(91, 255, 31)';
                setTimeout(() => {
                    pathBtn.style.boxShadow = '';
                }, 150); 

                greatNotes++;
                correctNotes++;
                combo++;
                comboNumber.classList.add('great');
                comboNumber.innerText = combo;
                displayPointIcon(img2);
                if (!circleRemoved) {
                    path.removeChild(circles[0]);
                    circleRemoved = true;
                }
            }
        } else {
            if (!circleRemoved) {
                life -= 10;
                if (combo >= 20) {
                    comboBreak.play();
                }
                combo = 0;

                pathBtn.style.boxShadow = '0 0 20px 5px rgb(255, 47, 47), inset 0 0 20px 5px rgb(255, 47, 47)';
                setTimeout(() => {
                    pathBtn.style.boxShadow = '';
                }, 150); 

                comboNumber.classList.add('great');
                comboNumber.innerText = '';
                scorePoints.innerText = life;
                changeHeight();
                displayPointIcon(img1);
                missNotes++;
                path.removeChild(circles[0]);
                circleRemoved = true;
            }
        }
    }

    function displayPointIcon(icon) {
        const container = document.getElementById('pointIcon');
        const existingElement = container.querySelector(`.pointIcon`);
        if (existingElement) {
            container.removeChild(existingElement);
        }
        container.appendChild(icon);
    }

    function countTotalNotes(musicArray) {
        for (let i = 0; i < musicArray.length; i++) {
            if (musicArray[i] === 1 || musicArray[i] === 2) {
                totalNotes += 1;
            }
        }
    }

    let music1 = [];
    let music2 = [];
    let music3 = [];
    let music4 = [];
    let musicExtra = [];

    let mapafila1;
    let mapafila2;
    let mapafila3;
    let mapafila4;
    let mapafila5;

    if (currentLevel && currentLevel.pattern) {
        const pattern = currentLevel.pattern;
        
        mapafila1 = pattern.column1 || [];
        mapafila2 = pattern.column2 || [];
        mapafila3 = pattern.column3 || [];
        mapafila4 = pattern.column4 || [];
        mapafila5 = [];
        
        
        if (mapafila1.length > 0 && mapafila1[mapafila1.length - 1] !== 'end') {
            mapafila1.push('end');
        }
        if (mapafila2.length > 0 && mapafila2[mapafila2.length - 1] !== 'end') {
            mapafila2.push('end');
        }
        if (mapafila3.length > 0 && mapafila3[mapafila3.length - 1] !== 'end') {
            mapafila3.push('end');
        }
        if (mapafila4.length > 0 && mapafila4[mapafila4.length - 1] !== 'end') {
            mapafila4.push('end');
        }
        // if (mapafila5.length > 0 && mapafila5[mapafila5.length - 1] !== 'end') {
         mapafila5.push('end');   
        // }


        console.log(mapafila1);
    }

    music1 = mapafila1;
    music2 = mapafila2;
    music3 = mapafila3;
    music4 = mapafila4;
    musicExtra = mapafila5;

    //indices de los path's
    let indexes = {
        index1Value: '',
        index2Value: '',
        index3Value: '',
        index4Value: '',
        index5Value: ''
    };


    const path1 = document.querySelector(".path1");
    const path2 = document.querySelector(".path2");
    const path3 = document.querySelector(".path3");
    const path4 = document.querySelector(".path4");
    const path5 = document.querySelector(".path5");

    const scorePoints = document.getElementById('scorePoints');
    const pointIcon = document.querySelector('.pointIcon');
    const comboNumber = document.querySelector('.combo');

    const img1 = createImageElement('./img/mania-hit0.png');
    const img2 = createImageElement('./img/mania-hit200.png');
    const img3 = createImageElement('./img/mania-hit300g.png');

    const pathBtn1 = document.getElementById("myButton1");
    const pathBtn2 = document.getElementById("myButton2");
    const pathBtn3 = document.getElementById("myButton3");
    const pathBtn4 = document.getElementById("myButton4");
    const pathBtn5 = document.getElementById("myButton5");

    pathBtn1.textContent = tecla1.toUpperCase();
    pathBtn2.textContent = tecla2.toUpperCase();
    pathBtn3.textContent = tecla3.toUpperCase();
    pathBtn4.textContent = tecla4.toUpperCase();

    let maxcombo = 0;
    let combo = 0;
    let score = 0;
    let perfectNotes = 0;
    let greatNotes = 0;
    let missNotes = 0;
    let totalNotes = 0;
    let correctNotes = 0;
    let life = 100;

    countTotalNotes(music1);
    countTotalNotes(music2);
    countTotalNotes(music3);
    countTotalNotes(music4);
    countTotalNotes(musicExtra);

    createCircles(music1, 'index1Value', pathBtn1, path1, "circlePath1");
    createCircles(music2, 'index2Value', pathBtn2, path2, "circlePath2");
    createCircles(music3, 'index3Value', pathBtn3, path3, "circlePath3");
    createCircles(music4, 'index4Value', pathBtn4, path4, "circlePath4");
    createCircles(musicExtra, 'index5Value', pathBtn5, path5, "circlePathExtra");

    pathBtn1.addEventListener('click', () => { checkForClick(pathBtn1, path1, 'circlePath1'); });
    pathBtn2.addEventListener('click', () => { checkForClick(pathBtn2, path2, 'circlePath2'); });
    pathBtn3.addEventListener('click', () => { checkForClick(pathBtn3, path3, 'circlePath3'); });
    pathBtn4.addEventListener('click', () => { checkForClick(pathBtn4, path4, 'circlePath4'); });
    pathBtn5.addEventListener('click', () => { checkForClick(pathBtn5, path5, 'circlePathExtra'); });

    scorePoints.innerText = life;

    function stopYouTubeMusic() {
        if (audioPlayer) {
            audioPlayer.stopVideo();
        }
    }

    const intervalId = setInterval(() => {

        //comprobar que todos los arrays de notas hayan terminado
        if (indexes.index1Value == 'end' && indexes.index2Value == 'end' && indexes.index3Value == 'end' && indexes.index4Value == 'end' && indexes.index5Value == 'end') {
            stopYouTubeMusic();
            
            setTimeout(() => {
                endScreen(score, perfectNotes, greatNotes, missNotes, correctNotes, totalNotes, maxcombo, life, musicName);
                finishsong.play();
            }, 3000);
            clearInterval(intervalId);
        }

        if (life < 100) {
            changeHeight();
            scorePoints.innerText = life;
            life += 10;
        }
        changeHeight();
        scorePoints.innerText = life;

        if (life <= 0) {
            fail.play();
            stopYouTubeMusic();

            endScreen(score, perfectNotes, greatNotes, missNotes, correctNotes, totalNotes, maxcombo, life, musicName);
            clearInterval(intervalId);
        }

        console.log("hola" + indexes.index1Value);
        console.log("hola" + indexes.index2Value);
        console.log("hola" + indexes.index3Value);
        console.log("hola" + indexes.index4Value);
        console.log("hola" + indexes.index5Value);
    }, 1000)

    setTimeout(() => {
        //funcion para limpiar el nivel despues de x tiempo
        const circles = document.querySelectorAll('.circle');

        if (circles.length > 0) {
            circles.forEach((circle) => {
                path1.removeChild(circle);
            });
        }
    }, 1200000);
}

const bodyRemove = document.getElementById('bodyRemove');

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

document.addEventListener('DOMContentLoaded', function() {
    if (isMobile()) {
        const bodyRemove = document.body;
        while (bodyRemove.firstChild) {
            bodyRemove.removeChild(bodyRemove.firstChild);
            bodyRemove.style.backgroundImage = 'none'; 
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
    } else if (currentLevel && currentLevel.songUrl) {
        loadYouTubeMusic();
    } else {
        startCountdown();
    }
});

function startCountdown() {
    const body = document.querySelector("body");
    const countBg = document.createElement("div");
    let counter = 4;
    countBg.classList.add("countBg");
    countBg.innerHTML = `<h1 class="inicio">${counter}</h1>`;
    body.appendChild(countBg);

    function count() {
        counter--;
        countBg.innerHTML = `<h1 class="inicio">${counter}</h1>`;

        if (counter === 1) {
            setTimeout(() => {
                countBg.remove();
                startMusicAndGame();
            }, 1000);
        } else {
            setTimeout(count, 1000);
        }
    }
    
    count();
}

function startMusicAndGame() {
    if (audioPlayer) {
        audioPlayer.playVideo();
    }
    
    main();
}