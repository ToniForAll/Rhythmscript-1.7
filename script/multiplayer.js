const user = getCurrentUser();
if (!user) window.location.href = 'form.html';

const SOCKET_URL = 'https://api-rhythmscript.onrender.com';
const socket = io(SOCKET_URL, {
    auth: { username: user.username },
    transports: ['polling'],
    path: '/socket.io/',
    forceNew: true
});

let currentRoom = null;
let selectedLevelInfo = null;
let isCreator = false; 
let roomPlayers = []; 
let currentResultAudio = null;
let allLevels = [];

// ============================================
// aqui se verifica si venimos de un partida con resultados
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const resultsParam = urlParams.get('results');
const roomParam = urlParams.get('room');
const timeoutParam = urlParams.get('timeout');

console.log('🔍 URL Params:', { resultsParam, roomParam, timeoutParam });

if (roomParam) {
    console.log('🎯 Sala detectada en URL:', roomParam);
    currentRoom = roomParam;
    
    // Ir directamente a la sala de espera
    document.getElementById('roomListScreen').classList.add('hidden');
    document.getElementById('waitingRoomScreen').classList.remove('hidden');
    document.getElementById('roomIdDisplay').textContent = roomParam;
    
    // Cargar niveles
    loadLevels();
    
    // Reconectar a la sala cuando el socket esté listo
    if (socket.connected) {
        console.log('🔌 Socket ya conectado, reconectando a sala');
        socket.emit('reconnect-to-room', { roomId: roomParam });
    } else {
        socket.once('connect', () => {
            console.log('✅ Socket conectado, reconectando a sala');
            socket.emit('reconnect-to-room', { roomId: roomParam });
        });
    }
    
    // Verificar si hay resultados guardados para mostrar
    const lastResults = JSON.parse(sessionStorage.getItem('lastMatchResults') || 'null');
    if (lastResults) {
        console.log('📦 Mostrando resultados guardados:', lastResults);
        setTimeout(() => {
            showResultsModal(lastResults.player1, lastResults.player2, lastResults.winner);
            sessionStorage.removeItem('lastMatchResults');
        }, 1000);
    }
} else {
    console.log('📋 No hay sala en URL, mostrando lista');
    document.getElementById('roomListScreen').classList.remove('hidden');
    document.getElementById('waitingRoomScreen').classList.add('hidden');
}

if (resultsParam === 'true' && roomParam) {
    const lastResults = JSON.parse(sessionStorage.getItem('lastMatchResults') || 'null');
    
    if (lastResults) {
        setTimeout(() => {
            showResultsModal(lastResults.player1, lastResults.player2, lastResults.winner);
            sessionStorage.removeItem('lastMatchResults');
        }, 500);
    }
}

// ============================================
// EVENTOS SOCKET
// ============================================
socket.on('connect', () => {
    console.log('Conectado. Socket ID:', socket.id);
    
    // SIEMPRE solicitar lista de salas al conectar
    socket.emit('get-rooms', (rooms) => {
        console.log('📋 Salas activas recibidas:', rooms);
        renderRooms(rooms);
    });
    
    document.getElementById('createRoomBtn').disabled = false;
});

socket.on('connect_error', (err) => {
    console.error('Error de conexión:', err);
});

socket.on('rooms-list', (rooms) => {
    renderRooms(rooms);
});

socket.on('room-update', ({ players }) => {
    const previousLength = roomPlayers.length;
    const previousReadyStates = roomPlayers.map(p => p.ready);
    
    roomPlayers = players;
    renderWaitingRoom(players);

    if (previousLength === 1 && players.length === 2) {
        console.log('🔊 Nuevo jugador se unió!');
        playJoinSound();
    }
    
    players.forEach((player, index) => {
        const wasReady = previousReadyStates[index];
        if (!wasReady && player.ready && player.username !== user.username) {
            playJoinSound();
        }
    });
    
    if (players.length > 0 && players[0]?.username === user.username) {
        isCreator = true;
    } else {
        isCreator = false;
    }
    
    updateLevelSelectionInterface();
    
    const currentPlayer = players.find(p => p.username === user.username);
    const readyBtn = document.getElementById('readyBtn');
    
    if (readyBtn && currentPlayer && !currentPlayer.ready && selectedLevelInfo) {
        readyBtn.disabled = false;
        readyBtn.textContent = 'LISTO PARA JUGAR';
    }
});

