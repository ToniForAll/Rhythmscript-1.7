//// advertencia de cancer de codigo

//tienes razon, cancer visual detectado

//me acabo de dar cuenta que esta mierda es el login/signup. Pero si ya hay un js dedicado a eso?
//que co;oelamadre hace esto aqui tambien??

//solucionao (ignora lo de arriba)
let userData = localStorage.getItem('userData');

if (!userData) { window.location.href = 'index.html'; }

function addScore(top, otherScores, arr) {
    for (let i = 0; i < 10; i++) {
        if (!arr[i]) { continue; }

        const scoreDiv = document.createElement('div');

        switch (i) {
            case 0:
                scoreDiv.classList.add('firstOne');
                scoreDiv.style.marginTop = '20px';
                scoreDiv.innerHTML = `
                <img src="img/oro.png"/>
                <div class="userTop">
                    <p>${arr[i].userNickname}</p>
                    <p>${arr[i].score}</p>
                </div>
                `;
                top.appendChild(scoreDiv);
                break;
            case 1:
                scoreDiv.classList.add('firstOne');
                scoreDiv.innerHTML = `
                    <img src="img/plata.png" />
                    <div class="userTop">
                    <p>${arr[i].userNickname}</p>
                    <p>${arr[i].score}</p>
                    </div>
                    `;
                top.appendChild(scoreDiv);
                break;
            case 2:
                scoreDiv.classList.add('firstOne');
                scoreDiv.innerHTML = `
                <img src="img/bronce.png" />
                <div class="userTop">
                    <p>${arr[i].userNickname}</p>
                    <p>${arr[i].score}</p>
                </div>
                `;
                top.appendChild(scoreDiv);

                const otherScoresDiv = document.createElement('div');
                otherScoresDiv.classList.add('lastOne');
                otherScoresDiv.setAttribute('id', otherScores);
                top.appendChild(otherScoresDiv);
                break;
            default:
                const otherScoresContainer = document.getElementById(otherScores);
                scoreDiv.classList.add('lastOnePosition');
                scoreDiv.innerHTML = `
                <span>#${i + 1}</span>
                <p>${arr[i].userNickname}</p>
                <p>${arr[i].score}</p>
                `;
                otherScoresContainer.appendChild(scoreDiv);
                if (i !== 9) {
                    const lineElement = document.createElement('hr');
                    otherScoresContainer.appendChild(lineElement);
                }
                break;
        }
    }
}
function sortScoresDescending(scores) {
    return scores.sort((a, b) => b.score - a.score);
}

const logoutBtn = document.querySelector('.logout-btn');

const top1 = document.getElementById('top1');
const top2 = document.getElementById('top2');
const top3 = document.getElementById('top3');
const top4 = document.getElementById('top4');

const otherScores1 = document.getElementById('otherScores1');
const otherScores2 = document.getElementById('otherScores2');
const otherScores3 = document.getElementById('otherScores3');
const otherScores4 = document.getElementById('otherScores4');

let easyScores = [];
let mediumScores = [];
let hardScores = [];
let yoniScores = [];

fetch('/RhythmScript v1.7/script/back.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "requestNumber": "4" })
}).then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
        } else {
            data.scores.forEach(element => {
                switch (element.difficultyId) {
                    case 1:
                        easyScores.push(element);
                        break;
                    case 2:
                        mediumScores.push(element);
                        break;
                    case 3:
                        hardScores.push(element);
                        break;
                    case 4:
                        yoniScores.push(element);
                        break;
                }
            });

            easyScores = sortScoresDescending(easyScores);
            mediumScores = sortScoresDescending(mediumScores);
            hardScores = sortScoresDescending(hardScores);
            yoniScores = sortScoresDescending(yoniScores);

            addScore(top1, 'otherScores1', easyScores);
            addScore(top2, 'otherScores2', mediumScores);
            addScore(top3, 'otherScores3', hardScores);
            addScore(top4, 'otherScores4', yoniScores);
        }
    }).catch(error => {
        if (error.name === 'SyntaxError') {
            alert('Error en la respuesta del servidor: ' + error.message);
        } else {
            alert('Error en la solicitud: ' + error.message);
            console.log(error.message);
        }
    });

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
});