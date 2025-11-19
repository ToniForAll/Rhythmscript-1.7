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
        
        return `
            <div class="level-card" data-level-id="${level.id}">
                <div class="level-header">
                    <h3 class="level-name">${escapeHtml(level.name)}</h3>
                    <span class="level-difficulty difficulty-${getDifficultyClass(level.difficulty)}">
                        ${level.difficulty || 'Normal'}
                    </span>
                </div>
                
                <div class="level-creator">
                    Creado por: ${escapeHtml(level.creator || 'Anónimo')}
                </div>
                
                ${totalNotes > 0 ? `
                <div class="level-notes">
                    ${totalNotes} nota${totalNotes !== 1 ? 's' : ''} en total
                </div>
                ` : ''}
                
                ${level.songUrl ? `
                <div class="level-song">
                    URL disponible
                </div>
                ` : ''}
                
                <div class="level-meta">
                    <div class="stars-container">
                        ${getStarsHTML(level.stars || 1)}
                    </div>
                    <button class="play-button" onclick="playLevel('${level.id}')">
                        JUGAR
                    </button>
                </div>
                
                ${level.dateCreated ? `
                <div class="level-date">
                    Creado: ${new Date(level.dateCreated).toLocaleDateString()}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
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