socket.on('level-selected', ({ levelId, levelName }) => {
    
    selectedLevelInfo = { id: levelId, name: levelName };

    highlightSelectedLevel(levelId);
    updateLevelInfo(levelId);
    
    // Mostrar mensaje para los no-creadores
    if (!isCreator) {
        showNotification(`El creador seleccionó: ${levelName}`, 'info');
    }
    
    // Habilitar botón ready si el jugador no está listo
    const readyBtn = document.getElementById('readyBtn');
    const currentPlayer = roomPlayers.find(p => p.username === user.username);
    
    if (readyBtn && currentPlayer && !currentPlayer.ready) {
        readyBtn.disabled = false;
        readyBtn.textContent = 'LISTO PARA JUGAR';
        console.log('Botón ready habilitado');
    }
});

socket.on('game-start', ({ levelId }) => {
    window.location.href = `gameEditorMusic.html?level=${levelId}&multiplayer=true&room=${currentRoom}`;
});

// ============================================
// FUNCIONES DE SALA
// ============================================

function playJoinSound() {
    try {
        const audio = new Audio('/sfx/notification.wav'); // Ajusta la ruta según tu archivo
        audio.volume = 0.5; // Volumen moderado
        audio.play().catch(e => console.log('Error reproduciendo sonido:', e));
    } catch (error) {
        console.log('No se pudo reproducir el sonido');
    }
}

function createRoom() {
    socket.emit('create-room', (res) => {
        if (res.success) {
            currentRoom = res.roomId;
            isCreator = true;
            showWaitingRoom(res.roomId);
        }
    });
}

function joinRoom(roomId) {
    socket.emit('join-room', { roomId }, (res) => {
        if (res.success) {
            currentRoom = roomId;
            isCreator = false; 
            showWaitingRoom(roomId);
        }
    });
}

function selectLevel(levelId, levelName) {
    // Solo el creador puede seleccionar nivel
    if (!isCreator) {
        showNotification('Solo el creador puede seleccionar el nivel', 'warning');
        return;
    }
    
    // Guardar info del nivel seleccionado
    selectedLevelInfo = { id: levelId, name: levelName };
    
    // Emitir al servidor
    socket.emit('select-level', { 
        roomId: currentRoom, 
        levelId, 
        levelName 
    });
}

function playerReady() {
    socket.emit('player-ready', { roomId: currentRoom });
    document.getElementById('readyBtn').disabled = true;
    document.getElementById('readyBtn').textContent = 'LISTO';
}

// ============================================
// FUNCIONES DE INTERFAZ
// ============================================
function updateLevelSelectionInterface() {
    const levelCards = document.querySelectorAll('.level-select-card');
    const levelSelectionHeader = document.querySelector('.levels-selection h3');
    const readyBtn = document.getElementById('readyBtn');
    
    if (isCreator) {
        // Creador: puede seleccionar niveles
        levelCards.forEach(card => {
            card.style.pointerEvents = 'auto';
            card.style.opacity = '1';
            card.title = 'Haz clic para seleccionar este nivel';
        });
        if (levelSelectionHeader) {
            levelSelectionHeader.innerHTML = 'Seleccionar nivel';
        }
    } else {
        // No creador: no puede seleccionar niveles
        levelCards.forEach(card => {
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.7';
            card.title = 'Esperando a que el creador seleccione un nivel';
        });
        if (levelSelectionHeader) {
            levelSelectionHeader.innerHTML = 'Esperando que el creador elija el mapa';
        }
        
        // Deshabilitar botón ready si no hay nivel seleccionado
        if (readyBtn && !selectedLevelInfo) {
            readyBtn.disabled = true;
            readyBtn.title = 'Esperando a que el creador seleccione un nivel';
        }
    }
}

