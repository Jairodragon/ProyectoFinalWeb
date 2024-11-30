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

// Función para cargar el listado de productos
async function cargarProductos() {
    const token = verificarAutenticacion();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/inventario`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const productos = await response.json();
            renderizarProductos(productos);
        } else {
            const errorText = await response.text();
            alert(`Error al cargar los productos: ${errorText || response.statusText}`);
        }
    } catch (error) {
        manejarError(error, 'Error al cargar productos');
    }
}

// Función para renderizar productos en la tabla
function crearFilaProducto(producto) {
    const productoRow = document.createElement('tr');
    productoRow.innerHTML = `
        <td>${producto.idProducto}</td>
        <td>${producto.nombreProducto}</td>
        <td>${producto.precio}</td>
        <td>
            <button onclick="abrirModalEditarProducto(${producto.idProducto})">Editar</button>
            <button onclick="eliminarProducto(${producto.idProducto})">Eliminar</button>
        </td>
    `;
    return productoRow;
}

function renderizarProductos(productos) {
    const productosContainer = document.getElementById('productos-list');
    productosContainer.innerHTML = ''; // Limpiar contenido previo

    productos.forEach((producto) => {
        productosContainer.appendChild(crearFilaProducto(producto));
    });
}

// Función para cargar las categorías en el select
async function cargarCategorias() {
    const token = verificarAutenticacion();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/categoriaProducto`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const categorias = await response.json();
            const selectCategoria = document.getElementById('producto-categoria');
            selectCategoria.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>'; // Resetear el select

            categorias.forEach((categoria) => {
                const option = document.createElement('option');
                option.value = categoria.idCategoriaProducto;
                option.textContent = categoria.nombreCategoria;
                selectCategoria.appendChild(option);
            });
        } else {
            const errorText = await response.text();
            alert(`Error al cargar las categorías: ${errorText || response.statusText}`);
        }
    } catch (error) {
        manejarError(error, 'Error al cargar categorías');
    }
}

// Función para abrir el modal de creación de producto
function abrirModalCrearProducto() {
    document.getElementById('producto-modal-title').textContent = 'Crear Producto';
    document.getElementById('producto-form').reset(); // Resetea todos los campos del formulario
    document.getElementById('producto-id').value = '';
    cargarCategorias(); // Cargar las categorías dinámicamente
    document.getElementById('producto-modal').classList.remove('hidden');
}

// Función para abrir el modal de edición de producto
async function abrirModalEditarProducto(idProducto) {
    const token = verificarAutenticacion();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/inventario/${idProducto}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const producto = await response.json();
            document.getElementById('producto-modal-title').textContent = 'Editar Producto';
            document.getElementById('producto-id').value = producto.idProducto;
            document.getElementById('producto-nombre').value = producto.nombreProducto;
            document.getElementById('producto-precio').value = producto.precio;
            document.getElementById('producto-descripcion').value = producto.descripcionProducto;
            document.getElementById('producto-nivelstock').value = producto.nivelStock;
            await cargarCategorias(); // Cargar categorías antes de asignar el valor
            document.getElementById('producto-categoria').value = producto.idCategoriaProducto;
            document.getElementById('producto-modal').classList.remove('hidden');
        } else {
            const errorText = await response.text();
            alert(`Error al cargar los datos del producto: ${errorText || response.statusText}`);
        }
    } catch (error) {
        manejarError(error, 'Error al abrir el modal de edición');
    }
}

