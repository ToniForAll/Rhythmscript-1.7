const SOCKET_URL = 'https://api-rhythmscript.onrender.com';
const notificationDot = document.getElementById('roomNotification');

function updateNotification(count) {
    if (!notificationDot) return;
    
    if (count > 0) {
        notificationDot.classList.add('active');
        
        // Mostrar el número si hay más de 1 sala
        if (count > 1) {
            notificationDot.textContent = count > 9 ? '9+' : count;
        } else {
            notificationDot.textContent = '';
        }
    } else {
        notificationDot.classList.remove('active');
        notificationDot.textContent = '';
    }
}

if (typeof io === 'undefined') {
    console.warn('Socket.IO no está cargado, usando polling HTTP');

    async function checkRoomsWithFetch() {
        try {
            const response = await fetch(`${SOCKET_URL}/api/rooms/active`);
            const data = await response.json();
            
            if (data.success) {
                updateNotification(data.count);
            }
        } catch (error) {
            console.error('Error verificando salas:', error);
        }
    }
    
    // Verificar cada 10 segundos
    checkRoomsWithFetch();
    setInterval(checkRoomsWithFetch, 10000);
    
} else {

    const notifSocket = io(SOCKET_URL, {
        transports: ['polling'],
        path: '/socket.io/',
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    notifSocket.on('connect', () => {
        notifSocket.emit('get-rooms', (rooms) => {
            const availableRooms = rooms.filter(r => r.players < 2);
            updateNotification(availableRooms.length);
        });
    });

    notifSocket.on('rooms-list', (rooms) => {
        const availableRooms = rooms.filter(r => r.players < 2);
        updateNotification(availableRooms.length);
    });

    notifSocket.on('connect_error', (err) => {
        console.error('Error en socket de notificaciones:', err);
    });

    setTimeout(() => {
        if (!notifSocket.connected) {
            console.log('⚠️ Socket timeout, usando polling');
            notifSocket.disconnect();
            
            // Cambiar a polling
            async function checkRoomsWithFetch() {
                try {
                    const response = await fetch(`${SOCKET_URL}/api/rooms/active`);
                    const data = await response.json();
                    
                    if (data.success) {
                        updateNotification(data.count);
                    }
                } catch (error) {
                    console.error('Error en polling:', error);
                }
            }
            
            checkRoomsWithFetch();
            setInterval(checkRoomsWithFetch, 5000);
        }
    }, 1000);
}