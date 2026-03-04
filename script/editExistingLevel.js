let currentEditLevelId = null;
let originalLevelData = null;

async function loadLevelForEditing(levelId) {
    try {
        console.log('🔍 Buscando nivel:', levelId);
        
        // Intentar cargar desde API primero
        const response = await fetch(`${API_BASE_URL}/levels/${levelId}`);
        
        if (response.ok) {
            const level = await response.json();
            console.log('Nivel cargado desde API para editar:', level);
            
            // Guardar datos originales
            originalLevelData = level;
            currentEditLevelId = levelId;
            
            // Rellenar el formulario
            populateFormWithLevelData(level);
            
            // Cargar patrón en el editor
            if (level.pattern) {
                loadPatternIntoEditor(level.pattern);
            }
            
            return true;
        } else {
            console.log('o encontrado en API, buscando en localStorage...');
            const localLevels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
            const level = localLevels.find(l => l.id === levelId);
            
            if (level) {
                console.log('Nivel cargado desde localStorage:', level);
                
                originalLevelData = level;
                currentEditLevelId = levelId;
                
                populateFormWithLevelData(level);
                
                if (level.pattern) {
                    loadPatternIntoEditor(level.pattern);
                }
                
                return true;
            }
            
            return false;
        }
    } catch (error) {
        console.error('❌ Error al cargar nivel para editar:', error);
        return false;
    }
}

// rellenar formulario
function populateFormWithLevelData(levelData) {
    document.getElementById('levelName').value = levelData.name || '';
    document.getElementById('creatorName').value = levelData.creator || '';
    document.getElementById('levelDifficulty').value = levelData.difficulty || 'Normal';
    
    const stars = levelData.stars || 1;
    document.getElementById('selectedStars').value = stars;
    
    // Actualizar visualización de estrellas (usa selectedStars global)
    const starElements = document.querySelectorAll('.star');
    starElements.forEach((star, index) => {
        if (index < stars) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    window.selectedStars = stars;

    if (levelData.songUrl) {
        document.getElementById('songUrlDisplay').textContent = levelData.songUrl;
    }
}

// cargar patron del nivel
function loadPatternIntoEditor(pattern) {
    if (!pattern) return;
    
    console.log('🎵 Cargando patrón en editor:', pattern);
    
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
            if (typeof addNewLineToAllColumns === 'function') {
                addNewLineToAllColumns();
            }
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
        
        if (typeof activeRhythmDots !== 'undefined') {
            activeRhythmDots[uniqueDotId] = {
                element: rhythmDot,
                columnIndex: columnIndex,
                lineNumber: lineNumber,
                lineElement: targetLine,
                uniqueId: uniqueDotId
            };
        }
        
        if (button) {
            updateButtonState(button, columnIndex, true);
            setupButtonClickHandler(button, columnIndex, lineNumber, uniqueDotId);
        }
    }
}

function setupButtonClickHandler(button, columnIndex, lineNumber, uniqueDotId) {
    button.onclick = null;
    button.onclick = function() {
        const lineElement = this.parentElement;
        if (typeof toggleCircle === 'function') {
            toggleCircle(lineElement, columnIndex, lineNumber, uniqueDotId);
        }
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
        
        const existingDotId = typeof activeRhythmDots !== 'undefined' ? 
            Object.keys(activeRhythmDots).find(dotId => {
                const dot = activeRhythmDots[dotId];
                return dot.columnIndex === columnIndex && dot.lineNumber === lineNumber;
            }) : null;
        
        const dotId = existingDotId || `rhythm-dot-${columnIndex}-${lineNumber}`;
        setupButtonClickHandler(button, columnIndex, lineNumber, dotId);
    });
}

function clearAllDots() {
    document.querySelectorAll('.rhythm-dot').forEach(dot => dot.remove());
    document.querySelectorAll('.line').forEach(line => line.classList.remove('has-rhythm-dot'));
    
    if (typeof activeRhythmDots !== 'undefined') {
        for (const dotId in activeRhythmDots) {
            delete activeRhythmDots[dotId];
        }
    }
    
    document.querySelectorAll('.line-button').forEach(button => {
        button.textContent = '+';
        button.classList.remove('active', 'minus');
    });
}

function updateButtonState(button, columnIndex, hasDot) {
    if (!button) return;
    if (hasDot) {
        button.textContent = '−';
        button.classList.add('active', 'minus');
    } else {
        button.textContent = '+';
        button.classList.remove('active', 'minus');
    }
}

window.loadLevelForEditing = loadLevelForEditing;
window.loadPatternIntoEditor = loadPatternIntoEditor;
window.originalLevelData = originalLevelData;
window.currentEditLevelId = currentEditLevelId;