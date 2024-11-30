import { API_URL } from './config.js';
import { addToCart as cartAddToCart } from './cart.js'; // Importa la función correctamente

// Función para cargar las categorías en el sidebar
async function loadCategories() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) {
        console.error("El elemento 'categories-list' no se encuentra en el DOM.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categoriaProducto`);
        if (!response.ok) throw new Error('Error al cargar categorías');
        const categories = await response.json();

        categoriesList.innerHTML = ''; // Limpiar categorías previas
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.nombreCategoria;
            button.dataset.categoryId = category.idCategoriaProducto;  // Usar data attributes para almacenar el ID
            button.addEventListener('click', () => loadProducts(category.idCategoriaProducto));
            categoriesList.appendChild(button);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Función para cargar los productos filtrados por categoría
async function loadProducts(categoryId = null) {
    const url = categoryId ? `${API_URL}/inventario/categoria/${categoryId}` : `${API_URL}/inventario`;
    
    try {
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
    container.innerHTML = ''; // Limpiar productos previos
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Asegurarse de que el clic en la tarjeta del producto abre los detalles
        productCard.addEventListener('click', (event) => {
            showProductDetails(product.idProducto); 
        });

        const img = document.createElement('img');
        img.src = `${API_URL}${product.rutaImagen}`;
        img.alt = product.nombreProducto;
        
        const title = document.createElement('h3');
        title.textContent = product.nombreProducto;

        const price = document.createElement('p');
        price.textContent = `$${product.precio}`;

        const addToCartButton = document.createElement('button');
        addToCartButton.textContent = 'Agregar al carrito';
        
        // Evitar que el clic en el botón "Agregar al carrito" también dispare el evento de mostrar el detalle
        addToCartButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Detener la propagación del clic para que no abra el modal
            handleAddToCart(product.idProducto, product.nombreProducto, product.precio, `${API_URL}${product.rutaImagen}`);
        });

        productCard.appendChild(img);
        productCard.appendChild(title);
        productCard.appendChild(price);
        productCard.appendChild(addToCartButton);
        container.appendChild(productCard);
    });
}

// Función para manejar el "Agregar al carrito"
function handleAddToCart(productId, productName, productPrice, productImage) {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        // Si no está autenticado, abrir el modal de login
        openLoginModal(); // Asegúrate de que esta función esté definida
        return;
    }
    
    // Agregar el producto al carrito si está autenticado
    cartAddToCart(productId, productName, productPrice, productImage, 1);
}

// Función para mostrar los detalles de un producto
async function showProductDetails(productId) {
    try {
        const response = await fetch(`${API_URL}/inventario/${productId}`);
        if (!response.ok) throw new Error('Error al cargar los detalles del producto');
        const product = await response.json();

        document.getElementById('product-modal-image').src = `${API_URL}${product.rutaImagen}`;
        document.getElementById('product-modal-title').textContent = product.nombreProducto;
        document.getElementById('product-modal-description').textContent = product.descripcionProducto || 'Sin descripción';
        document.getElementById('product-modal-price').textContent = `Precio: $${product.precio}`;

        const addToCartButton = document.querySelector("#product-modal button");
        addToCartButton.onclick = () => {
            const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
            cartAddToCart(product.idProducto, product.nombreProducto, product.precio, `${API_URL}${product.rutaImagen}`, quantity);
            closeProductModal();
        };

        document.getElementById('product-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
    }
}

// Cerrar el modal de producto
function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

// Cargar categorías y productos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();  // Cargar las categorías
    await loadProducts();    // Cargar todos los productos por defecto
});

// Globalizar las funciones para el HTML
window.loadProducts = loadProducts;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.addToCart = cartAddToCart; // Usar la función desde cart.js
window.handleAddToCart = handleAddToCart; // Exportar para uso en el DOM
