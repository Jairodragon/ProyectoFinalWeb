import { API_URL } from './config.js';

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = '/index.html'; // Redirige al inicio si no hay sesión
        return null;
    }
    return token;
}

// Función genérica para manejar errores
function manejarError(error, mensaje) {
    console.error(`${mensaje}:`, error);
    alert(`${mensaje}. Intente nuevamente.`);
}

// Función para cargar pedidos del cliente autenticado
async function cargarMisPedidos() {
    const token = verificarAutenticacion();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/pedido/mios`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta de la API:', data); // Imprimir toda la respuesta

            // Acceso seguro a 'pedidos'
            const pedidos = data.pedidos || []; // Si no existe 'pedidos', usar un array vacío

            // Verificar si 'pedidos' es un array y renderizar
            if (Array.isArray(pedidos) && pedidos.length > 0) {
                renderizarPedidos(pedidos);
            } else {
                alert('No tienes pedidos realizados.');
            }
        } else {
            const errorText = await response.text();
            alert(`Error al cargar tus pedidos: ${errorText || response.statusText}`);
        }
    } catch (error) {
        manejarError(error, 'Error al cargar tus pedidos');
    }
}

// Función para renderizar los pedidos del cliente en la lista de pedidos
function renderizarPedidos(pedidos) {
    const pedidosContainer = document.getElementById('pedidos-list');
    pedidosContainer.innerHTML = ''; // Limpiar contenido previo

    if (pedidos.length === 0) {
        pedidosContainer.innerHTML = '<p>No tienes pedidos realizados.</p>';
        return;
    }

    pedidos.forEach((pedido, index) => {
        const estado = pedido.EstadoPedido ? pedido.EstadoPedido.nombreEstado : 'Desconocido';
        const estadoClass = estado.toLowerCase(); // Para asignar una clase al estado, ejemplo: pendiente, enviado, etc.

        // Formatear la lista de productos con cantidad incluida
        const productos = pedido.ProductoPedidos
            ? pedido.ProductoPedidos.map(
                  (producto) => `${producto.Inventario.nombreProducto} (Cantidad: ${producto.cantidadOrdenada})`
              ).join('<br>')
            : 'Sin productos';

        // Crear una estructura de pedido con las clases necesarias para el estilo
        const pedidoDiv = document.createElement('div');
        pedidoDiv.classList.add('pedido');

        pedidoDiv.innerHTML = `
            <div class="pedido-header">
                <span>Pedido #${index + 1}</span>
                <span>${pedido.fechaPedido}</span>
            </div>
            <div class="pedido-body">
                <p><strong>Productos:</strong><br>${productos}</p>
                <p><strong>Total:</strong> ${pedido.montoTotal}</p>
                <p><strong>Estado:</strong> <span class="pedido-status ${estadoClass}">${estado}</span></p>
            </div>
            
        `;

        // Agregar el pedido a la lista
        pedidosContainer.appendChild(pedidoDiv);
    });
}

// Función para mostrar el modal con los detalles del pedido
function verDetalles(idPedido) {
    const modal = document.getElementById('modal-detalles');
    const modalBody = modal.querySelector('.modal-body');

    // Aquí deberías hacer una solicitud para obtener los detalles del pedido (si no los tienes ya)
    // Simularemos que obtenemos los detalles para este ejemplo
    modalBody.innerHTML = `
        <div class="pedido-detalle">
            <label>Pedido ID:</label>
            <span>${idPedido}</span>
        </div>
        <div class="pedido-detalle">
            <label>Fecha:</label>
            <span>2024-11-29</span>
        </div>
        <div class="pedido-detalle">
            <label>Total:</label>
            <span>$100.00</span>
        </div>
        <div class="pedido-detalle">
            <label>Estado:</label>
            <span>Enviado</span>
        </div>
        <div class="pedido-detalle">
            <label>Productos:</label>
            <span>Producto 1 (Cantidad: 2)</span><br>
            <span>Producto 2 (Cantidad: 1)</span>
        </div>
    `;

    // Mostrar el modal
    modal.style.display = 'flex';
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById('modal-detalles');
    modal.style.display = 'none';
}

// Cargar pedidos cuando la página se carga
document.addEventListener('DOMContentLoaded', () => {
    cargarMisPedidos();
});
