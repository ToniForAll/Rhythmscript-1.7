const API_BASE_URL = 'https://api-rhythmscript.onrender.com/api';

let allOnlineLevels = [];
let currentLevelData = null; 

function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

async function loadTopScores(levelId) {
    try {
        const response = await fetch(`${API_BASE_URL}/scores/${levelId}`);
        
        if (response.ok) {
            const data = await response.json();
            return data.scores || [];
        } else {
            console.log('No hay puntuaciones para este nivel');
            return [];
        }
    } catch (error) {
        console.error('Error cargando puntuaciones:', error);
        return [];
    }
}

//modal para las puntuaciones tas loco
async function showLevelModal(level) {
    currentLevelData = level;
    
    // Cargar top scores
    const topScores = await loadTopScores(level.id);
    
    let modal = document.getElementById('levelModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'levelModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content level-modal">
                <div class="modal-header">
                    <h2 id="modalLevelName"></h2>
                    <button class="modal-close" onclick="closeLevelModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="level-info-section">
                        <div class="level-details">
                            <p><strong>Creador:</strong> <span id="modalCreator"></span></p>
                            <p><strong>Dificultad:</strong> <span id="modalDifficulty" class="difficulty-badge"></span></p>
                            <p><strong>Notas totales:</strong> <span id="modalTotalNotes"></span></p>
                            <p><strong>Fecha:</strong> <span id="modalDate"></span></p>
                        </div>
                        <div class="level-thumbnail-modal">
                            <img id="modalThumbnail" src="" alt="Thumbnail">
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="play-button" onclick="playLevel('${level.id}')">JUGAR NIVEL</button>
                        <button class="close-button" onclick="closeLevelModal()">Cerrar</button>
                    </div>
                    
                    <div class="scores-section">
                        <h3>Top 50</h3>
                        <div class="scores-table-container">
                            <table class="scores-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Jugador</th>
                                        <th>Puntuación</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody id="scoresTableBody">
                                    <tr><td colspan="4" class="loading-scores">Cargando puntuaciones...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('modalLevelName').textContent = level.name;
    document.getElementById('modalCreator').textContent = level.creator || 'Anónimo';
    
    const difficultySpan = document.getElementById('modalDifficulty');
    difficultySpan.textContent = level.difficulty || 'Normal';
    difficultySpan.className = `difficulty-badge difficulty-${getDifficultyClass(level.difficulty)}`;
    
    const totalNotes = countTotalNotesInLevel(level);
    document.getElementById('modalTotalNotes').textContent = totalNotes;
    
    const date = level.createdAt ? new Date(level.createdAt).toLocaleDateString() : 'Desconocida';
    document.getElementById('modalDate').textContent = date;
    
    // Thumbnail
    const videoId = getYouTubeVideoId(level.songUrl);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg` : '';
    const modalThumbnail = document.getElementById('modalThumbnail');
    if (thumbnailUrl) {
        modalThumbnail.src = thumbnailUrl;
        modalThumbnail.style.display = 'block';
    } else {
        modalThumbnail.style.display = 'none';
    }
    
    renderScoresTable(topScores);
    
    modal.classList.add('show');
}

function renderScoresTable(scores) {
    const tbody = document.getElementById('scoresTableBody');
    
    if (!tbody) return;
    
    if (scores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="no-scores">No hay puntuaciones para este nivel</td></tr>`;
        return;
    }
    
    tbody.innerHTML = scores.map((score, index) => {
        const date = new Date(score.created_at).toLocaleDateString();
        const formattedScore = score.score.toLocaleString();
        
        return `
            <tr class="${index < 3 ? `top-${index + 1}` : ''}">
                <td class="rank">${index + 1}</td>
                <td class="player-name">${escapeHtml(score.username)}</td>
                <td class="score-value">${formattedScore}</td>
                <td class="score-date">${date}</td>
            </tr>
        `;
    }).join('');
}

