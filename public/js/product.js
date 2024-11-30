import { API_URL } from './config.js';
import { addToCart as cartAddToCart } from './cart.js'; // Importa la función correctamente desde cart.js

// Función para cargar productos desde el backend
async function loadProducts(categoryId = null) {
    try {
        // Construir la URL con filtro de categoría si aplica
        const url = categoryId ? `${API_URL}/inventario/categoria/${categoryId}` : `${API_URL}/inventario`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar productos');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Función para mostrar los productos en la interfaz
function displayProducts(products) {
    const container = document.getElementById('products');
    container.innerHTML = '';
    products.forEach(product => {
        container.innerHTML += `
            <div class="product-card" onclick="showProductDetails(${product.idProducto})">
                <img src="${API_URL}${product.rutaImagen}" alt="${product.nombreProducto}">
                <h3>${product.nombreProducto}</h3>
                <p>$${product.precio}</p>
                <button onclick="event.stopPropagation(); handleAddToCart('${product.idProducto}', '${product.nombreProducto}', ${product.precio}, '${API_URL}${product.rutaImagen}')">Agregar al carrito</button>
            </div>
        `;
    });
}

// Función para manejar la lógica de "Agregar al carrito" en la vista inicial
function handleAddToCart(productId, productName, productPrice, productImage) {
    cartAddToCart(productId, productName, productPrice, productImage, 1); // Agrega siempre 1 desde la vista inicial
}

// Función para mostrar los detalles de un producto en un modal
async function showProductDetails(productId) {
    try {
        const response = await fetch(`${API_URL}/inventario/${productId}`);
        if (!response.ok) throw new Error('Error al cargar los detalles del producto');
        const product = await response.json();

        // Renderiza los detalles del producto en el modal
        document.getElementById('product-modal-image').src = `${API_URL}${product.rutaImagen}`;
        document.getElementById('product-modal-title').textContent = product.nombreProducto;
        document.getElementById('product-modal-description').textContent = product.descripcionProducto || 'Sin descripción';
        document.getElementById('product-modal-price').textContent = `Precio: $${product.precio}`;

        // Configurar el botón "Agregar al carrito" con la información del producto
        const addToCartButton = document.querySelector("#product-modal button");
        addToCartButton.onclick = () => {
            const quantity = parseInt(document.getElementById('product-quantity').value) || 1; // Capturar la cantidad seleccionada
            cartAddToCart(
                product.idProducto,
                product.nombreProducto,
                product.precio,
                `${API_URL}${product.rutaImagen}`,
                quantity // Pasar la cantidad seleccionada
            );
            closeProductModal(); // Cierra el modal después de agregar
        };

        document.getElementById('product-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
    }
}

// Cierra el modal de producto
function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}


// Inicializar la página cargando categorías y productos
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts(); // Mostrar todos los productos al inicio
});

// Exportar funciones globales para ser usadas desde el DOM
window.loadProducts = loadProducts;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.addToCart = cartAddToCart; // Ahora usa la función de cart.js
window.handleAddToCart = handleAddToCart; // Exportar para uso en el DOM
