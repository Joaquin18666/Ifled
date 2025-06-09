// Variables globales
let listaPerfumes = [];
let carritoCompras = [];
let filtroSeleccionado = 'todos';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarPerfumes();
    inicializarEventos();
    actualizarContadorCarritoCompras();
});


async function cargarPerfumes() {
    try {
        const respuesta = await fetch('productos.json');
        listaPerfumes = await respuesta.json();
        mostrarPerfumes(listaPerfumes);
    } catch (error) {
        document.getElementById('productsGrid').innerHTML = 
            '<p class="text-center">Error al cargar los productos. Por favor, recarga la página.</p>';
    }
}

// Mostrar productos en el grid
function mostrarPerfumes(perfumesAMostrar) {
    const grid = document.getElementById('productsGrid');
    
    if (perfumesAMostrar.length === 0) {
        grid.innerHTML = '<p class="text-center">No se encontraron productos.</p>';
        return;
    }
    
    grid.innerHTML = perfumesAMostrar.map(perfume => {
        let porcentajeOferta = '';
        if (perfume.oferta) {
            const precioAnterior = perfume.precio * 1.2;
            const descuento = Math.round(100 - (perfume.precio / precioAnterior) * 100);
            porcentajeOferta = `<div class="offer-badge">¡${descuento}% OFF!</div>`;
        }
        return `
            <div class="product-card ${perfume.oferta ? 'offer' : ''}" onclick="abrirDetallePerfume(${perfume.id})">
                <img src="Imagenes/${perfume.imagen}" alt="${perfume.titulo}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${perfume.titulo}</h3>
                    <p class="product-description">${perfume.descripcion}</p>
                    <div class="product-price">
                        ${perfume.oferta 
                            ? `<span class="old-price">$${Math.round(perfume.precio * 1.2).toLocaleString()}</span> 
                               <span class="new-price">$${perfume.precio.toLocaleString()}</span>`
                            : `$${perfume.precio.toLocaleString()}`
                        }
                    </div>
                    <span class="product-gender">${perfume.genero}</span>
                    ${porcentajeOferta}
                </div>
            </div>
        `;
    }).join('');
}

// filtrar productos por género
function filtrarPerfumes(genero) {
    filtroSeleccionado = genero;
    
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${genero}"]`).classList.add('active');
    
    // Filtrar y mostrar
    const perfumesFiltrados = genero === 'todos' 
        ? listaPerfumes 
        : listaPerfumes.filter(p => p.genero === genero);
    
    mostrarPerfumes(perfumesFiltrados);
}

// Abrir modal de producto
function abrirDetallePerfume(id) {
    const perfume = listaPerfumes.find(p => p.id === id);
    if (!perfume) return;
    
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    
    let porcentajeOferta = '';
    if (perfume.oferta) {
        const precioAnterior = perfume.precio * 1.2;
        const descuento = Math.round(100 - (perfume.precio / precioAnterior) * 100);
        porcentajeOferta = `<div class="offer-badge">¡${descuento}% OFF!</div>`;
    }

    modalBody.innerHTML = `
        <div class="product-detail">
            <div class="product-images-grid">
                <div class="product-images-row">
                    <img src="Imagenes/${perfume.imagen.replace('.jpg', '-2.jpg')}" alt="${perfume.titulo}">
                    <img src="Imagenes/${perfume.imagen.replace('.jpg', '-3.jpg')}" alt="${perfume.titulo}">
                </div>
                <div class="product-images-row product-images-row-bottom">
                    <img src="Imagenes/${perfume.imagen}" alt="${perfume.titulo}">
                </div>
            </div>
            <div class="product-detail-info">
                <h2>${perfume.titulo}</h2>
                <p class="product-description">${perfume.descripcion}</p>
                <div class="product-price">
                    ${perfume.oferta 
                        ? `<span class="old-price">$${Math.round(perfume.precio * 1.2).toLocaleString()}</span> 
                           <span class="new-price">$${perfume.precio.toLocaleString()}</span>`
                        : `$${perfume.precio.toLocaleString()}`
                    }
                </div>
                <span class="product-gender">${perfume.genero}</span>
                ${porcentajeOferta}
                <button class="btn-primary add-to-cart-btn" onclick="agregarAlCarritoCompras(${perfume.id})">
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Cerrar modal de producto
function cerrarDetallePerfume() {
    document.getElementById('productModal').classList.remove('active');
}

// Función para agregar producto al carrito
function agregarAlCarritoCompras(id) {
    const perfume = listaPerfumes.find(p => p.id === id);
    if (!perfume) return;
    
    const itemExistente = carritoCompras.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carritoCompras.push({
            ...perfume,
            cantidad: 1
        });
    }
    
    actualizarCarritoCompras();
    cerrarDetallePerfume();
    
    // Mostrar feedback visual
    mostrarAviso('Producto agregado al carrito');
}

function actualizarCarritoCompras() {
    actualizarContadorCarritoCompras();
    mostrarItemsCarritoCompras();
    calcularTotalCarrito();
}

function actualizarContadorCarritoCompras() {
    const contador = document.getElementById('cartCount');
    const totalItems = carritoCompras.reduce((sum, item) => sum + item.cantidad, 0);
    contador.textContent = totalItems;
}

function mostrarItemsCarritoCompras() {
    const cartItems = document.getElementById('cartItems');
    
    if (carritoCompras.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        return;
    }
    
    cartItems.innerHTML = carritoCompras.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.titulo}</h4>
                <p>Cantidad: ${item.cantidad}</p>
            </div>
            <div>
                <p>$${(item.precio * item.cantidad).toLocaleString()}</p>
                <button onclick="eliminarDelCarritoCompras(${item.id})" style="background: none; border: none; color: red; cursor: pointer;">×</button>
            </div>
        </div>
    `).join('');
}