function highlightSelectedLevel(levelId) {
    // Quitar highlight de todos los niveles
    document.querySelectorAll('.level-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Agregar highlight al nivel seleccionado
    const selectedCard = document.querySelector(`.level-select-card[data-level-id="${levelId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
}

async function updateLevelInfo(levelId) {
    try {
        const API_URL = 'https://api-rhythmscript.onrender.com/api';
        const response = await fetch(`${API_URL}/levels/${levelId}`);
        const level = await response.json();
        
        const videoId = getYouTubeVideoId(level.songUrl);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg` : '';
        
        const infoPanel = document.getElementById('selectedLevelInfo');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <div class="level-info-panel-content">
                    <div class="level-info-thumbnail">
                        <img src="${thumbnailUrl}" alt="${escapeHtml(level.name)}" 
                             onerror="this.style.display='none'">
                    </div>
                    <div class="level-info-details">
                        <h4>${escapeHtml(level.name)}</h4>
                        <p><span>Dificultad:</span> 
                            <span class="difficulty-badge difficulty-${getDifficultyClass(level.difficulty)}">
                                ${level.difficulty || 'Normal'}
                            </span>
                        </p>
                        <p><span>Creador:</span> ${escapeHtml(level.creator || 'Anónimo')}</p>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error cargando info del nivel:', error);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `game-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 30px;
        color: white;
        font-weight: bold;
        z-index: 16000;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        background: ${type === 'warning' ? 'rgba(255, 165, 0, 0.9)' : 
                    type === 'info' ? 'rgba(90, 0, 216, 0.9)' : 
                    'rgba(78, 205, 196, 0.9)'};
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// ============================================
// RENDERIZADO DE INTERFACES
// ============================================
function renderRooms(rooms) {
    const list = document.getElementById('roomsList');
    if (!list) return;
    
    if (!rooms || rooms.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>No hay salas activas</h3>
                <p>Crea una nueva sala para comenzar a jugar</p>
                <button onclick="createRoom()" class="create-room-empty-btn">
                    Crear Sala
                </button>
            </div>
        `;
        return;
    }
    
    list.innerHTML = rooms.map(r => `
        <div class="room-card" onclick="joinRoom('${r.id}')">
            <div class="room-info">
                <h3>Sala ${r.id}</h3>
                <p>Creador: ${r.creator} (${r.players}/2)</p>
            </div>
            <button class="join-btn">Unirse</button>
        </div>
    `).join('');
}

function showWaitingRoom(roomId) {
    document.getElementById('roomListScreen').classList.add('hidden');
    document.getElementById('waitingRoomScreen').classList.remove('hidden');
    document.getElementById('roomIdDisplay').textContent = roomId;
    
    // Mostrar el creador si está disponible
    if (roomPlayers.length > 0) {
        document.getElementById('roomCreatorDisplay').textContent = `Creador: ${roomPlayers[0].username}`;
    }

    const hasResults = sessionStorage.getItem('lastMatchResults');
    if (!hasResults) {
        selectedLevelInfo = null;
    }
    
    loadLevels();
    
    console.log('Sala de espera mostrada para sala:', roomId);
}

function renderWaitingRoom(players) {
    const list = document.getElementById('playersList');
    if (!list) return;
    
    list.innerHTML = players.map((p, index) => `
        <div class="player-item ${p.ready ? 'ready' : ''}">
            <span class="player-name">
                ${p.username} ${index === 0 ? '(Creador)' : ''}
            </span>
            <span class="player-status">${p.ready ? 'Listo' : 'Esperando...'}</span>
        </div>
    `).join('');
    
    const currentPlayer = players.find(p => p.username === user.username);
    const readyBtn = document.getElementById('readyBtn');
    
    if (readyBtn && currentPlayer) {
        if (!currentPlayer.ready && selectedLevelInfo && socket.connected) {
            readyBtn.disabled = false;
            readyBtn.textContent = 'Listo para jugar';
        } else {
            readyBtn.disabled = true;
            if (!selectedLevelInfo) {
                readyBtn.title = 'Esperando a que el creador seleccione un nivel';
            } else if (currentPlayer.ready) {
                readyBtn.title = 'Ya estás listo';
            }
        }
    }
}

async function loadLevels() {
    try {
        const API_URL = 'https://api-rhythmscript.onrender.com/api';
        const res = await fetch(`${API_URL}/levels`);
        allLevels = await res.json();
        
        renderLevelsGrid(allLevels);
        
        // Configurar buscador
        const searchInput = document.getElementById('levelSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredLevels = allLevels.filter(level => 
                    level.name.toLowerCase().includes(searchTerm) ||
                    (level.creator && level.creator.toLowerCase().includes(searchTerm)) ||
                    (level.difficulty && level.difficulty.toLowerCase().includes(searchTerm))
                );
                renderLevelsGrid(filteredLevels);
            });
        }
        
    } catch (error) {
        console.error('Error cargando niveles:', error);
    }
}

function renderLevelsGrid(levels) {
    const grid = document.getElementById('levelsSelectionGrid');
    if (!grid) return;
    
    if (levels.length === 0) {
        grid.innerHTML = '<div class="no-levels-message">No se encontraron niveles</div>';
        return;
    }
    
    grid.innerHTML = levels.map(level => {
        const videoId = getYouTubeVideoId(level.songUrl);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg` : '';
        const isSelected = selectedLevelInfo?.id === level.id;
        
        return `
            <div class="level-horizontal-card ${isSelected ? 'selected' : ''}" 
                 data-level-id="${level.id}" 
                 onclick="selectLevel('${level.id}', '${escapeHtml(level.name)}')">
                
                <div class="card-decoration"></div>
                
                <div class="card-content">
                    <div class="level-info">
                        <h4 class="level-name">${escapeHtml(level.name)}</h4>
                        <div class="level-meta">
                            <span class="level-difficulty-badge difficulty-${getDifficultyClass(level.difficulty)}">
                                ${level.difficulty || 'Normal'}
                            </span>
                            <span class="level-creator">${escapeHtml(level.creator || 'Anónimo')}</span>
                        </div>
                    </div>
                    
                    <div class="level-thumbnail">
                        ${thumbnailUrl ? 
                            `<img src="${thumbnailUrl}" alt="${escapeHtml(level.name)}" 
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSIjMjAyMDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00MCAzMEw4MCAzMEw4MCA2MEw0MCA2MFoiIGZpbGw9IiM1YTAwZDgiLz48dGV4dCB4PSI2MCIgeT0iNDUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">` 
                            : `<div class="no-thumbnail">📹</div>`
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getYouTubeVideoId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
        /youtube\.com\/embed\/([^?]+)/,
        /youtube\.com\/v\/([^?]+)/,
        /youtube\.com\/.*[?&]v=([^&]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

function getDifficultyClass(difficulty) {
    if (!difficulty) return 'normal';
    const diff = difficulty.toLowerCase();
    if (diff.includes('fácil') || diff.includes('easy')) return 'easy';
    if (diff.includes('difícil') || diff.includes('hard')) return 'hard';
    if (diff.includes('experto') || diff.includes('expert')) return 'expert';
    return 'normal';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// MODAL DE RESULTADOS
// ============================================
function showResultsModal(player1, player2, winner) {
    const user = getCurrentUser();
    const isWinner = user?.username === winner;
    
    playResultSound(isWinner);

    if (isWinner) {
        launchVictoryConfetti();
    }
    
    const existingModal = document.querySelector('.multiplayer-results-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'multiplayer-results-modal';
    modal.innerHTML = `
        <div class="results-content ${isWinner ? 'victory' : 'defeat'}">
            <h2>${isWinner ? '¡VICTORIA!' : 'Derrota'}</h2>
            <div class="results-players">
                <div class="player-result ${player1.username === winner ? 'winner' : ''}">
                    <h3>${player1.username}</h3>
                    <p class="score">${player1.score}</p>
                </div>
                <div class="vs">VS</div>
                <div class="player-result ${player2.username === winner ? 'winner' : ''}">
                    <h3>${player2.username}</h3>
                    <p class="score">${player2.score}</p>
                </div>
            </div>
            <h3 class="winner-announcement">Ganador: ${winner}</h3>
            <div class="modal-buttons">
                <button onclick="closeResultsModal()" class="close-button">Cerrar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function playResultSound(isVictory) {
    try {
        if (currentResultAudio) {
            currentResultAudio.pause();
            currentResultAudio.currentTime = 0;
        }
        
        const audio = new Audio(isVictory ? '/sfx/victory.ogg' : '/sfx/defeat.wav');
        audio.volume = 0.6;
        audio.play().catch(e => console.log('Error reproduciendo sonido:', e));

        currentResultAudio = audio;

        audio.addEventListener('ended', () => {
            if (currentResultAudio === audio) {
                currentResultAudio = null;
            }
        });
    } catch (error) {
        console.log('No se pudo reproducir el sonido');
    }
}

function launchVictoryConfetti() {
    if (typeof confetti === 'undefined') {
        console.warn('canvas-confetti no está cargado');
        return;
    }
    
    // Configuración con z-index alto
    const defaultOptions = {
        zIndex: 99000, // Mayor que el modal (que tiene 15000)
    };
    
    // Disparo principal
    confetti({
        ...defaultOptions,
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5a00d8', '#8a2be2', '#ffd700', '#ff4444', '#4ecdc4']
    });
    
    // Disparos laterales
    setTimeout(() => {
        confetti({
            ...defaultOptions,
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 }
        });
        confetti({
            ...defaultOptions,
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 }
        });
    }, 200);
    
    // Tercera oleada
    setTimeout(() => {
        confetti({
            ...defaultOptions,
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 },
            startVelocity: 30,
            colors: ['#5a00d8', '#ffd700']
        });
    }, 400);
}

function closeResultsModal() {
    const modal = document.querySelector('.multiplayer-results-modal');
    if (modal) {
        modal.remove();
    }
    
    // DETENER EL SONIDO DE VICTORIA/DERROTA
    if (currentResultAudio) {
        currentResultAudio.pause();
        currentResultAudio.currentTime = 0;
        currentResultAudio = null;
        console.log('🔇 Sonido de resultado detenido');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('createRoomBtn');
    if (createBtn) {
        createBtn.addEventListener('click', createRoom);
        createBtn.disabled = true;
    }
    
    const refreshBtn = document.getElementById('refreshRoomsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            socket.emit('get-rooms', (rooms) => renderRooms(rooms));
        });
    }
    
    const readyBtn = document.getElementById('readyBtn');
    if (readyBtn) {
        readyBtn.addEventListener('click', playerReady);
    }
    
    const leaveBtn = document.getElementById('leaveRoomBtn');
    if (leaveBtn) {
        leaveBtn.addEventListener('click', () => {
            if (currentRoom) {
                socket.emit('leave-room');
                currentRoom = null;
                document.getElementById('roomListScreen').classList.remove('hidden');
                document.getElementById('waitingRoomScreen').classList.add('hidden');
                socket.emit('get-rooms', (rooms) => renderRooms(rooms));
            }
        });
    }
});

function leaveRoom() {
    if (currentRoom) {
        socket.emit('leave-room', () => {
            console.log('Sala abandonada, solicitando lista actualizada...');
            
            // Limpiar estado
            currentRoom = null;
            isCreator = false;
            selectedLevelInfo = null;
            
            // Volver a la lista de salas
            document.getElementById('roomListScreen').classList.remove('hidden');
            document.getElementById('waitingRoomScreen').classList.add('hidden');
            
            // Solicitar lista actualizada
            socket.emit('get-rooms', (rooms) => {
                renderRooms(rooms);
            });
        });
    }
}

document.getElementById('refreshRoomsBtn').addEventListener('click', () => {
    socket.emit('get-rooms', (rooms) => {
        renderRooms(rooms);
    });
});

// Exponer funciones globales
window.joinRoom = joinRoom;
window.selectLevel = selectLevel;
window.closeResultsModal = closeResultsModal;