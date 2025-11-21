const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxZAh7WVKd26u-84P3lldUaX-bswobEf8ELcEKTU__izormXQ_7p3mN5CldhFTB_8Bw/exec';

let allOnlineLevels = [];

async function loadLevelsFromSheets() {
    try {
        console.log('Cargando niveles desde Google Sheets...');
        
        const proxyUrl = 'https://corsproxy.io/?';
        const response = await fetch(proxyUrl + encodeURIComponent(SHEETS_API_URL));
        
        if (response.ok) {
            const levels = await response.json();
            console.log('Niveles cargados desde Sheets:', levels);
            return Array.isArray(levels) ? levels : [];
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('Error cargando niveles desde Sheets:', error);
        throw error; 
    }
}

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
                            <div class="stars-container">
                                ${getStarsHTML(level.stars || 1)}
                            </div>
                            
                            ${level.dateCreated ? `
                            <div class="level-date">
                                ${new Date(level.dateCreated).toLocaleDateString()}
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="level-actions">
                            <button class="play-button" onclick="playLevel('${level.id}')">
                                JUGAR
                            </button>
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

async function init() {
    try {
        document.getElementById('levelsGrid').innerHTML = `
            <div class="empty-state">
                <h3>Cargando niveles online...</h3>
                <p>Conectando con Google Sheets</p>
            </div>
        `;
        
        allOnlineLevels = await loadLevelsFromSheets();
        
        renderLevels(allOnlineLevels);
        
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            const filteredLevels = searchLevels(allOnlineLevels, e.target.value);
            renderLevels(filteredLevels);
        });
        
        console.log('Niveles online cargados exitosamente:', allOnlineLevels.length);
        
    } catch (error) {
        console.error('Error cargando niveles online:', error);
        document.getElementById('levelsGrid').innerHTML = `
            <div class="empty-state">
                <h3>Error al conectar con Google Sheets</h3>
                <p>No se pudieron cargar los niveles online</p>
                <p style="font-size: 12px; color: #ff6b6b;">Error: ${error.message}</p>
            </div>
        `;
        document.getElementById('reloadButton').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    init();
    
    document.getElementById('reloadButton').addEventListener('click', reloadLevels);
});

document.addEventListener('click', (e) => {
    const card = e.target.closest('.level-card');
    if (card && !e.target.closest('.play-button')) {
        const levelId = card.getAttribute('data-level-id');
        playLevel(levelId);
    }
});