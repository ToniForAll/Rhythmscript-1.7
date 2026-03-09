let pendingDeleteId = null;
let pendingDeleteElement = null;
let pendingDeleteIsOnline = false;
const API_BASE_URL = 'https://api-rhythmscript.onrender.com/api';

// Obtener usuario actual
function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Cargar niveles (locales y online)
async function loadMusicLevels() {
    const musicasContainer = document.querySelector('.musicas');
    const user = getCurrentUser();
    
    const fixedButtons = [];
    const children = Array.from(musicasContainer.children);
    
    children.forEach(child => {
        if (child.classList.contains('music1') && child.hasAttribute('onclick')) {
            fixedButtons.push(child);
        }
    });

    musicasContainer.innerHTML = '';

    fixedButtons.forEach(btn => {
        musicasContainer.appendChild(btn);
    });

    if (user) {
        try {
            const response = await fetch(`${API_BASE_URL}/levels`);
            if (response.ok) {
                const onlineLevels = await response.json();
                
                // Filtrar niveles online del usuario actual
                const userOnlineLevels = onlineLevels.filter(level => level.creator === user.username);
                
                if (userOnlineLevels.length > 0) {
                    const onlineTitle = document.createElement('h3');
                    onlineTitle.textContent = 'Mis Niveles Online';
                    onlineTitle.style.marginTop = '2rem';
                    onlineTitle.style.color = '#5a00d8';
                    onlineTitle.style.marginBottom = '1rem';
                    onlineTitle.style.textShadow = '2px 2px 4px rgba(168, 17, 238, 0.75), 0 0 10px rgb(217, 1, 255)';
                    onlineTitle.style.webkitTextStroke = '0.3px white';
                    onlineTitle.style.textStroke = '0.3px white';
                    onlineTitle.style.fontWeight = 'bold';
                    onlineTitle.style.letterSpacing = '1px';
                    musicasContainer.appendChild(onlineTitle);
                    
                    // Crear elementos para cada nivel online
                    userOnlineLevels.forEach((level, index) => {
                        const musicElement = createMusicElement(level, index, true);
                        musicasContainer.appendChild(musicElement);
                    });
                }
            }
        } catch (error) {
            console.error('Error cargando niveles online:', error);
        }
    }
    
    // Cargar niveles locales
    const localLevels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
    
    if (localLevels.length > 0) {
        const localTitle = document.createElement('h3');
        localTitle.textContent = 'Mis Niveles Locales';
        localTitle.style.marginTop = '2rem';
        localTitle.style.color = '#4ecdc4';
        localTitle.style.marginBottom = '1rem';
        localTitle.style.textShadow = '2px 2px 4px rgb(13, 138, 255), 0 0 10px rgba(255, 255, 255, 0.3)';
        localTitle.style.webkitTextStroke = '0.3px white';
        localTitle.style.textStroke = '0.3px white';
        localTitle.style.fontWeight = 'bold';
        localTitle.style.letterSpacing = '1px';
        musicasContainer.appendChild(localTitle);
        
        // Crear elementos para cada nivel local
        localLevels.forEach((level, index) => {
            const musicElement = createMusicElement(level, index, false);
            musicasContainer.appendChild(musicElement);
        });
    } else {
        // Si no hay niveles locales, mostrar mensaje
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No tienes niveles creados. ¡Crea uno nuevo!';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#666';
        emptyMessage.style.padding = '2rem';
        emptyMessage.style.marginTop = '2rem';
        musicasContainer.appendChild(emptyMessage);
    }
}

