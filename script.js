// Variables globales
let productos = [];
let carrito = [];
let filtroActual = 'todos';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    inicializarEventos();
    actualizarContadorCarrito();
});

// CARGAR PRODUCTOS DESDE JSON
/* 
INSTRUCCIONES PARA MODIFICAR PRODUCTOS:
1. Editar el archivo "productos.json" en la raíz del proyecto
2. Cada producto debe tener: id, titulo, descripcion, precio, genero, imagen, oferta
3. Las imágenes van en carpeta "images/products/"
4. Para agregar más productos, simplemente añadir objetos al array en productos.json
*/
async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<p class="text-center">Error al cargar los productos. Por favor, recarga la página.</p>';
    }
}

// Mostrar productos en el grid
function mostrarProductos(productosAMostrar) {
    const grid = document.getElementById('productsGrid');
    
    if (productosAMostrar.length === 0) {
        grid.innerHTML = '<p class="text-center">No se encontraron productos.</p>';
        return;
    }
    
    grid.innerHTML = productosAMostrar.map(producto => `
        <div class="product-card ${producto.oferta ? 'offer' : ''}" onclick="abrirProducto(${producto.id})">
            <img src="Imagenes/${producto.imagen}" alt="${producto.titulo}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${producto.titulo}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-price">$${producto.precio.toLocaleString()}</div>
                <span class="product-gender">${producto.genero}</span>
            </div>
        </div>
    `).join('');
}

// filtrar productos por género
function filtrarProductos(genero) {
    filtroActual = genero;
    
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${genero}"]`).classList.add('active');
    
    // Filtrar y mostrar
    const productosFiltrados = genero === 'todos' 
        ? productos 
        : productos.filter(p => p.genero === genero);
    
    mostrarProductos(productosFiltrados);
}

// Abrir modal de producto
function abrirProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="product-detail">
            <div class="product-images-grid">
                <div class="product-images-row">
                    <img src="Imagenes/${producto.imagen.replace('.jpg', '-2.jpg')}" alt="${producto.titulo}">
                    <img src="Imagenes/${producto.imagen.replace('.jpg', '-3.jpg')}" alt="${producto.titulo}">
                </div>
                <div class="product-images-row product-images-row-bottom">
                    <img src="Imagenes/${producto.imagen}" alt="${producto.titulo}">
                </div>
            </div>
            <div class="product-detail-info">
                <h2>${producto.titulo}</h2>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-price">$${producto.precio.toLocaleString()}</div>
                <span class="product-gender">${producto.genero}</span>
                ${producto.oferta ? '<div class="offer-badge">¡En Oferta!</div>' : ''}
                <button class="btn-primary add-to-cart-btn" onclick="agregarAlCarrito(${producto.id})">
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Cerrar modal de producto
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

// Función para agregar producto al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    const itemExistente = carrito.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }
    
    actualizarCarrito();
    closeProductModal();
    
    // Mostrar feedback visual
    mostrarNotificacion('Producto agregado al carrito');
}

function actualizarCarrito() {
    actualizarContadorCarrito();
    mostrarItemsCarrito();
    calcularTotal();
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cartCount');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    contador.textContent = totalItems;
}

function mostrarItemsCarrito() {
    const cartItems = document.getElementById('cartItems');
    
    if (carrito.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        return;
    }
    
    cartItems.innerHTML = carrito.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.titulo}</h4>
                <p>Cantidad: ${item.cantidad}</p>
            </div>
            <div>
                <p>$${(item.precio * item.cantidad).toLocaleString()}</p>
                <button onclick="eliminarDelCarrito(${item.id})" style="background: none; border: none; color: red; cursor: pointer;">×</button>
            </div>
        </div>
    `).join('');
}

function calcularTotal() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('cartTotal').textContent = `Total: $${total.toLocaleString()}`;
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

function clearCart() {
    carrito = [];
    actualizarCarrito();
    mostrarNotificacion('Carrito vaciado');
}

function toggleCart() {
    const dropdown = document.getElementById('cartDropdown');
    dropdown.classList.toggle('active');
}

// Checkout
function goToCheckout() {
    // Oculta el carrito
    document.getElementById('cartDropdown').style.display = 'none';
    // Muestra la página de pago
    document.getElementById('checkoutPage').style.display = 'block';
    // Opcional: puedes ocultar otras secciones si lo deseas
}

function mostrarResumenCheckout() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    checkoutItems.innerHTML = carrito.map(item => `
        <div class="checkout-item">
            <span>${item.titulo} x${item.cantidad}</span>
            <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
        </div>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    checkoutTotal.textContent = `Total: $${total.toLocaleString()}`;
}