function calcularTotalCarrito() {
    const total = carritoCompras.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('cartTotal').textContent = `Total: $${total.toLocaleString()}`;
}

function eliminarDelCarritoCompras(id) {
    carritoCompras = carritoCompras.filter(item => item.id !== id);
    actualizarCarritoCompras();
}

function vaciarCarritoCompras() {
    carritoCompras = [];
    actualizarCarritoCompras();
    mostrarAviso('Carrito vaciado');
}

function alternarCarrito() {
    const dropdown = document.getElementById('cartDropdown');
    dropdown.classList.toggle('active');
}

// Checkout
function finalizarCompra() {
    // Oculta el carrito
    document.getElementById('cartDropdown').classList.remove('active');
    // Muestra mensaje de compra exitosa
    mostrarAviso('¡Gracias por tu compra! Se ha realizado de manera exitosa');
    // Vacía el carrito después de mostrar el mensaje
    carritoCompras = [];
    actualizarCarritoCompras();
}

// Eventos
function inicializarEventos() {
    // Filtros de productos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filtrarPerfumes(btn.dataset.filter);
        });
    });

    // Formulario de contacto
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('name').value;
        const correo = document.getElementById('email').value;
        const mensaje = document.getElementById('message').value;

        if (!nombre || !correo || !mensaje) {
            mostrarAviso('Por favor, completa todos los campos');
            return;
        }

        if (!validarEmail(correo)) {
            mostrarAviso('Por favor, ingresa un email válido');
            return;
        }

        // ENVÍO CON EMAILJS
        emailjs.send("service_tcx8fyl", "template_s1qx6pu", {
            name: nombre,
            title: "Contacto desde la web",
            email: correo
        })
        .then(function(response) {
            mostrarAviso('Mensaje enviado correctamente. Te contactaremos pronto.');
            document.getElementById('contactForm').reset();
        }, function(error) {
            mostrarAviso('Error al enviar el mensaje. Intenta más tarde.');
        });
    });

    // Cerrar modal al hacer clic fuera
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarDetallePerfume();
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

    navigator.geolocation.getCurrentPosition(function(posicion) {
        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;
        mostrarClimaYRecomendacion(lat, lon);
    }, function() {
        // Si el usuario no permite, usa una ciudad por defecto (Ciudad de Buenos Aires)
        mostrarClimaYRecomendacion(-34.61, -58.38);
    });
}

function mostrarClimaYRecomendacion(lat, lon) {
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
    // Vi una regex más compleja en internet pero preferí dejarlo simple
    return email.includes('@') && email.includes('.');
}

function mostrarAviso(mensaje) {
    // Crear notificación temporal
    const aviso = document.createElement('div');
    aviso.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-blue);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.35s ease-out;
    `;
    aviso.textContent = mensaje;
    
    document.body.appendChild(aviso);
    
    setTimeout(() => {
        aviso.remove();
    }, 3000);
}

function irAProductos() {
    // Scroll suave: me inspiré en parte en un tutorial de MDN para esto
    document.getElementById('productos').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Navegación para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(enlace => {
    enlace.addEventListener('click', function (e) {
        e.preventDefault();
        const destino = document.querySelector(this.getAttribute('href'));
        if (destino) {
            destino.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// Cerrar modal al presionar Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarDetallePerfume();
        const cartDropdown = document.getElementById('cartDropdown');
        if (cartDropdown.classList.contains('active')) {
            cartDropdown.classList.remove('active');
        }
    }
});