function createMusicElement(level, index, isOnline) {
    const musicElement = document.createElement('div');
    musicElement.className = `music1`;
    musicElement.id = `music-${isOnline ? 'online' : 'local'}-${index}`;
    musicElement.style.marginTop = '2rem';
    musicElement.style.cursor = 'pointer';
    musicElement.style.position = 'relative';
    
    const totalNotes = calculateTotalNotes(level.pattern);
    const starsHTML = generateStarsHTML(level.stars);

    let difficultyImageUrl;
    switch(level.difficulty){
        case "Easy":
            difficultyImageUrl = "img/facil.webp";
            break;
        case "Normal":
            difficultyImageUrl = "img/medio.webp";
            break;
        case "Hard":
            difficultyImageUrl = "img/hard.webp";
            break;
        case "Master":
            difficultyImageUrl = "img/toni.webp";
            break;
        default:
            difficultyImageUrl = "img/imagen10.webp";
    }   
    
    musicElement.innerHTML = `
        <img src="${difficultyImageUrl}" class="frontImg">
        <img src="img/image6.webp" class="discoImg" id="disco-${isOnline ? 'online' : 'local'}-${index}">
        <div class="musicDescrip">
            <p>${level.name}<p style="color: #361A53; font-size: 1.25rem;">${level.difficulty} By: ${level.creator}</p></p>
            <div class="dificultad">
                <p>Difficulty: ${starsHTML}
                <p style="margin-left: 0.5rem;">Notes: ${totalNotes}</p>
                </p>
            </div>
        </div>
        <div class="level-actions">
            <button class="edit-level-btn" data-level-id="${level.id}" data-online="${isOnline}" title="Editar nivel">
                <i class="fa-solid fa-edit"></i>
            </button>
            <button class="delete-level-btn" data-level-id="${level.id}" data-online="${isOnline}" title="Eliminar nivel">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    musicElement.addEventListener('click', function(e) {
        if (!e.target.closest('.level-actions')) {
            navigateToGame(level.id);
        }
    });
    
    const editBtn = musicElement.querySelector('.edit-level-btn');
    editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        editLevel(level.id, isOnline);
    });
    
    const deleteBtn = musicElement.querySelector('.delete-level-btn');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showDeleteModal(level.id, level.name, musicElement, isOnline);
    });
    
    return musicElement;
}

// Mostrar modal de confirmación
function showDeleteModal(levelId, levelName, element, isOnline) {
    pendingDeleteId = levelId;
    pendingDeleteElement = element;
    pendingDeleteIsOnline = isOnline;
    
    const modal = document.getElementById('deleteConfirmModal');
    const levelNameSpan = document.getElementById('deleteLevelName');
    
    levelNameSpan.textContent = `"${levelName}"`;
    modal.style.display = 'flex';
}

// Cerrar modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
    pendingDeleteId = null;
    pendingDeleteElement = null;
    pendingDeleteIsOnline = false;
}

// Eliminar nivel (local u online)
async function confirmDelete() {
    if (!pendingDeleteId || !pendingDeleteElement) return;
    
    const levelId = pendingDeleteId;
    const element = pendingDeleteElement;
    const isOnline = pendingDeleteIsOnline;
    const user = getCurrentUser();
    
    closeDeleteModal();
    
    // Animación de eliminación
    element.style.opacity = '0';
    element.style.transform = 'translateX(-100px)';
    element.style.transition = 'all 0.3s ease';
    
    setTimeout(async () => {
        if (isOnline) {
            if (!user) {
                alert('Debes iniciar sesión para eliminar niveles online');
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/levels/${levelId}?username=${encodeURIComponent(user.username)}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    console.log(`✅ Nivel online ${levelId} eliminado:`, data.message);
                } else {
                    console.error('❌ Error al eliminar nivel online:', data.error);

                    if (response.status === 403) {
                        alert('No puedes eliminar un nivel que no fue creado por ti');
                    } else if (response.status === 404) {
                        alert('El nivel no existe o ya fue eliminado');
                    } else {
                        alert(`Error al eliminar: ${data.error || 'Error desconocido'}`);
                    }
                    
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                    return;
                }
            } catch (error) {
                console.error('❌ Error de conexión:', error);
                alert('Error de conexión al eliminar');
                
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
                return;
            }
        } else {
            const levels = JSON.parse(localStorage.getItem('rhythmLevels') || '[]');
            const updatedLevels = levels.filter(level => level.id !== levelId);
            localStorage.setItem('rhythmLevels', JSON.stringify(updatedLevels));
            console.log(`✅ Nivel local ${levelId} eliminado`);
        }
        
        element.remove();
    }, 300);
}

// Editar nivel
function editLevel(levelId, isOnline) {
    window.location.href = `editor.html?edit=${levelId}`;
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
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmDelete);
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDeleteModal();
    }
});