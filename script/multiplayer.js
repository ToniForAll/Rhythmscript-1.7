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

// ============================================
// aqui se verifica si venimos de un partida con resultados
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const resultsParam = urlParams.get('results');
const roomParam = urlParams.get('room');
const timeoutParam = urlParams.get('timeout');

console.log('🔍 URL Params:', { resultsParam, roomParam, timeoutParam });

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
    roomPlayers = players;
    renderWaitingRoom(players);
    
    // Determinar si el usuario actual es el creador
    if (players.length > 0 && players[0]?.username === user.username) {
        isCreator = true;
    } else {
        isCreator = false;
    }
    
    // Actualizar la interfaz según el rol
    updateLevelSelectionInterface();
    
    // Verificar si ya hay un nivel seleccionado y habilitar botón ready
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
                <div class="level-info-panel">
                    <div class="level-info-thumbnail">
                        <img src="${thumbnailUrl}" alt="${level.name}" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDIwMCAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTEyIiBmaWxsPSIjMjAyMDIwIi8+CjxwYXRoIGQ9Ik03NSA1NkM3NSA1My43OTAxIDc2Ljc5MDEgNTIgNzkgNTJIMTIxQzEyMy4yMSA1MiAxMjUgNTMuNzkwMSAxMjUgNTZWNjBDMTI1IDYyLjIwOTkgMTIzLjIxIDY0IDEyMSA2NEg3OUM3Ni43OTAxIDY0IDc1IDYyLjIwOTkgNzUgNjBWNTZaIiBmaWxsPSIjNjY2Ii8+Cjx0ZXh0IHg9IjEwMCUiIHk9Ijk1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9ImVuZCIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5ObyBpbWFnZW48L3RleHQ+Cjwvc3ZnPg=='">
                    </div>
                    <div class="level-info-details">
                        <h4>${escapeHtml(level.name)}</h4>
                        <p><span>Dificultad:</span> <span class="difficulty-badge difficulty-${getDifficultyClass(level.difficulty)}">${level.difficulty || 'Normal'}</span></p>
                        <p><span>Creador:</span> ${escapeHtml(level.creator || 'Anónimo')}</p>
                        <p class="level-selected-badge">Nivel Seleccionado!</p>
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

    selectedLevelInfo = null;
    
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
        const levels = await res.json();
        
        const grid = document.getElementById('levelsSelectionGrid');
        if (!grid) return;
        
        // Crear contenedor para la selección de niveles si no existe
        if (!document.getElementById('levelSelectionContainer')) {
            const container = document.createElement('div');
            container.id = 'levelSelectionContainer';
            container.className = 'level-selection-container';
            grid.parentNode.insertBefore(container, grid);
            container.appendChild(grid);
            
            // Agregar panel de información
            const infoPanel = document.createElement('div');
            infoPanel.id = 'selectedLevelInfo';
            infoPanel.className = 'selected-level-info';
            container.appendChild(infoPanel);
        }
        
        grid.innerHTML = levels.map(l => `
            <div class="level-select-card" data-level-id="${l.id}" onclick="selectLevel('${l.id}', '${escapeHtml(l.name)}')">
                <h4>${escapeHtml(l.name)}</h4>
                <p>${escapeHtml(l.difficulty || 'Normal')}</p>
                <p class="level-creator">${escapeHtml(l.creator || 'Anónimo')}</p>
            </div>
        `).join('');
        
        // Aplicar restricciones de interfaz según el rol
        updateLevelSelectionInterface();
        
    } catch (error) {
        console.error('Error cargando niveles:', error);
    }
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
    console.log('🏆 Mostrando modal de resultados:', { player1, player2, winner });
    
    const user = getCurrentUser();
    const isWinner = user?.username === winner;
    
    const existingModal = document.querySelector('.multiplayer-results-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'multiplayer-results-modal';
    modal.innerHTML = `
        <div class="results-content">
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

function closeResultsModal() {
    const modal = document.querySelector('.multiplayer-results-modal');
    if (modal) modal.remove();
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