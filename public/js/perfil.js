import { API_URL } from './config.js';

// Actualizar el header al cargar la página
window.onload = () => {
    updateHeader();
};

function updateHeader() {
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Mostrar u ocultar botones basados en la existencia del token
    loginBtn.classList.toggle('hidden', !!token);
    logoutBtn.classList.toggle('hidden', !token);
}

// Abrir y cerrar modales
function openLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function openRegisterModal() {
    closeLoginModal(); // Asegurarse de cerrar el modal de login antes de abrir el de registro
    document.getElementById('register-modal').classList.remove('hidden');
}

function closeRegisterModal() {
    document.getElementById('register-modal').classList.add('hidden');
}

// Función de login
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/miembro/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreUsuario: username, contrasena: password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Credenciales incorrectas');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token); // Guardar el token en localStorage
        closeLoginModal();
        updateHeader();

        // Redirigir según el tipo de cuenta
        if (data.miembro.idTipoCuenta === 1) {
            alert('Inicio de sesión exitoso como Administrador.');
            window.location.href = '/admin.html';
 // Asegúrate de que la URL sea la del servidor
        }
         else if (data.miembro.idTipoCuenta === 2) {
            alert('Inicio de sesión exitoso como Cliente.');
            window.location.href = '/'; // Redirigir a la tienda
        } else {
            alert('Tipo de cuenta desconocido.');
        }
    } catch (error) {
        alert(`Error al iniciar sesión: ${error.message}`);
        console.error('Error al iniciar sesión:', error);
    }
}

// Función de registro
async function register() {
    const fullname = document.getElementById('new-fullname').value.trim();
    const username = document.getElementById('new-username').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value.trim();

    if (!fullname || !username || !email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/miembro/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombreCompleto: fullname,
                nombreUsuario: username,
                correoElectronico: email,
                contrasena: password,
                idUbicacion: 1, // Ajusta según la lógica de tu API
                idTipoCuenta: 2, // Tipo de cuenta predeterminado
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrarse');
        }

        alert('Registro exitoso. Ahora inicia sesión.');
        closeRegisterModal();
        openLoginModal();
    } catch (error) {
        alert(`Error al registrarse: ${error.message}`);
        console.error('Error al registrarse:', error);
    }
}

// Función para confirmar el cierre de sesión
function confirmLogout() {
    const confirmationModal = document.createElement('div');
    confirmationModal.id = 'logout-confirm-modal';
    confirmationModal.classList.add('modal');
    confirmationModal.innerHTML = `
        <div class="modal-content">
            <h3>¿Estás seguro que deseas cerrar sesión?</h3>
            <button onclick="confirmLogoutAction(true)">Sí</button>
            <button onclick="confirmLogoutAction(false)">No</button>
        </div>
    `;
    document.body.appendChild(confirmationModal);
}

function confirmLogoutAction(confirm) {
    if (confirm) {
        logout();
    }
    closeLogoutModal();
}

function closeLogoutModal() {
    const modal = document.getElementById('logout-confirm-modal');
    if (modal) {
        modal.remove();
    }
}

// Función de cierre de sesión
function logout() {
    localStorage.removeItem('token'); // Eliminar el token
    updateHeader();
    closeLogoutModal(); // Asegurarse de que el modal se cierra
}

// Exportar funciones al objeto global para accesibilidad
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.login = login;
window.register = register;
window.confirmLogout = confirmLogout;
window.confirmLogoutAction = confirmLogoutAction;
window.closeLogoutModal = closeLogoutModal;
window.logout = logout;
