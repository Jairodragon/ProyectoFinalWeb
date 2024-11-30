import { API_URL } from './config.js';

// Cargar administradores
export async function cargarAdministradores() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No estás autenticado.');
            return;
        }

        const response = await fetch(`${API_URL}/miembro/administradores`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const administradores = await response.json();
            renderizarAdministradores(administradores);
        } else {
            const errorText = await response.text();
            alert(`Error al cargar los administradores: ${errorText || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al cargar administradores:', error);
        alert('No se pudieron cargar los administradores. Intente más tarde.');
    }
}

// Renderizar administradores en la tabla
function renderizarAdministradores(administradores) {
    const administradoresContainer = document.getElementById('administradores-list');
    administradoresContainer.innerHTML = '';

    administradores.forEach((admin) => {
        const adminRow = document.createElement('tr');
        adminRow.innerHTML = `
            <td>${admin.idMiembro}</td>
            <td>${admin.nombreCompleto}</td>
            <td>${admin.nombreUsuario}</td>
            <td>${admin.correoElectronico}</td>
            <td>${admin.idUbicacion || 'N/A'}</td>
            <td>
                <button onclick="abrirModalEditarAdministrador(${admin.idMiembro}, '${admin.nombreCompleto}', '${admin.nombreUsuario}', '${admin.correoElectronico}', '${admin.idUbicacion}')">Editar</button>
                <button onclick="eliminarAdministrador(${admin.idMiembro})">Eliminar</button>
            </td>
        `;
        administradoresContainer.appendChild(adminRow);
    });
}

// Abrir el modal para crear un nuevo administrador
export function abrirModalCrearAdministrador() {
    document.getElementById('administrador-modal-title').textContent = 'Crear Administrador';
    document.getElementById('administrador-form').reset(); // Resetear el formulario
    document.getElementById('administrador-id').value = ''; // Limpiar el ID oculto
    document.getElementById('administrador-contrasena').required = true; // Hacer obligatorio el campo contraseña
    document.getElementById('administrador-contrasena').disabled = false; // Habilitar el campo contraseña
    document.getElementById('administrador-modal').classList.remove('hidden'); // Mostrar el modal
}

// Abrir el modal para editar un administrador existente
export function abrirModalEditarAdministrador(id, nombre, usuario, correo, ubicacion) {
    document.getElementById('administrador-modal-title').textContent = 'Editar Administrador';
    document.getElementById('administrador-id').value = id;
    document.getElementById('administrador-nombre').value = nombre;
    document.getElementById('administrador-usuario').value = usuario;
    document.getElementById('administrador-correo').value = correo;
    document.getElementById('administrador-ubicacion').value = ubicacion;

    // Deshabilitar el campo contraseña para la edición
    const contrasenaField = document.getElementById('administrador-contrasena');
    contrasenaField.value = ''; // Vaciar el campo
    contrasenaField.required = false; // Hacerlo no obligatorio
    contrasenaField.disabled = true; // Deshabilitar el campo

    document.getElementById('administrador-modal').classList.remove('hidden'); // Mostrar el modal
}

// Cerrar el modal de administrador
export function cerrarModalAdministrador() {
    document.getElementById('administrador-modal').classList.add('hidden'); // Ocultar el modal
}

// Guardar (crear o editar) un administrador
export async function guardarAdministrador() {
    const id = document.getElementById('administrador-id').value;
    const nombre = document.getElementById('administrador-nombre').value.trim();
    const usuario = document.getElementById('administrador-usuario').value.trim();
    const correo = document.getElementById('administrador-correo').value.trim();
    const ubicacion = document.getElementById('administrador-ubicacion').value.trim();
    const contrasena = document.getElementById('administrador-contrasena').value.trim();

    if (!nombre || !usuario || !correo) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    const data = {
        nombreCompleto: nombre,
        nombreUsuario: usuario,
        correoElectronico: correo,
        idUbicacion: ubicacion,
        idTipoCuenta: 1, // Siempre administrador
    };

    // Solo incluir la contraseña si es un nuevo administrador
    if (!id && contrasena) {
        data.contrasena = contrasena;
    }

    const url = id ? `${API_URL}/miembro/${id}` : `${API_URL}/miembro/registrar`;
    const method = id ? 'PUT' : 'POST';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert(`Administrador ${id ? 'actualizado' : 'creado'} exitosamente.`);
            cerrarModalAdministrador();
            cargarAdministradores();
        } else {
            const errorText = await response.text();
            alert(`Error al guardar administrador: ${errorText || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al guardar administrador:', error);
        alert('No se pudo guardar el administrador. Intente más tarde.');
    }
}

// Eliminar un administrador
export async function eliminarAdministrador(id) {
    const confirmacion = confirm(`¿Está seguro de que desea eliminar al administrador con ID ${id}?`);
    if (!confirmacion) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/miembro/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            alert('Administrador eliminado exitosamente.');
            cargarAdministradores();
        } else {
            const errorText = await response.text();
            alert(`Error al eliminar administrador: ${errorText || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al eliminar administrador:', error);
        alert('No se pudo eliminar el administrador. Intente más tarde.');
    }
}

// Asignar funciones al objeto global para que sean accesibles desde el HTML
window.abrirModalCrearAdministrador = abrirModalCrearAdministrador;
window.abrirModalEditarAdministrador = abrirModalEditarAdministrador;
window.cerrarModalAdministrador = cerrarModalAdministrador;
window.guardarAdministrador = guardarAdministrador;
window.eliminarAdministrador = eliminarAdministrador;

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', cargarAdministradores);
