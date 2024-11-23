export function endScreen(score, perfectNotes, greatNotes, missNotes, correctNotes, totalNotes, maxcombo, life) {
  const body = document.getElementsByTagName('body')[0];
  const mainGame = document.querySelector('.mainContainer');
  const smax = totalNotes * 300;
  const preresultado = (score / smax) * 1000000;
  const percentage = (score / smax) * 100;

  let numeroRedondeado = Math.round(preresultado);
  let resultado = numeroRedondeado.toString().padStart(6, '0');
  let imgscreen = '';

  resultado = resultado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  let comboResult = '';
  let allperfect = `
  <div class="aling">
    <p class="allperfect">ALL PERFECT!!</p>
    <p class="allperfect back">ALL PERFECT!!</p>
  </div>`;
  let fullcombo = `
  <div class="aling">
    <p class="fullcombo">FULL COMBO!!</p>
    <p class="fullcombo back">FULL COMBO!!</p>
  </div>`;
  let mamarracho = `
  <div class="aling">
    <p class="goodcombo">GOOD</p>
    <p class="goodcombo back">GOOD</p>
  </div>
  `;
  let lose = `
  <div class="aling">
    <p class="youlost">YOU LOSE!</p>
    <p class="youlost back">YOU LOSE!</p>
  </div>
  `;
  let secret = `
  <div class="aling">
    <p class="allperfect">GOD LIKE!!</p>
    <p class="allperfect back">GOD LIKE!!</p>
  </div>`;

  if (life > 0) {
    if (correctNotes == totalNotes) {
      comboResult = fullcombo;
      imgscreen = 'supremevictory';
    }
    if (perfectNotes == totalNotes) {
      comboResult = allperfect;
      imgscreen = 'supremevictory';
    }
    if (perfectNotes == 69 || greatNotes == 69) {
      comboResult = secret;
      imgscreen = 'supremesecret';
    }
    if (!(correctNotes == totalNotes) && !(perfectNotes == totalNotes)) {
      comboResult = mamarracho;
      imgscreen = 'supremevictory';
    }
  } else {
    comboResult = lose;
    imgscreen = 'supremelose';
  }

  let resultsHTML = `
    <img src="img/Frame_3.webp" class="bgImage" />
    <div class="siteContainer">
      <header class="header">
        <nav>
          <img onclick="window.location.href='index.html'" src="img/grisazul.webp" />
        </nav>
      </header>

      <main class="mainContainer">
        <div class="mainIzquierdo" style="height: 100%; width: 50%;">
          <div class="resultsMain">
            <div class="puntuacion">
            ${comboResult}
              <hr />
              <div style="display: flex;  flex-direction: column;  align-items: flex-start; margin-right: 30%; gap: 20px;">
              <p style="font-size: 40px; letter-spacing: 0.05em;">${resultado} <span>Puntos</span></p>
              <p style="font-size: 40px; letter-spacing: 0.05em;">${maxcombo} <span>Max-Combo</span></p>
              </div>
            </div>

            <div class="puntuacion2">
              <div class="notas">
                <h2>Notas</h2>
                <hr />
                <div style="display: flex;  flex-direction: row; align-items: center;">
                  <div class="hits" style="margin-right: 1.5rem;">
                    <img src="img/mania-hit300g.png" />
                    <img src="img/mania-hit200.png" />
                    <img src="img/mania-hit0.png" />
                  </div>
                  <div class="hitsCounts" style="margin-left: 1.5rem;">
                    <p>${perfectNotes}</p>
                    <p>${greatNotes}</p>
                    <p>${missNotes}</p>
                  </div>
                </div>
              </div>
              <div class="precision">
                <h2>Precision</h2>
                <hr />
                <p>${percentage.toFixed(2)} %</p>
              </div>
            </div>
          </div>

          <div id="refresh" class="bigBtn size4">Reintentar</div>
          <a href="music.html" style="text-decoration: none;"><div id="menu" class="bigBtn size4">Volver</div></a>
        </div>
        <div class="mainDerecho" style="display: flex;  flex-direction: row; height: 100%; width: 50%; margin-left: 2rem;">
          <hr />
          <div class="${imgscreen}"></div>
        </div>
      </main>

      <div class="iconos">
        <a href="#" class="icon" id="instagram"></a>
        <a href="#" class="icon" id="x"></a>
        <a href="#" class="icon" id="facebook"></a>
      </div>
    </div>
    `;

  body.removeChild(mainGame);
  body.innerHTML = resultsHTML;

  let refresh = document.getElementById('refresh');
  refresh.addEventListener('click', _ => {
    location.reload();
  })
}