import { API_URL } from './config.js';

let cart = JSON.parse(localStorage.getItem('cart')) || [];


function renderOrderSummary() {
    const cartItemsContainer = document.getElementById('cart-summary');
    const totalPriceElement = document.getElementById('total-price');

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        totalPriceElement.textContent = 'Total: $0.00';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const subtotal = price * quantity;
        total += subtotal;

        cartItemsContainer.innerHTML += `
            <div class="cart-item-summary">
                <img src="${item.image || 'placeholder.jpg'}" alt="${item.name || 'Producto'}">
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

    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
}

function updateQuantity(index, quantity) {
    quantity = parseInt(quantity);
    if (quantity <= 0) {
        removeFromCart(index);
        return;
    }

    cart[index].quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderOrderSummary();
}

async function removeFromCart(index) {
    const token = localStorage.getItem('token');
    const productId = cart[index]?.id;

    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderOrderSummary();

    if (token && productId) {
        try {
            const response = await fetch(`${API_URL}/carrito/eliminar/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Error al eliminar el producto del servidor.');
            }
        } catch (error) {
            console.error('Error al sincronizar la eliminación con el servidor:', error);
        }
    }
}

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('show');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('show');
}

async function registerOrder() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthModal(); 
        return;
    }

    const address = document.getElementById('address').value;
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const department = document.getElementById('department').value;
    const phone = document.getElementById('phone').value;
    const nit = document.getElementById('nit').value || null;

    if (!address || !country || !city || !department || !phone) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    const orderDetails = {
        direccionEnvio: address,
        ciudadEnvio: city,
        paisEnvio: country,
        departamento: department,
        telefono: phone,
        nit: nit,
        productos: cart.map(item => ({
            idProducto: item.id,
            cantidad: item.quantity,
        })),
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
            window.location.href = 'index.html'; 
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'No se pudo registrar el pedido.'}`);
        }
    } catch (error) {
        console.error('Error al registrar el pedido:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();

    const closeModalButton = document.getElementById('close-auth-modal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeAuthModal);
    }
});


window.renderOrderSummary = renderOrderSummary;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.registerOrder = registerOrder;
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