function closeLevelModal() {
    const modal = document.getElementById('levelModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// cargar los niveles
async function loadLevelsFromAPI() {
    try {
        console.log('Cargando niveles..');
        
        const response = await fetch(`${API_BASE_URL}/levels`);
        
        if (response.ok) {
            const levels = await response.json();
            console.log('Niveles cargados:', levels);
            return Array.isArray(levels) ? levels : [];
        } else {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error cargando niveles desde API:', error);
        throw error; 
    }
}

// RENDERIZAR NIVELES
function renderLevels(levels) {
    const grid = getElementSafe('levelsGrid');
    const resultsCount = getElementSafe('resultsCount');
    const reloadButton = getElementSafe('reloadButton');
    
    if (!grid) return;
    
    if (levels.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No hay niveles online</h3>
                <p>Los niveles creados aparecerán aquí cuando se guarden en la nube</p>
            </div>
        `;
        
        if (resultsCount) {
            resultsCount.textContent = 'No se encontraron niveles online';
        }
        
        if (reloadButton) {
            reloadButton.style.display = 'block';
        }
        return;
    }
    
    if (resultsCount) {
        resultsCount.textContent = `${levels.length} nivel${levels.length !== 1 ? 'es' : ''} online encontrado${levels.length !== 1 ? 's' : ''}`;
    }
    
    if (reloadButton) {
        reloadButton.style.display = 'none';
    }
    
    grid.innerHTML = levels.map(level => {
        const totalNotes = countTotalNotesInLevel(level);
        const videoId = getYouTubeVideoId(level.songUrl);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg` : '';
        
        return `
            <div class="level-card" data-level-id="${level.id}">
                <div class="level-card-content">
                    <div class="level-thumbnail">
                        ${thumbnailUrl ? `
                            <img src="${thumbnailUrl}" alt="${escapeHtml(level.name)}" 
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDIwMCAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTEyIiBmaWxsPSIjMjAyMDIwIi8+CjxwYXRoIGQ9Ik03NSA1NkM3NSA1My43OTAxIDc2Ljc5MDEgNTIgNzkgNTJIMTIxQzEyMy4yMSA1MiAxMjUgNTMuNzkwMSAxMjUgNTZWNjBDMTI1IDYyLjIwOTkgMTIzLjIxIDY0IDEyMSA2NEg3OUM3Ni43OTAxIDY0IDc1IDYyLjIwOTkgNzUgNjBWNTZaIiBmaWxsPSIjNjY2Ii8+Cjx0ZXh0IHg9IjEwMCUiIHk9Ijk1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9ImVuZCIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5ObyBpbWFnZW48L3RleHQ+Cjwvc3ZnPg=='">
                        ` : `
                            <div class="thumbnail-placeholder">
                                <svg width="50" height="50" viewBox="0 0 24 24">
                                    <path fill="#666" d="M8 5v14l11-7z"/>
                                </svg>
                                <span>Sin miniatura</span>
                            </div>
                        `}
                    </div>
                    
                    <div class="level-info">
                        <div class="level-header">
                            <h3 class="level-name">${escapeHtml(level.name)}</h3>
                            <span class="level-difficulty difficulty-${getDifficultyClass(level.difficulty)}">
                                ${level.difficulty || 'Normal'}
                            </span>
                        </div>
                        
                        <div class="level-creator">
                            <strong>Creado por:</strong> ${escapeHtml(level.creator || 'Anónimo')}
                        </div>
                        
                        ${totalNotes > 0 ? `
                        <div class="level-notes">
                            🎵 ${totalNotes} nota${totalNotes !== 1 ? 's' : ''} en total
                        </div>
                        ` : ''}
                        
                        <div class="level-stats">                        
                            ${level.createdAt ? `
                            <div class="level-date">
                                ${new Date(level.createdAt).toLocaleDateString()}
                            </div>
                            ` : ''}
                        </div>
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
        if (match && match[1]) {
            return match[1].split('?')[0].split('&')[0];
        }
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

function countTotalNotesInLevel(level) {
    if (!level || !level.pattern) return 0;
    
    let totalNotes = 0;
    const pattern = level.pattern;
    
    const columns = ['column1', 'column2', 'column3', 'column4'];
    columns.forEach(column => {
        if (pattern[column] && Array.isArray(pattern[column])) {
            pattern[column].forEach(note => {
                if (note === 1 || note === 2) {
                    totalNotes++;
                }
            });
        }
    });
    
    return totalNotes;
}

function getElementSafe(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Elemento con ID '${id}' no encontrado`);
    }
    return element;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStarsHTML(count) {
    const starCount = Math.min(Math.max(parseInt(count) || 1, 1), 5);
    return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
}

function searchLevels(levels, query) {
    if (!query) return levels;
    
    const searchTerm = query.toLowerCase();
    return levels.filter(level => 
        (level.name && level.name.toLowerCase().includes(searchTerm)) ||
        (level.creator && level.creator.toLowerCase().includes(searchTerm)) ||
        (level.difficulty && level.difficulty.toLowerCase().includes(searchTerm))
    );
}

function playLevel(levelId) {
    window.location.href = `gameEditorMusic.html?level=${levelId}`;
}

async function reloadLevels() {
    const reloadButton = document.getElementById('reloadButton');
    reloadButton.textContent = '🔄 Cargando...';
    reloadButton.disabled = true;
    
    try {
        await init();
    } finally {
        reloadButton.textContent = '🔄 Recargar niveles online';
        reloadButton.disabled = false;
    }
}

// funcion de inicializacion
async function init() {
    try {
        document.getElementById('levelsGrid').innerHTML = `
            <div class="empty-state">
                <h3>Cargando niveles online...</h3>
            </div>
        `;
        
        allOnlineLevels = await loadLevelsFromAPI();
        
        renderLevels(allOnlineLevels);
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Remover event listener anterior para evitar duplicados
            searchInput.removeEventListener('input', searchHandler);
            searchInput.addEventListener('input', searchHandler);
        }
        
        console.log('Niveles online cargados exitosamente:', allOnlineLevels.length);
        
    } catch (error) {
        console.error('Error cargando niveles online:', error);
        document.getElementById('levelsGrid').innerHTML = `
            <div class="empty-state">
                <h3>Error al conectar</h3>
                <p>No se pudieron cargar los niveles online</p>
                <p style="font-size: 12px; color: #888;">API: ${API_BASE_URL}</p>
                <p style="font-size: 12px; color: #ff6b6b; margin-top: 10px;">Error: ${error.message}</p>
                <p style="font-size: 12px; color: #aaa; margin-top: 5px;">
                    Verifica que el backend en Render esté activo:<br>
                    <a href="${API_BASE_URL.replace('/api', '')}/health" target="_blank" style="color: #66b3ff;">
                        Probar conexión
                    </a>
                </p>
            </div>
        `;
        document.getElementById('reloadButton').style.display = 'block';
    }
}

// Handler de búsqueda separado para poder removerlo
function searchHandler(e) {
    const filteredLevels = searchLevels(allOnlineLevels, e.target.value);
    renderLevels(filteredLevels);
}

document.addEventListener('DOMContentLoaded', function() {
    init();
    
    const reloadButton = document.getElementById('reloadButton');
    if (reloadButton) {
        reloadButton.addEventListener('click', reloadLevels);
    }
});

document.addEventListener('click', async (e) => {
    const card = e.target.closest('.level-card');
    if (card) {
        const levelId = card.getAttribute('data-level-id');
        const level = allOnlineLevels.find(l => l.id == levelId);
        if (level) {
            await showLevelModal(level);
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLevelModal();
    }
});