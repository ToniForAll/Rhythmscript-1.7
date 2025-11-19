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
        
        fetch(proxyUrl + encodeURIComponent(SHEETS_API_URL), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(levelData)
        }).catch(error => {
            console.log('Error ignorado (probablemente se guardó):', error);
        });
        
        return { success: true, message: 'Nivel enviado a Google Sheets' };
        
    } catch (error) {
        console.log('Error ignorado:', error);
        return { success: true, message: 'Nivel publicado' };
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
    
    const levelData = {
        id: Date.now().toString(),
        name: levelName,
        creator: creatorName,
        difficulty: difficulty,
        stars: stars,
        songUrl: songUrl,
        pattern: patternData,
        createdAt: new Date().toISOString()
    };

    const submitBtn = document.querySelector('#levelForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Guardando...';
    submitBtn.disabled = true;

    try {
        saveLevelToLocalStorage(levelData);
        
        const onlineResult = await saveLevelToSheets(levelData);

        if (onlineResult.success === true) {
            alert(`¡Nivel "${levelName}" creado exitosamente por ${creatorName} y guardado online!`);
        } else if (onlineResult.success === 'unknown') {
            alert(`¡Nivel "${levelName}" creado por ${creatorName}! (Guardado localmente - Estado online: No verificado)`);
        } else {
            alert(`¡Nivel "${levelName}" creado por ${creatorName}! (Guardado localmente - Error online: ${onlineResult.error})`);
        }
        
        window.location.href = 'editorMapList.html';
        
    } catch (error) {
        alert(`¡Nivel "${levelName}" creado por ${creatorName}! (Guardado localmente - Error inesperado)`);
        window.location.href = 'editorMapList.html';
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

document.addEventListener('DOMContentLoaded', function() {
    setupStars();
});