function loadMusicLevels() {
    const musicasContainer = document.querySelector('.musicas');

    const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    
    levels.forEach((level, index) => {
        const musicElement = createMusicElement(level, index);
        musicasContainer.appendChild(musicElement);
    });
}

function createMusicElement(level, index) {
    const musicElement = document.createElement('div');
    musicElement.className = `music1`;
    musicElement.id = `music${index + 1}`;
    musicElement.style.marginTop = '2rem';
    musicElement.style.cursor = 'pointer';
    musicElement.style.position = 'relative'; // Para posicionar el botón de eliminar
    
    const totalNotes = calculateTotalNotes(level.pattern);
    
    const starsHTML = generateStarsHTML(level.stars);

    switch(level.difficulty){
        case "Easy":
            var difficultyImageUrl = "img/facil.webp";
            break;
        case "Normal":
            var difficultyImageUrl = "img/medio.webp";
            break;
        case "Hard":
            var difficultyImageUrl = "img/hard.webp";
            break;
        case "Master":
            var difficultyImageUrl = "img/toni.webp";
            break;
        default:
            var difficultyImageUrl = "img/imagen10.webp";
    }   
    
    console.log(level.difficulty);

    musicElement.innerHTML = `
        <img src="${difficultyImageUrl}" class="frontImg">
        <img src="img/image6.webp" class="discoImg" id="disco${index + 1}">
        <div class="musicDescrip">
            <p>${level.name}<p style="color: #361A53; font-size: 1.25rem;">${level.difficulty} By: ${level.creator}</p></p>
            <div class="dificultad">
                <p>Difficulty: ${starsHTML}
                <p style="margin-left: 0.5rem;">Notes: ${totalNotes}</p>
                </p>
            </div>
        </div>
        <button class="delete-level-btn" data-level-id="${level.id}">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    musicElement.addEventListener('click', function(e) {
        // evitar ir al nivel cuando lo elimina
        if (!e.target.closest('.delete-level-btn')) {
            navigateToGame(level.id);
        }
    });
    
    // eliminar nivel evento
    const deleteBtn = musicElement.querySelector('.delete-level-btn');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // evita que se active el contenedor
        deleteLevel(level.id, musicElement);
    });
    
    return musicElement;
}

function deleteLevel(levelId, element) {
    if (confirm('¿Estás seguro de que quieres eliminar este nivel?')) {
        const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
        const updatedLevels = levels.filter(level => level.id !== levelId);
        
        localStorage.setItem('rhythmLevels', JSON.stringify(updatedLevels));
        
        element.style.opacity = '0';
        element.style.transform = 'translateX(-100px)';
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.remove();
            loadMusicLevels();
        }, 300);
        
        console.log(`Nivel ${levelId} eliminado`);
    }
}

function calculateTotalNotes(pattern) {
    if (!pattern) return 0;
    
    let total = 0;
    if (pattern.column1) total += pattern.column1.filter(note => note === 1).length;
    if (pattern.column2) total += pattern.column2.filter(note => note === 1).length;
    if (pattern.column3) total += pattern.column3.filter(note => note === 1).length;
    if (pattern.column4) total += pattern.column4.filter(note => note === 1).length;
    
    return total;
}

function generateStarsHTML(starsCount) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= starsCount) {
            starsHTML += '<i class="fa-solid fa-star"></i>';
        } else {
            starsHTML += '<i class="fa-regular fa-star"></i>';
        }
    }
    return starsHTML;
}

function navigateToGame(levelId) {
    window.location.href = 'gameEditorMusic.html?level=' + levelId;
}

function getLevelById(levelId) {
    const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    return levels.find(level => level.id == levelId);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada, inicializando niveles...');
    loadMusicLevels();
});