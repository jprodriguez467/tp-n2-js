class Producto {
    constructor(id, nombre, precio, categoria, stock, imagen) {  // ← CAMBIO 1: emoji → imagen
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.stock = stock;
        this.imagen = imagen;  // ← CAMBIO 2: Ahora guarda la ruta de la imagen
    }

 
    reducirStock(cantidad) {
        if (this.stock >= cantidad) {
            this.stock -= cantidad;
            return true;
        }
        return false;
    }

   
    aumentarStock(cantidad) {
        this.stock += cantidad;
    }
}


class Carrito {
    constructor() {
        this.items = [];
        this.cargarDesdeStorage();
    }

 
    agregarProducto(producto, cantidad = 1) {
        const itemExistente = this.items.find(item => item.producto.id === producto.id);
        
        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            this.items.push({ producto, cantidad });
        }
        
        this.guardarEnStorage();
        return true;
    }

   
    eliminarProducto(productoId) {
        const index = this.items.findIndex(item => item.producto.id === productoId);
        if (index !== -1) {
            const item = this.items[index];
            
            const producto = productos.find(p => p.id === productoId);
            if (producto) {
                producto.aumentarStock(item.cantidad);
            }
            this.items.splice(index, 1);
            this.guardarEnStorage();
            return true;
        }
        return false;
    }

    modificarCantidad(productoId, nuevaCantidad) {
        const item = this.items.find(item => item.producto.id === productoId);
        if (item) {
            const diferencia = nuevaCantidad - item.cantidad;
            const producto = productos.find(p => p.id === productoId);
            
            if (producto && producto.stock >= diferencia) {
                item.cantidad = nuevaCantidad;
                producto.reducirStock(diferencia);
                this.guardarEnStorage();
                return true;
            }
        }
        return false;
    }

   
    obtenerTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.producto.precio * item.cantidad);
        }, 0);
    }

   
    obtenerCantidadTotal() {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }

    
    vaciarCarrito() {
       
        this.items.forEach(item => {
            const producto = productos.find(p => p.id === item.producto.id);
            if (producto) {
                producto.aumentarStock(item.cantidad);
            }
        });
        this.items = [];
        this.guardarEnStorage();
    }

    
    guardarEnStorage() {
        const carritoData = this.items.map(item => ({
            productoId: item.producto.id,
            cantidad: item.cantidad
        }));
        localStorage.setItem('carrito', JSON.stringify(carritoData));
        
        
        const productosData = productos.map(p => ({
            id: p.id,
            stock: p.stock
        }));
        localStorage.setItem('productosStock', JSON.stringify(productosData));
    }

   
    cargarDesdeStorage() {
        const carritoData = localStorage.getItem('carrito');
        if (carritoData) {
            const items = JSON.parse(carritoData);
            this.items = items.map(item => {
                const producto = productos.find(p => p.id === item.productoId);
                return producto ? { producto, cantidad: item.cantidad } : null;
            }).filter(item => item !== null);
        }
    }
}




// ← CAMBIO 3: Aquí defines las rutas de tus imágenes PNG
const productosIniciales = [
    new Producto(1, "MacBook Pro M3", 2499.99, "Laptops", 5, "images/macbook.png"),
    new Producto(2, "iPhone 15 Pro", 1199.99, "Smartphones", 10, "images/iphone.png"),
    new Producto(3, "AirPods Pro", 249.99, "Audio", 15, "images/airpods.png"),
    new Producto(4, "iPad Air", 599.99, "Laptops", 8, "images/ipad.png"),
    new Producto(5, "Samsung Galaxy S24", 899.99, "Smartphones", 12, "images/samsung.png"),
    new Producto(6, "Magic Mouse", 79.99, "Accesorios", 20, "images/mouse.png"),
    new Producto(7, "Dell XPS 15", 1899.99, "Laptops", 6, "images/dell.png"),
    new Producto(8, "Sony WH-1000XM5", 399.99, "Audio", 10, "images/sony.png"),
    new Producto(9, "Magic Keyboard", 149.99, "Accesorios", 15, "images/keyboard.png"),
    new Producto(10, "Apple Watch Ultra", 799.99, "Accesorios", 7, "images/watch.png"),
];

// Cargar stock desde localStorage si existe
const stockGuardado = localStorage.getItem('productosStock');
if (stockGuardado) {
    const stockData = JSON.parse(stockGuardado);
    stockData.forEach(item => {
        const producto = productosIniciales.find(p => p.id === item.id);
        if (producto) {
            producto.stock = item.stock;
        }
    });
}

// Variables globales
const productos = productosIniciales;
const carrito = new Carrito();


// FUNCIONES DE RENDERIZADO


// Renderizar todos los productos en el grid
function renderizarProductos(productosAMostrar = productos) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    productosAMostrar.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        // ← CAMBIO 4: Usamos <img> en lugar del emoji
        card.innerHTML = `
            <div class="product-image">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="product-name">${producto.nombre}</div>
            <div class="product-category">${producto.categoria}</div>
            <div class="product-price">$${producto.precio.toFixed(2)}</div>
            <div class="product-stock">Stock: ${producto.stock} unidades</div>
            <button class="btn btn-add" onclick="agregarAlCarrito(${producto.id})" 
                    ${producto.stock === 0 ? 'disabled' : ''}>
                ${producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
        `;
        grid.appendChild(card);
    });
}

