let isEditMode = false;
let currentEditLevelId = null;
let originalLevelData = null;

function loadLevelForEditing(levelId) {
    const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    const levelToEdit = levels.find(level => level.id === levelId);
    
    if (!levelToEdit) {
        console.error('Nivel no encontrado:', levelId);
        return false;
    }
    
    currentEditLevelId = levelId;
    originalLevelData = levelToEdit;
    isEditMode = true;
    
    console.log('Cargando nivel para edición:', levelToEdit);
    
    if (levelToEdit.songUrl) {
        CURRENT_VIDEO_STORAGE.url = levelToEdit.songUrl;
        CURRENT_VIDEO_STORAGE.id = getYouTubeId(levelToEdit.songUrl);
        loadAndPlayMusic(CURRENT_VIDEO_STORAGE.id);
    }
    
    loadPatternIntoEditor(levelToEdit.pattern);
    
    populateFormWithLevelData(levelToEdit);
    
    return true;
}

function loadPatternIntoEditor(pattern) {
    if (!pattern) return;
    
    console.log('Cargando patrón en editor:', pattern);
    
    clearAllDots();
    
    const columns = ['column1', 'column2', 'column3', 'column4'];
    const maxLines = pattern.totalLines || Math.max(
        pattern.column1?.length || 0,
        pattern.column2?.length || 0,
        pattern.column3?.length || 0,
        pattern.column4?.length || 0
    );
    
    ensureEnoughLines(maxLines);
    
    columns.forEach((columnName, columnIndex) => {
        const columnData = pattern[columnName];
        if (!columnData || !Array.isArray(columnData)) return;
        
        columnData.forEach((noteValue, lineIndex) => {
            if (noteValue === 1) {
                const lineNumber = lineIndex + 1;
                createDotAtPosition(columnIndex, lineNumber);
            }
        });
    });

    setTimeout(() => {
        setupAllButtonsAfterLoad();
    }, 100);
    
    console.log('Patrón cargado exitosamente');
}

function ensureEnoughLines(requiredLines) {
    const currentLines = document.querySelectorAll('.column-level .line').length / 4;
    
    if (requiredLines > currentLines) {
        const linesToAdd = requiredLines - currentLines;
        for (let i = 0; i < linesToAdd; i++) {
            addNewLineToAllColumns();
        }
    }
}

function createDotAtPosition(columnIndex, lineNumber) {
    const columns = document.querySelectorAll('.column-level');
    if (columnIndex >= columns.length) return;
    
    const column = columns[columnIndex];
    const lines = column.querySelectorAll('.line');
    const targetLine = Array.from(lines).find(line => 
        parseInt(line.getAttribute('data-line')) === lineNumber
    );
    
    if (targetLine && !targetLine.classList.contains('has-rhythm-dot')) {
        const button = targetLine.querySelector('.line-button');
        const uniqueDotId = `rhythm-dot-${columnIndex}-${lineNumber}-edit`;

        const rhythmDot = document.createElement('div');
        rhythmDot.className = 'rhythm-dot pulse';
        rhythmDot.id = uniqueDotId;
        
        targetLine.appendChild(rhythmDot);
        targetLine.classList.add('has-rhythm-dot');
        
        activeRhythmDots[uniqueDotId] = {
            element: rhythmDot,
            columnIndex: columnIndex,
            lineNumber: lineNumber,
            lineElement: targetLine,
            uniqueId: uniqueDotId
        };
        
        updateButtonState(button, columnIndex, true);

        setupButtonClickHandler(button, columnIndex, lineNumber, uniqueDotId);
    }
}

function setupButtonClickHandler(button, columnIndex, lineNumber, uniqueDotId) {
    button.onclick = null;

    button.onclick = function() {
        const lineElement = this.parentElement;
        toggleCircle(lineElement, columnIndex, lineNumber, uniqueDotId);
    };
}

function setupAllButtonsAfterLoad() {
    const buttons = document.querySelectorAll('.line-button');
    buttons.forEach(button => {
        const lineElement = button.parentElement;
        const lineNumber = parseInt(lineElement.getAttribute('data-line'));
        const columnElement = lineElement.parentElement;
        const columns = document.querySelectorAll('.column-level');
        const columnIndex = Array.from(columns).indexOf(columnElement);
        
        const existingDotId = Object.keys(activeRhythmDots).find(dotId => {
            const dot = activeRhythmDots[dotId];
            return dot.columnIndex === columnIndex && dot.lineNumber === lineNumber;
        });
        
        const dotId = existingDotId || `rhythm-dot-${columnIndex}-${lineNumber}`;

        setupButtonClickHandler(button, columnIndex, lineNumber, dotId);
    });
}

function clearAllDots() {
    document.querySelectorAll('.rhythm-dot').forEach(dot => dot.remove());
    document.querySelectorAll('.line').forEach(line => line.classList.remove('has-rhythm-dot'));
    
    for (const dotId in activeRhythmDots) {
        delete activeRhythmDots[dotId];
    }
    
    document.querySelectorAll('.line-button').forEach(button => {
        button.textContent = '+';
        button.classList.remove('active', 'minus');
    });
}

function populateFormWithLevelData(levelData) {
    document.getElementById('levelName').value = levelData.name || '';
    document.getElementById('creatorName').value = levelData.creator || '';
    document.getElementById('levelDifficulty').value = levelData.difficulty || 'Normal';
    
    const stars = levelData.stars || 1;
    selectedStars = stars;
    document.getElementById('selectedStars').value = stars;

    const starElements = document.querySelectorAll('.star');
    starElements.forEach((star, index) => {
        if (index < stars) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    if (levelData.songUrl) {
        document.getElementById('songUrlDisplay').textContent = levelData.songUrl;
    }
}

function updateLevelInStorage(levelData) {
    const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    const levelIndex = levels.findIndex(level => level.id === levelData.id);
    
    if (levelIndex !== -1) {
        levels[levelIndex] = levelData;
        localStorage.setItem('rhythmLevels', JSON.stringify(levels));
        console.log('Nivel actualizado en localStorage:', levelData);
    } else {
        throw new Error('Nivel no encontrado para actualizar');
    }
}

async function updateLevelInSheets(levelData) {
    try {
        const proxyUrl = 'https://corsproxy.io/?';
        const updateData = {
            ...levelData,
            action: 'update'
        };
        
        console.log('Enviando actualización a Sheets:', updateData);
        
        const response = await fetch(proxyUrl + encodeURIComponent(SHEETS_API_URL), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
    } catch (error) {
        console.log('Error en actualización online:', error);
        return { success: false, error: error.message };
    }
}

function openCreateForm() {
    const modal = document.getElementById('createModal');
    modal.style.display = 'flex';
    
    const title = modal.querySelector('h3');
    if (isEditMode) {
        title.textContent = '✏️ Editar Nivel';
        document.querySelector('.confirm-btn').textContent = 'Actualizar Nivel';
    } else {
        title.textContent = '🎵 Crear Nuevo Nivel';
        document.querySelector('.confirm-btn').textContent = 'Crear Nivel';
        resetStars();
    }
    
    const currentUrl = getCurrentVideoUrl();
    if (currentUrl) {
        document.getElementById('songUrlDisplay').textContent = currentUrl;
    } else {
        document.getElementById('songUrlDisplay').textContent = 'No hay canción cargada';
    }
}

