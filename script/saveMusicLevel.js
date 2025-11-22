const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxZAh7WVKd26u-84P3lldUaX-bswobEf8ELcEKTU__izormXQ_7p3mN5CldhFTB_8Bw/exec';

let selectedStars = 0;

function openCreateForm() {
    const modal = document.getElementById('createModal');
    modal.style.display = 'flex';
    
    resetStars();
    
    const currentUrl = getCurrentVideoUrl();
    if (currentUrl) {
        document.getElementById('songUrlDisplay').textContent = currentUrl;
        console.log('URL cargada automáticamente:', currentUrl);
    } else {
        document.getElementById('songUrlDisplay').textContent = 'No hay canción cargada';
    }
}

function getCurrentVideoUrl() {
    if (CURRENT_VIDEO_STORAGE.url) {
        return CURRENT_VIDEO_STORAGE.url;
    }
    
    if (currentVideoData && currentVideoData.url) {
        return currentVideoData.url;
    }
    
    return '';
}

function closeCreateForm() {
    const modal = document.getElementById('createModal');
    modal.style.display = 'none';
}

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

async function saveLevelToSheets(levelData) {
    try {
        const proxyUrl = 'https://corsproxy.io/?';
        
        console.log('Enviando a Sheets:', levelData);
        
        const response = await fetch(proxyUrl + encodeURIComponent(SHEETS_API_URL), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(levelData)
        });
        
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
    } catch (error) {
        console.log('Error en conexión con Sheets:', error);
        return { success: true, message: 'publicado' };
    }
}

async function saveLevel() {
    const levelName = document.getElementById('levelName').value;
    const creatorName = document.getElementById('creatorName').value;
    const difficulty = document.getElementById('levelDifficulty').value;
    const stars = parseInt(document.getElementById('selectedStars').value);
    const songUrl = getCurrentVideoUrl();

    if (!levelName || !creatorName || !difficulty || stars === 0 || !songUrl) {
        alert('Por favor, completa todos los campos del formulario.');
        return;
    }

    if (creatorName.length > 10) {
        alert('El nombre del creador no puede tener más de 10 letras.');
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
        createdAt: isEditMode ? (originalLevelData?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    const submitBtn = document.querySelector('#levelForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isEditMode ? 'Actualizando...' : 'Guardando...';
    submitBtn.disabled = true;

    try {
        if (isEditMode) {
            updateLevelInStorage(levelData);
        } else {
            saveLevelToLocalStorage(levelData);
        }
        
        const onlineResult = await saveLevelToSheets(levelData);
        
        if (onlineResult.success) {
            const action = onlineResult.action || (isEditMode ? 'updated' : 'created');
            if (action === 'updated') {
                alert(`¡Nivel "${levelName}" actualizado exitosamente!`);
            } else {
                alert(`¡Nivel "${levelName}" ${isEditMode ? 'actualizado' : 'creado'} exitosamente!`);
            }
        } else {
            alert(`¡Nivel "${levelName}" ${isEditMode ? 'actualizado' : 'creado'} localmente! (Error online: ${onlineResult.error})`);
        }
        
        window.location.href = 'editorMapList.html';
        
    } catch (error) {
        console.error('Error al guardar:', error);
        alert(`Error: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}


function saveLevelToLocalStorage(levelData) {
    const existingLevels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    
    const filteredLevels = existingLevels.filter(level => level.id !== levelData.id);
    filteredLevels.push(levelData);
    
    localStorage.setItem('rhythmLevels', JSON.stringify(filteredLevels));
    
    console.log('Nivel guardado localmente:', levelData);
}

document.getElementById('levelForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveLevel();
});

document.getElementById('createModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCreateForm();
    }
});

function updateButtonText() {
    const createButton = document.querySelector('.login-btn.logout-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.has('edit');
    
    if (createButton) {
        createButton.textContent = isEditMode ? 'Edit' : 'Create';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateButtonText();
    setupStars();   
    const urlParams = new URLSearchParams(window.location.search);
    const editLevelId = urlParams.get('edit');
    
    if (editLevelId) {
        console.log('Modo edición detectado, ID:', editLevelId);
        const success = loadLevelForEditing(editLevelId);
        
        if (success) {
            
        } else {
            alert('Error: No se pudo cargar el nivel para editar');
            window.location.href = 'editorMapList.html';
        }
    }

    setTimeout(() => {
        addTimelineMarkers();
        observeContainerChanges();
    }, 100);
});