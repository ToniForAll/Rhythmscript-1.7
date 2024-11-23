export function createForm() {
  const formBg = document.createElement('div');
  const signupForm = document.createElement('form');
  const loginForm = document.createElement('form');
  formBg.classList.add('form-bg');
  signupForm.setAttribute('id', 'registro');
  signupForm.classList.add('form');
  loginForm.setAttribute('id', 'inicio-sesion');
  loginForm.classList.add('form', 'oculto');


  loginForm.innerHTML = `
  <div class="flex-column">
              <label>Usuario</label></div>
              <div class="inputForm">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="20" height="20"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#ffffff"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#ffffff"></path> </g></svg>
                <input placeholder="Introduzca su Usuario" class="input" type="text" name="userNickname">
              </div>
            
            <div class="flex-column">
              <label>Contraseña</label></div>
              <div class="inputForm">
                <svg fill="#ffffff" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="20" height="20"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M21,2a8.9977,8.9977,0,0,0-8.6119,11.6118L2,24v6H8L18.3881,19.6118A9,9,0,1,0,21,2Zm0,16a7.0125,7.0125,0,0,1-2.0322-.3022L17.821,17.35l-.8472.8472-3.1811,3.1812L12.4141,20,11,21.4141l1.3787,1.3786-1.5859,1.586L9.4141,23,8,24.4141l1.3787,1.3786L7.1716,28H4V24.8284l9.8023-9.8023.8472-.8474-.3473-1.1467A7,7,0,1,1,21,18Z"></path> <circle cx="22" cy="10" r="2"></circle> <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" class="cls-1" width="0" height="0"></rect> </g></svg>      
                <input placeholder="Introduzca su Contraseña" class="input" type="password" name="userPass">
              </div>
            
            <div class="flex-row">
              <span class="span">¿Olvidaste la contraseña?</span>
            </div>
                <button class="button-submit" type="submit">Iniciar Sesión</button>
                <p class="p">No tienes una cuenta?  <span id="cambiar-a-registro" class="span">Crear Cuenta</span>     
                </button>
            </div>
  `

  signupForm.innerHTML = `
    <h3>Bienvenido, <span>Forma parte de la comunidad Rhythmcriptera chat</span></h3>
    
              <div class="nameDiv">
                <div class="inputForm">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="20" height="20"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#ffffff"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#ffffff"></path> </g></svg>
                  <input placeholder="Introduzca su Nombre" class="input" type="text" name="userFirstName">
                </div>
                <div class="inputForm">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="20" height="20"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#ffffff"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#ffffff"></path> </g></svg>
                  <input placeholder="Introduzca su Apellido" class="input" type="text" name="userLastName">
                </div>
              </div>
    
              <div class="inputForm">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="20" height="20"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#ffffff"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#ffffff"></path> </g></svg>
                <input placeholder="Introduzca su Usuario" class="input" type="text" name="userNickname" maxlength="20">
              </div>
            
              <div class="inputForm">
                <svg fill="#ffffff" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="20" height="20"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M21,2a8.9977,8.9977,0,0,0-8.6119,11.6118L2,24v6H8L18.3881,19.6118A9,9,0,1,0,21,2Zm0,16a7.0125,7.0125,0,0,1-2.0322-.3022L17.821,17.35l-.8472.8472-3.1811,3.1812L12.4141,20,11,21.4141l1.3787,1.3786-1.5859,1.586L9.4141,23,8,24.4141l1.3787,1.3786L7.1716,28H4V24.8284l9.8023-9.8023.8472-.8474-.3473-1.1467A7,7,0,1,1,21,18Z"></path> <circle cx="22" cy="10" r="2"></circle> <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" class="cls-1" width="0" height="0"></rect> </g></svg>
                <input placeholder="Introduzca su Contraseña" class="input" type="password" name="userPass">
              </div>
    
              <div class="inputForm">
                <svg fill="#ffffff" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="20" height="20"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M21,2a8.9977,8.9977,0,0,0-8.6119,11.6118L2,24v6H8L18.3881,19.6118A9,9,0,1,0,21,2Zm0,16a7.0125,7.0125,0,0,1-2.0322-.3022L17.821,17.35l-.8472.8472-3.1811,3.1812L12.4141,20,11,21.4141l1.3787,1.3786-1.5859,1.586L9.4141,23,8,24.4141l1.3787,1.3786L7.1716,28H4V24.8284l9.8023-9.8023.8472-.8474-.3473-1.1467A7,7,0,1,1,21,18Z"></path> <circle cx="22" cy="10" r="2"></circle> <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" class="cls-1" width="0" height="0"></rect> </g></svg>
                <input placeholder="Confirmar Contraseña" class="input" type="password" name="userPassConfirm">
              </div>
            
    
              <button class="button-submit" type="submit">Registrarse</button>
              <p class="p">Ya tienes una cuenta?  <span id="cambiar-a-login" class="span">Inicia Sesión</span>     
              </button>
    `;


  formBg.append(signupForm);
  formBg.append(loginForm);
  document.body.append(formBg)

  formBg.style.display = 'flex';
  formBg.addEventListener('click', (e) => {
    if (e.target === formBg) {
      formBg.style.display = 'none';
      formBg.remove();
    }
  });
  document.getElementById('cambiar-a-login').addEventListener('click', function () {
    const registro = document.getElementById('registro');
    const inicioSesion = document.getElementById('inicio-sesion');

    registro.classList.remove('slide-in-right');
    registro.style.transform = 'translateX(100%)';
    registro.style.opacity = '0';


    setTimeout(() => {
      registro.classList.add('oculto');
      inicioSesion.classList.remove('oculto');
      inicioSesion.style.opacity = '1';
      inicioSesion.classList.add('slide-in-left');
      setTimeout(() => {
        inicioSesion.classList.remove('slide-in-left');
        registro.style.transform = 'translateX(0)';
      }, 500);
    }, 250);
  });

  document.getElementById('cambiar-a-registro').addEventListener('click', function () {
    const registro = document.getElementById('registro');
    const inicioSesion = document.getElementById('inicio-sesion');

    inicioSesion.classList.remove('slide-in-left');
    inicioSesion.style.transform = 'translateX(-100%)';
    inicioSesion.style.opacity = '0';

    setTimeout(() => {
      inicioSesion.classList.add('oculto');
      registro.classList.remove('oculto');
      registro.classList.add('slide-in-right');
      registro.style.opacity = '1';
      setTimeout(() => {
        registro.classList.remove('slide-in-right');
        inicioSesion.style.transform = 'translateX(0)';
      }, 500);
    }, 250);
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(signupForm);
    const userFirstName = formData.get('userFirstName');
    const userLastName = formData.get('userLastName');
    const userNickname = formData.get('userNickname');
    const userPass = formData.get('userPass');
    const userPassConfirm = formData.get('userPassConfirm');
    const userName = userFirstName + ' ' + userLastName;

    let userData = {};

    console.log(
      userFirstName,
      userLastName,
      userNickname,
      userPass,
      userPassConfirm
    );

    if (!userFirstName || !userLastName || !userNickname || !userPass || !userPassConfirm) { alert('rellene todos los campos'); return; }
    if (userPass !== userPassConfirm) { alert('las claves deben ser iguales'); return; }

    //piola (manda los datos)
    userData = {
      userName: userName,
      userNickname: userNickname,
      userPass: userPass
    }

    fetch('/RhythmScript v1.7/script/back.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "requestNumber": "1", userName, userNickname, userPass })
    }).then(response => response.json())
      .then(data => {
        if (!data.success) {
          alert(data.message);
        } else {
          localStorage.setItem('userData', JSON.stringify(data.userData));
          window.location.href = data.url;
        }
      }).catch(error => {
        if (error.name === 'SyntaxError') {
          alert('Error en la respuesta del servidor: ' + error.message);
        } else {
          alert('Error en la solicitud: ' + error.message);
          console.log(error.message);
        }
      });

  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const userNickname = formData.get('userNickname');
    const userPass = formData.get('userPass');

    console.log(
      userNickname,
      userPass
    );

    if (!userNickname || !userPass) { alert('rellene todos los campos'); return; }

    fetch('/RhythmScript v1.7/script/back.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "requestNumber": "2", userNickname, userPass })
    }).then(response => response.json())
      .then(data => {
        if (!data.success) {
          alert(data.message);
        } else {
          localStorage.setItem('userData', JSON.stringify(data.userData));
          window.location.href = data.url;
        }
      }).catch(error => {
        if (error.name === 'SyntaxError') {
          alert('Error en la respuesta del servidor: ' + error.message);
        } else {
          alert('Error en la solicitud: ' + error.message);
          console.log(error.message);
        }
      });
  });
}