// Renderizar el carrito de compras
function renderizarCarrito() {
    const cartContent = document.getElementById('cartContent');
    const cartCount = document.getElementById('cartCount');

    // Actualizar contador del carrito
    cartCount.textContent = carrito.obtenerCantidadTotal();

    // Si el carrito está vacío
    if (carrito.items.length === 0) {
        cartContent.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
        return;
    }

    // Construir HTML del carrito
    let html = '<div class="cart-items">';
    
    carrito.items.forEach(item => {
        // ← CAMBIO 5: Mostramos imagen miniatura en el carrito
        html += `
            <div class="cart-item">
                <img src="${item.producto.imagen}" alt="${item.producto.nombre}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.producto.nombre}</div>
                    <div class="cart-item-price">$${item.producto.precio.toFixed(2)} c/u</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="cambiarCantidad(${item.producto.id}, -1)">-</button>
                    <span class="quantity">${item.cantidad}</span>
                    <button class="quantity-btn" onclick="cambiarCantidad(${item.producto.id}, 1)">+</button>
                    <button class="remove-btn" onclick="eliminarDelCarrito(${item.producto.id})">🗑️</button>
                </div>
            </div>
        `;
    });

    html += '</div>';

    // Calcular totales
    const subtotal = carrito.obtenerTotal();
    const impuestos = subtotal * 0.16; // IVA 16%
    const total = subtotal + impuestos;

    // Agregar resumen y botones
    html += `
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>IVA (16%):</span>
                <span>$${impuestos.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        <button class="btn btn-checkout" onclick="finalizarCompra()">Finalizar Compra</button>
        <button class="btn btn-clear" onclick="vaciarCarrito()">Vaciar Carrito</button>
    `;

    cartContent.innerHTML = html;
}

// ===================================
// FUNCIONES DE INTERACCIÓN
// ===================================

// Agregar producto al carrito
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    
    if (producto && producto.stock > 0) {
        if (producto.reducirStock(1)) {
            carrito.agregarProducto(producto);
            renderizarCarrito();
            renderizarProductos(obtenerProductosFiltrados());
            mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
        }
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(productoId) {
    carrito.eliminarProducto(productoId);
    renderizarCarrito();
    renderizarProductos(obtenerProductosFiltrados());
    mostrarNotificacion('🗑️ Producto eliminado del carrito');
}

// Cambiar cantidad de un producto
function cambiarCantidad(productoId, cambio) {
    const item = carrito.items.find(i => i.producto.id === productoId);
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;

    // Si la cantidad llega a 0, eliminar el producto
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(productoId);
        return;
    }

    const producto = productos.find(p => p.id === productoId);
    
    if (cambio > 0) {
        // Aumentar cantidad
        if (producto.stock >= 1) {
            producto.reducirStock(1);
            carrito.modificarCantidad(productoId, nuevaCantidad);
        } else {
            mostrarNotificacion('⚠️ No hay suficiente stock');
            return;
        }
    } else {
        // Disminuir cantidad
        producto.aumentarStock(1);
        carrito.modificarCantidad(productoId, nuevaCantidad);
    }

    renderizarCarrito();
    renderizarProductos(obtenerProductosFiltrados());
}

// Vaciar el carrito
function vaciarCarrito() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito.vaciarCarrito();
        renderizarCarrito();
        renderizarProductos(obtenerProductosFiltrados());
        mostrarNotificación('🗑️ Carrito vaciado');
    }
}

// Finalizar la compra
function finalizarCompra() {
    if (carrito.items.length === 0) {
        mostrarNotificacion('⚠️ El carrito está vacío');
        return;
    }

    const total = carrito.obtenerTotal() * 1.16;
    if (confirm(`¿Confirmar compra por $${total.toFixed(2)}?`)) {
        // Guardar compra en historial
        const historial = JSON.parse(localStorage.getItem('historialCompras') || '[]');
        historial.push({
            fecha: new Date().toISOString(),
            items: carrito.items.map(i => ({
                nombre: i.producto.nombre,
                cantidad: i.cantidad,
                precio: i.producto.precio
            })),
            total: total
        });
        localStorage.setItem('historialCompras', JSON.stringify(historial));

        // Vaciar el carrito
        carrito.items = [];
        carrito.guardarEnStorage();
        renderizarCarrito();
        mostrarNotificacion('✅ ¡Compra realizada con éxito!');
    }
}

// Mostrar notificación temporal
function mostrarNotificacion(mensaje) {
    const notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===================================
// FUNCIONES DE FILTRADO Y BÚSQUEDA
// ===================================

// Obtener productos filtrados según los criterios seleccionados
function obtenerProductosFiltrados() {
    let productosFiltrados = [...productos];

    // Filtro por categoría
    const categoria = document.getElementById('filterCategory').value;
    if (categoria !== 'all') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === categoria);
    }

    // Búsqueda por nombre
    const busqueda = document.getElementById('searchInput').value.toLowerCase();
    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(busqueda)
        );
    }

    // Ordenamiento
    const orden = document.getElementById('sortBy').value;
    switch(orden) {
        case 'name':
            productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'price-asc':
            productosFiltrados.sort((a, b) => a.precio - b.precio);
            break;
        case 'price-desc':
            productosFiltrados.sort((a, b) => b.precio - a.precio);
            break;
    }

    return productosFiltrados;
}

// ===================================
// EVENT LISTENERS
// ===================================

// Filtro de categoría
document.getElementById('filterCategory').addEventListener('change', () => {
    renderizarProductos(obtenerProductosFiltrados());
});

// Ordenamiento
document.getElementById('sortBy').addEventListener('change', () => {
    renderizarProductos(obtenerProductosFiltrados());
});

// Búsqueda
document.getElementById('searchInput').addEventListener('input', () => {
    renderizarProductos(obtenerProductosFiltrados());
});

// ===================================
// INICIALIZACIÓN
// ===================================
renderizarProductos();
renderizarCarrito();