// Función para guardar un producto (crear o editar)
async function guardarProducto() {
    const idProducto = document.getElementById('producto-id').value;
    const nombreProducto = document.getElementById('producto-nombre').value;
    const precio = document.getElementById('producto-precio').value;
    const descripcionProducto = document.getElementById('producto-descripcion').value;
    const nivelStock = document.getElementById('producto-nivelstock').value;
    const categoriaProducto = document.getElementById('producto-categoria').value;
    const imagenInput = document.getElementById('producto-imagen');

    if (!nombreProducto || !precio || !descripcionProducto || !nivelStock || !categoriaProducto) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    const formData = new FormData();
    formData.append('nombreProducto', nombreProducto);
    formData.append('precio', precio);
    formData.append('descripcionProducto', descripcionProducto);
    formData.append('nivelStock', nivelStock);
    formData.append('idCategoriaProducto', categoriaProducto);

    if (imagenInput.files.length > 0) {
        formData.append('imagen', imagenInput.files[0]); // Verifica que el nombre coincida con el backend
    } else {
        console.warn("No se seleccionó una nueva imagen para el producto.");
    }
    

    const token = verificarAutenticacion();
    if (!token) return;

    const url = idProducto
        ? `${API_URL}/inventario/${idProducto}`
        : `${API_URL}/inventario`;
    const method = idProducto ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (response.ok) {
            alert(`Producto ${idProducto ? 'actualizado' : 'creado'} exitosamente.`);
            cerrarModalProducto();
            await cargarProductos();
        } else {
            const errorText = await response.text();
            alert(`Error al guardar el producto: ${errorText || response.statusText}`);
        }
    } catch (error) {
        manejarError(error, 'Error al guardar el producto');
    }
}

// Función para cerrar el modal de producto
function cerrarModalProducto() {
    document.getElementById('producto-modal').classList.add('hidden');
}

// Función para eliminar un producto
async function eliminarProducto(idProducto) {
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar el producto con ID ${idProducto}?`);
    if (!confirmacion) return;

    const token = verificarAutenticacion();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/inventario/${idProducto}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            alert('Producto eliminado exitosamente.');
            cargarProductos(); // Recargar la lista de productos
        } else {
            const errorText = await response.text();
            alert(`Error al eliminar el producto: ${errorText || response.statusText}`);
        }
    } catch (error) {
        manejarError(error, 'Error al eliminar el producto');
    }
}

// Función para cargar pedidos
async function cargarPedidos() {
    const token = verificarAutenticacion();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/pedido`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            const pedidos = data.pedidos; // Accede al arreglo de pedidos
            console.log('Pedidos cargados:', pedidos); // Para depuración
            renderizarPedidos(pedidos);
        } else {
            const errorText = await response.text();
            alert(`Error al cargar los pedidos: ${errorText || response.statusText}`);
        }
    } catch (error) {
        manejarError(error, 'Error al cargar pedidos');
    }
}

// Función para renderizar pedidos en la tabla
// Función para renderizar pedidos en la tabla
function renderizarPedidos(pedidos) {
    const pedidosContainer = document.getElementById('pedidos-list');
    pedidosContainer.innerHTML = ''; // Limpiar contenido previo

    pedidos.forEach((pedido) => {
        const cliente = pedido.Miembro
            ? `${pedido.Miembro.idMiembro} - ${pedido.Miembro.nombreUsuario}`
            : 'Desconocido';
        const estado = pedido.EstadoPedido ? pedido.EstadoPedido.nombreEstado : 'Desconocido';

        // Formatear la lista de productos con cantidad incluida
        const productos = pedido.ProductoPedidos
            ? pedido.ProductoPedidos.map(
                  (producto) =>
                      `${producto.idProducto} - ${producto.Inventario.nombreProducto} (Cantidad: ${producto.cantidadOrdenada})`
              ).join('<br>')
            : 'Sin productos';

        const pedidoRow = document.createElement('tr');
        pedidoRow.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${pedido.fechaPedido}</td>
            <td>${pedido.montoTotal}</td>
            <td>${cliente}</td>
            <td>${productos}</td>
            <td>${estado}</td>
        `;
        pedidosContainer.appendChild(pedidoRow);
    });
}


// Cargar productos y pedidos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarPedidos();
});

// Exportar funciones globales
window.abrirModalCrearProducto = abrirModalCrearProducto;
window.abrirModalEditarProducto = abrirModalEditarProducto;
window.guardarProducto = guardarProducto;
window.cerrarModalProducto = cerrarModalProducto;
window.eliminarProducto = eliminarProducto;