function backToCart() {
    document.getElementById('checkoutPage').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Eventos
function inicializarEventos() {
    // Filtros de productos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filtrarProductos(btn.dataset.filter);
        });
    });
    
    // Formulario de contacto
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Validaciones básicas
        if (!name || !email || !message) {
            mostrarNotificacion('Por favor, completa todos los campos');
            return;
        }
        
        if (!validarEmail(email)) {
            mostrarNotificacion('Por favor, ingresa un email válido');
            return;
        }
        
        // Simular envío
        mostrarNotificacion('Mensaje enviado correctamente. Te contactaremos pronto.');
        this.reset();
    });
    
    // Formulario de pago
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('emailPay').value;
        const phone = document.getElementById('phone').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // Validaciones
        if (!fullName || !email || !phone) {
            mostrarNotificacion('Por favor, completa todos los campos obligatorios');
            return;
        }
        
        if (!validarEmail(email)) {
            mostrarNotificacion('Por favor, ingresa un email válido');
            return;
        }
        
        // Validar tarjeta si es necesario
        if (paymentMethod === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;
            
            if (!cardNumber || !expiry || !cvv) {
                mostrarNotificacion('Por favor, completa los datos de la tarjeta');
                return;
            }
        }
        
        // Simular procesamiento de pago
        mostrarNotificacion('¡Pedido confirmado! Te enviaremos los detalles por email.');
        
        // Limpiar carrito y volver al inicio
        setTimeout(() => {
            carrito = [];
            actualizarCarrito();
            backToCart();
            scrollToTop();
        }, 2000);
    });
    
    // Mostrar/ocultar campos de tarjeta
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const cardDetails = document.getElementById('cardDetails');
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeProductModal();
        }
    });
    
    // Cerrar carrito al hacer clic fuera
    document.addEventListener('click', function(e) {
        const cartDropdown = document.getElementById('cartDropdown');
        const cartBtn = document.querySelector('.cart-btn');
        
        if (!cartDropdown.contains(e.target) && !cartBtn.contains(e.target)) {
            cartDropdown.classList.remove('active');
        }
    });
    
    navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        obtenerClima(lat, lon);
    }, function() {
        // Si el usuario no permite, usa una ciudad por defecto (ej: Mendoza)
        obtenerClima(-32.89, -68.83);
    });
}

function obtenerClima(lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
            const temp = data.current_weather.temperature;
            let recomendacion = '';
            if (temp < 18) {
                recomendacion = 'Hace frío, te recomendamos perfumes dulces o amaderados.';
            } else {
                recomendacion = 'Hace calor, te recomendamos perfumes cítricos o frescos.';
            }
            document.getElementById('clima-recomendacion').innerHTML = `
                <p>Temperatura actual: <b>${temp}°C</b></p>
                <p>${recomendacion}</p>
            `;
        });
}

// Utilidades
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function mostrarNotificacion(mensaje) {
    // Crear notificación temporal
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-blue);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

function scrollToProducts() {
    document.getElementById('productos').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function scrollToTop() {
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
}

// Navegación para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// Cerrar modal al presionar Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});
// Cerrar carrito al presionar Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const cartDropdown = document.getElementById('cartDropdown');
        if (cartDropdown.classList.contains('active')) {
            cartDropdown.classList.remove('active');
        }
    }
});
