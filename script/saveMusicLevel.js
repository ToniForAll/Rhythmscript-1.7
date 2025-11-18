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

function saveLevel() {
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
        id: Date.now(),
        name: levelName,
        creator: creatorName,
        difficulty: difficulty,
        stars: stars,
        songUrl: songUrl,
        pattern: patternData,
        createdAt: new Date().toISOString()
    };

    saveLevelToLocalStorage(levelData);
    
    alert(`Nivel "${levelName}" creado exitosamente por ${creatorName}!`);
    
    window.location.href = 'editorMapList.html';
}

function saveLevelToLocalStorage(levelData) {
    const existingLevels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    
    existingLevels.push(levelData);
    
    localStorage.setItem('rhythmLevels', JSON.stringify(existingLevels));
    
    console.log('Nivel guardado:', levelData);
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