import { API_URL } from './config.js';

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Actualiza el contador del carrito
export function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCountElement.textContent = totalItems;
    }
}

// Renderiza el carrito
export function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        cartTotalElement.textContent = 'Total: $0.00';
        return;
    }

    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0; // Validar precio como número
        const quantity = parseInt(item.quantity) || 1; // Validar cantidad como número entero
        const subtotal = price * quantity;
        const imageSrc = item.image || `${API_URL}/placeholder.jpg`; // Asegurar imagen válida

        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${imageSrc}" alt="${item.name || 'Producto'}" />
                <div>
                    <h3>${item.name || 'Producto sin nombre'}</h3>
                    <p>Precio: $${price.toFixed(2)}</p>
                    <p>
                        Cantidad: 
                        <input 
                            type="number" 
                            value="${quantity}" 
                            min="1" 
                            onchange="updateQuantity(${index}, this.value)"
                        />
                    </p>
                    <p>Subtotal: $${subtotal.toFixed(2)}</p>
                    <button onclick="removeFromCart(${index})" class="remove-btn">Eliminar</button>
                </div>
            </div>
        `;
    });

    const totalAmount = cart.reduce(
        (sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0)),
        0
    );
    cartTotalElement.textContent = `Total: $${totalAmount.toFixed(2)}`;
}

// Renderiza los productos seleccionados en el formulario de pedido
export function renderOrderSummary() {
    const cartSummaryContainer = document.getElementById('cart-summary');
    const totalPriceElement = document.getElementById('total-price');

    if (!cartSummaryContainer || !totalPriceElement) {
        console.error('No se encontraron los elementos para renderizar el resumen del carrito.');
        return;
    }

    cartSummaryContainer.innerHTML = '';

    if (cart.length === 0) {
        cartSummaryContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        totalPriceElement.textContent = 'Total: $0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const price = parseFloat(item.price) || 0; // Validar precio como número
        const quantity = parseInt(item.quantity) || 1; // Validar cantidad como número entero
        const subtotal = price * quantity;
        const imageSrc = item.image || `${API_URL}/placeholder.jpg`; // Asegurar imagen válida
        total += subtotal;

        cartSummaryContainer.innerHTML += `
            <div class="cart-item-summary">
                <img src="${imageSrc}" alt="${item.name}" />
                <div>
                    <h3>${item.name}</h3>
                    <p>Cantidad: ${quantity}</p>
                    <p>Subtotal: $${subtotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    });

    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Abre el modal del carrito
export function openCartModal() {
    renderCart();
    document.getElementById('cart-modal').classList.remove('hidden');
}

// Cierra el modal del carrito
export function closeCartModal() {
    document.getElementById('cart-modal').classList.add('hidden');
}

// Agrega un producto al carrito
export async function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    const token = localStorage.getItem('token');

    // Verificar si el usuario está autenticado
    if (!token) {
        // Si no está autenticado, abrir el modal de inicio de sesión o registro
        alert('Debes iniciar sesión para agregar productos al carrito.');
        openLoginModal();  // Esta función debería ser la encargada de abrir el modal de login
        return;
    }

    const existingItemIndex = cart.findIndex(item => item.id === productId);

    quantity = parseInt(quantity) || 1; // Asegurar que sea un número válido

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity; // Incrementar la cantidad existente
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity // Agregar con la cantidad seleccionada
        });
    }

    if (token) {
        try {
            const response = await fetch(`${API_URL}/carrito/agregar/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cantidad: quantity }),
            });
            if (!response.ok) throw new Error('Error al sincronizar con el backend');
        } catch (error) {
            console.error('Error al sincronizar el carrito:', error);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart(); // Renderizar inmediatamente después de agregar
}

// Actualiza la cantidad de un producto
export async function updateQuantity(index, quantity) {
    const token = localStorage.getItem('token');
    quantity = parseInt(quantity);

    if (quantity <= 0) {
        removeFromCart(index);
        return;
    }

    cart[index].quantity = quantity;

    if (token) {
        try {
            const response = await fetch(`${API_URL}/carrito/actualizar/${cart[index].id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cantidad: quantity }),
            });
            if (!response.ok) throw new Error('Error al sincronizar la cantidad');
        } catch (error) {
            console.error('Error al sincronizar la cantidad:', error);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Elimina un producto del carrito
export function removeFromCart(index) {
    const token = localStorage.getItem('token');

    if (token) {
        fetch(`${API_URL}/carrito/eliminar/${cart[index].id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).catch(error => console.error('Error al eliminar el producto del carrito en el backend:', error));
    }

    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

// Maneja la confirmación del pedido
export function confirmCart() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de confirmar.');
        return;
    }
    window.location.href = 'order.html';
}

// Registra el pedido
export async function registerOrder() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debe iniciar sesión para registrar un pedido.');
        return;
    }

    const orderDetails = {
        direccionEnvio: document.getElementById('address').value,
        ciudadEnvio: document.getElementById('city').value,
        paisEnvio: document.getElementById('country').value,
        codigoPostalEnvio: document.getElementById('nit').value || null,
        productos: cart,
    };

    try {
        const response = await fetch(`${API_URL}/pedido`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderDetails),
        });

        if (response.ok) {
            alert('Pedido registrado exitosamente.');
            localStorage.removeItem('cart');
            cart = [];
            renderCart();
            updateCartCount();
            window.location.href = 'thank-you.html';
        } else {
            alert('Error al registrar el pedido.');
        }
    } catch (error) {
        console.error('Error al registrar el pedido:', error);
    }
}

// Sincroniza el carrito al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const response = await fetch(`${API_URL}/carrito`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const cartData = await response.json();
                cart = cartData.items.map(item => ({
                    id: item.idProducto,
                    name: item.nombreProducto,
                    price: parseFloat(item.precio),
                    image: `${API_URL}${item.rutaImagen}`,
                    quantity: item.cantidad,
                }));
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
            } else {
                console.warn('No se pudo sincronizar el carrito desde el backend.');
            }
        } catch (error) {
            console.error('Error al sincronizar el carrito:', error);
        }
    }

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'order.html') {
        renderOrderSummary();
    }

    updateCartCount();
});

// Función para abrir el modal de login o redirigir a la página de login
function openLoginModal() {
    // Aquí debes implementar el código para mostrar el modal de login o redirigir a la página de login
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
    } else {
        // Si no tienes un modal, puedes redirigir a la página de login
        window.location.href = 'login.html';
    }
}

// Globaliza las funciones para el HTML
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.confirmCart = confirmCart;
window.registerOrder = registerOrder;
