const API_BASE_URL = 'https://api-rhythmscript.onrender.com/api';
let selectedStars = 0;

function setupStars() {
    const stars = document.querySelectorAll('.star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            selectedStars = value;
            document.getElementById('selectedStars').value = value;
            
            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
}

function resetStars() {
    selectedStars = 0;
    document.getElementById('selectedStars').value = 0;
    
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('active');
    });
}

function getCurrentVideoUrl() {
    if (typeof CURRENT_VIDEO_STORAGE !== 'undefined' && CURRENT_VIDEO_STORAGE.url) {
        return CURRENT_VIDEO_STORAGE.url;
    }
    
    if (typeof currentVideoData !== 'undefined' && currentVideoData && currentVideoData.url) {
        return currentVideoData.url;
    }
    
    return '';
}

function openCreateForm() {
    const modal = document.getElementById('createModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    const title = modal.querySelector('h3');
    const confirmBtn = modal.querySelector('.confirm-btn');
    
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.has('edit');
    
    if (isEditMode) {
        title.textContent = 'Editar Nivel';
        confirmBtn.textContent = 'Actualizar Nivel';
    } else {
        title.textContent = 'Crear Nuevo Nivel';
        confirmBtn.textContent = 'Crear Nivel';
        resetStars();
    }
    
    const currentUrl = getCurrentVideoUrl();
    const songUrlDisplay = document.getElementById('songUrlDisplay');
    if (songUrlDisplay) {
        songUrlDisplay.textContent = currentUrl || 'No hay canción cargada';
    }
}

function closeCreateForm() {
    const modal = document.getElementById('createModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveLevelToLocalStorage(levelData) {
    const existingLevels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    const filteredLevels = existingLevels.filter(level => level.id !== levelData.id);
    filteredLevels.push(levelData);
    localStorage.setItem('rhythmLevels', JSON.stringify(filteredLevels));
    console.log('Nivel guardado en localStorage:', levelData);
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

// guardar nivel en la nube
async function saveLevelToAPI(levelData) {
    try {
        console.log('Enviando nivel a la API:', levelData);
        
        const response = await fetch(`${API_BASE_URL}/levels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(levelData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Respuesta de la API:', result);
        return result;
        
    } catch (error) {
        console.error('Error al guardar en API:', error);
        return { 
            success: false, 
            error: error.message,
            fallback: true 
        };
    }
}

async function saveLevel() {
    const levelName = document.getElementById('levelName').value;
    const creatorName = document.getElementById('creatorName').value;
    const difficulty = document.getElementById('levelDifficulty').value;
    const stars = parseInt(document.getElementById('selectedStars').value);
    const songUrl = getCurrentVideoUrl();

    // Validaciones
    if (!levelName || !creatorName || !difficulty || stars === 0 || !songUrl) {
        alert('Por favor, completa todos los campos del formulario.');
        return;
    }

    if (creatorName.length > 10) {
        alert('El nombre del creador no puede tener más de 10 letras.');
        return;
    }
    
    // Obtener datos del patrón del editor
    if (typeof getAllColumnsData !== 'function') {
        alert('Error: No se puede obtener el patrón del nivel');
        return;
    }
    
    const patternData = getAllColumnsData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const editLevelId = urlParams.get('edit');
    const isEditMode = !!editLevelId;
    
    const levelId = isEditMode ? editLevelId : Date.now().toString();
    
    const levelData = {
        id: levelId,
        name: levelName,
        creator: creatorName,
        difficulty: difficulty,
        stars: stars,
        songUrl: songUrl,
        pattern: patternData,
        createdAt: isEditMode ? (window.originalLevelData?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    const submitBtn = document.querySelector('#levelForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isEditMode ? 'Actualizando...' : 'Guardando...';
    submitBtn.disabled = true;

    try {
        // 1. Guardar en localStorage como respaldo
        if (isEditMode) {
            updateLevelInStorage(levelData);
        } else {
            saveLevelToLocalStorage(levelData);
        }
        
        // 2. Intentar guardar en la API
        const apiResult = await saveLevelToAPI(levelData);
        
        if (apiResult.success) {
            alert(`¡Nivel "${levelName}" ${isEditMode ? 'actualizado' : 'publicado'} exitosamente!`);
        } else {
            alert(`¡Nivel "${levelName}" guardado localmente! (Error en nube: ${apiResult.error})`);
        }
        
        // Redirigir a la lista de niveles
        window.location.href = 'editorMapList.html';
        
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert(`Error: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function updateButtonText() {
    const createButton = document.querySelector('.login-btn.logout-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.has('edit');
    
    if (createButton) {
        createButton.textContent = isEditMode ? 'Edit' : 'Create';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Configurar el botón de crear/editar
    updateButtonText();
    
    // Configurar las estrellas
    setupStars();
    
    // Verificar si estamos en modo edición
    const urlParams = new URLSearchParams(window.location.search);
    const editLevelId = urlParams.get('edit');
    
    if (editLevelId) {
        console.log('🔧 Modo edición detectado, ID:', editLevelId);
        
        // Mostrar indicador de carga
        const submitBtn = document.querySelector('#levelForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Cargando...';
            submitBtn.disabled = true;
        }
        
        // Cargar el nivel para editar (función definida en editExitingLevel.js)
        if (typeof loadLevelForEditing === 'function') {
            loadLevelForEditing(editLevelId).then(success => {
                if (submitBtn) {
                    submitBtn.textContent = 'Actualizar Nivel';
                    submitBtn.disabled = false;
                }
                
                if (!success) {
                    alert('Error: No se pudo cargar el nivel para editar');
                    window.location.href = 'editorMapList.html';
                }
            });
        } else {
            console.error('Función loadLevelForEditing no encontrada');
        }
    }

    setTimeout(() => {
        if (typeof addTimelineMarkers === 'function') {
            addTimelineMarkers();
        }
        if (typeof observeContainerChanges === 'function') {
            observeContainerChanges();
        }
    }, 100);
});

// Evento del formulario
document.getElementById('levelForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveLevel();
});

// Cerrar modal al hacer clic fuera
document.getElementById('createModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCreateForm();
    }
});

// Exponer funciones necesarias globalmente
window.saveLevel = saveLevel;
window.openCreateForm = openCreateForm;
window.closeCreateForm = closeCreateForm;
window.resetStars = resetStars;
window.getCurrentVideoUrl = getCurrentVideoUrl;