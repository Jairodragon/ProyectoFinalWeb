import { API_URL } from './config.js';

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para acceder a esta función.');
        window.location.href = '/index.html'; // Redirige al inicio si no hay sesión
        return null;
    }
    return token;
}

// Función para cargar las categorías
export async function cargarCategoriasAdmin() {
    const token = verificarAutenticacion();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/categoriaProducto`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const categorias = await response.json();
            renderizarCategorias(categorias);
        } else {
            const errorText = await response.text();
            alert(`Error al cargar las categorías: ${errorText || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al cargar las categorías:', error);
        alert('No se pudieron cargar las categorías. Intente más tarde.');
    }
}

// Función para renderizar categorías en la tabla
function renderizarCategorias(categorias) {
    const categoriasContainer = document.getElementById('categorias-list');
    categoriasContainer.innerHTML = '';

    categorias.forEach((categoria) => {
        const categoriaRow = document.createElement('tr');
        categoriaRow.innerHTML = `
            <td>${categoria.idCategoriaProducto}</td>
            <td>${categoria.nombreCategoria}</td>
            <td>
                <button onclick="abrirModalEditarCategoria(${categoria.idCategoriaProducto}, '${categoria.nombreCategoria}')">Editar</button>
                <button onclick="eliminarCategoria(${categoria.idCategoriaProducto})">Eliminar</button>
            </td>
        `;
        categoriasContainer.appendChild(categoriaRow);
    });
}

// Función para abrir el modal de crear categoría
export function abrirModalCrearCategoria() {
    document.getElementById('categoria-modal-title').textContent = 'Crear Categoría';
    document.getElementById('categoria-id').value = '';
    document.getElementById('categoria-nombre').value = '';
    document.getElementById('categoria-modal').classList.remove('hidden');
}

// Función para abrir el modal de editar categoría
export function abrirModalEditarCategoria(idCategoria, nombreCategoria) {
    document.getElementById('categoria-modal-title').textContent = 'Editar Categoría';
    document.getElementById('categoria-id').value = idCategoria;
    document.getElementById('categoria-nombre').value = nombreCategoria;
    document.getElementById('categoria-modal').classList.remove('hidden');
}

// Función para cerrar el modal de categoría
export function cerrarModalCategoria() {
    document.getElementById('categoria-modal').classList.add('hidden');
}

// Función para guardar una categoría (crear o editar)
export async function guardarCategoria() {
    const token = verificarAutenticacion();
    if (!token) return;

    const idCategoria = document.getElementById('categoria-id').value;
    const nombreCategoria = document.getElementById('categoria-nombre').value;

    if (!nombreCategoria) {
        alert('El nombre de la categoría es obligatorio.');
        return;
    }

    const url = idCategoria
        ? `${API_URL}/categoriaProducto/${idCategoria}`
        : `${API_URL}/categoriaProducto`;
    const method = idCategoria ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nombreCategoria }),
        });

        if (response.ok) {
            alert(`Categoría ${idCategoria ? 'actualizada' : 'creada'} exitosamente.`);
            cerrarModalCategoria();
            cargarCategoriasAdmin();
        } else {
            const errorText = await response.text();
            alert(`Error al guardar la categoría: ${errorText || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al guardar la categoría:', error);
        alert('No se pudo guardar la categoría. Intente más tarde.');
    }
}

// Función para eliminar una categoría
export async function eliminarCategoria(idCategoria) {
    const token = verificarAutenticacion();
    if (!token) return;

    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar la categoría con ID ${idCategoria}?`);
    if (!confirmacion) return;

    try {
        const response = await fetch(`${API_URL}/categoriaProducto/${idCategoria}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            alert('Categoría eliminada exitosamente.');
            cargarCategoriasAdmin();
        } else {
            const errorText = await response.text();
            alert(`Error al eliminar la categoría: ${errorText || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        alert('No se pudo eliminar la categoría. Intente más tarde.');
    }
}

// Asignar funciones al objeto global para que sean accesibles desde el HTML
window.abrirModalCrearCategoria = abrirModalCrearCategoria;
window.abrirModalEditarCategoria = abrirModalEditarCategoria;
window.cerrarModalCategoria = cerrarModalCategoria;
window.guardarCategoria = guardarCategoria;
window.eliminarCategoria = eliminarCategoria;

// Inicializar el módulo al cargar
document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasAdmin();
});
