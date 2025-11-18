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
    musicElement.className = `music${index + 1}`;
    musicElement.id = `music${index + 1}`;
    musicElement.style.marginTop = '2rem';
    musicElement.style.cursor = 'pointer';
    
    const totalNotes = calculateTotalNotes(level.pattern);
    
    const starsHTML = generateStarsHTML(level.stars);
    
    musicElement.innerHTML = `
        <img src="img/imagen10.webp" class="frontImg">
        <img src="img/image6.webp" class="discoImg" id="disco${index + 1}">
        <div class="musicDescrip">
            <p>${level.name}<p style="color: #361A53; font-size: 1.25rem;">${level.difficulty} By: ${level.creator}</p></p>
            <div class="dificultad">
                <p>Difficulty: ${starsHTML}
                <p style="margin-left: 0.5rem;">Notes: ${totalNotes}</p>
                </p>
            </div>
        </div>
    `;

    musicElement.addEventListener('click', function() {
        navigateToGame(level.id);
    });
    
    return musicElement;
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
    window.location.href = 'game.html?level=' + levelId;
}

function getLevelById(levelId) {
    const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    return levels.find(level => level.id == levelId);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada, inicializando niveles...');
    loadMusicLevels();
});