let productos = [];
let productosCarrito = [];

//al cargar la pagina aparecen todos los productos y se inicializa el carrito
document.addEventListener('DOMContentLoaded', () => {
    fetch('productos/productos.json')
    .then(res => res.json())
    .then(data => {
        productos = data;
        busqueda(document.getElementById("buscador"))
        carrito();
        calculoDineroTotal();
        
    })
})
//le agregamos el evento click a cada boton de agregar al acarrito de la busqueda
const agregarEventos = () => {

    //recupero todos los botones
    let buttonAgregar = document.querySelectorAll("#tarjeta-button-agregar")

    //recorro el array de botones y agrego los eventos
    buttonAgregar.forEach(button => {
        button.addEventListener("click", () => agregarAlCarrito(button.parentElement))
    });    

    let buttonBuscar = document.getElementById("button-buscador")
    buttonBuscar.addEventListener("click", () => {
        busqueda(buscador);
    })
    
    let buscador = document.getElementById("buscador")
    buscador.addEventListener("keypress", (event) => {
    event.key === "Enter" ? busqueda(buscador) : 0})
    
    

    let buttonBorrarCarrito = document.getElementById("carrito-borrar")
    buttonBorrarCarrito.addEventListener("click", () => limpiarCarrito());
    

    const button = document.getElementById("carrito-pagar")
    button.addEventListener("click", () => {pagarCarrito()}) 

}
//recuperamos el carrito o lo inicializamos vacio
const carrito = () => {
    productosCarrito = JSON.parse(localStorage.getItem("carrito")) || localStorage.setItem("carrito", JSON.stringify([]));

    //incrementamos contador de carrito
    let cantidadTotal = 0
    productosCarrito.forEach(producto => {
        cantidadTotal += producto.cantidad
    });
    const contador = document.getElementById("header-contador");
    contador.innerHTML = cantidadTotal || "0"
}

const calculoDineroTotal = () => {
    let dineroTotal = 0;
    if (productosCarrito.length !== 0) {
        productosCarrito.forEach(producto => {
            dineroTotal += producto.precio * producto.cantidad;
        });
    }
    document.getElementById("carrito-precio-total").innerHTML = `TOTAL :   $${dineroTotal} ARS`
    return dineroTotal;
}
//limpiamos resultados anteriores para no acumular busquedas
function limpiarResultados() {
    let lista = document.getElementById("productos")
    lista.innerHTML = '';
    let carritoProductos = document.getElementsByClassName("carrito-productos")
    carritoProductos.innerHTML = "";
    let carrito = document.getElementById("carrito")
    carrito.setAttribute("class", "hidden");

}

function agregarAlCarrito(tarjetaProducto) {

    //busco el producto que se quiere agregar y lo guardo en una variable auxiliar
    const producto = busquedaProducto(tarjetaProducto.id)

    //creo un nuevo pproducto que va a ser el que se agreugue al carrito con la propiedad cantidad
    const productoCarrito = {
        ...producto,
        cantidad: 0
    }

    //revisamos si ya existe este producto en el carrito
    if (busquedaEnCarrito(productoCarrito)) {
        productosCarrito.forEach(producto => {
            if (producto.id === productoCarrito.id) ++producto.cantidad
        });
    } else {
        productoCarrito.cantidad = 1;
        productosCarrito.push(productoCarrito);
    }

    //actualizo los cambios en el localStorage
    localStorage.setItem("carrito", JSON.stringify(productosCarrito))

    //contamos cantidad total de productos
    let cantidadTotal = 0
    productosCarrito.map(producto => {
        cantidadTotal += producto.cantidad
    });

    //actualizamos contador carrito
    document.getElementById("header-contador").innerHTML = cantidadTotal;

    Swal.fire({
        icon: 'success',
        text: 'Agregado al carrito',
        showConfirmButton: false,
        timer: 1000
      })
}



//retorna el producto que coincida con el id
function busquedaProducto(id) {
    return productos.find(producto =>
        producto.id == id
    )
}

//retorna un producto si es que existe en el carrito, sino null
function busquedaEnCarrito(productoCarrito) {
    return productosCarrito.find(producto => producto.id == productoCarrito.id)
}

//busqueda para productos
function busqueda(busqueda) {

    
    busqueda = busqueda.value;
    limpiarResultados();
    //caso vacio
    if (busqueda === "" || busqueda === null) {
        for (const producto of productos) {
            revisionFiltrado(producto)
        }
    } else {
        //caso con contenido
        busqueda = busqueda.toLowerCase();
        for (const producto of productos) {
            if (producto.modelo.toLowerCase().includes(busqueda) || producto.marca.toLowerCase().includes(busqueda) || producto.tipo.toLowerCase().includes(busqueda)) {
                revisionFiltrado(producto);
            }
            }
    }
    //asigno evento a los resultados
    agregarEventos();

    //si no hubieron resultados
    if (document.getElementById("productos").innerHTML === "") {
        document.getElementById("productos").innerHTML = "<h3> No se encontraron resultados </h3>"
    }

}
//creamos la tarjeta de cada producto de la busqueda
function crearTarjeta(producto) {

    let tarjeta = document.createElement("div")
    tarjeta.innerHTML = `
        <h3 class="titulo">${producto.tipo} ${producto.marca} ${producto.modelo}</h3>
        <p class="descripcion">${producto.descripcion}</p>
        <div class="tarjeta-contenedor-imagen">
            <img src="${producto.Image}">
        </div>
        <h4 class="precio">$${producto.precio} ARS</h4>
        <button id="tarjeta-button-agregar"  class="tarjeta-button"  type="button">
            <img src="Icons/carritoAgregarCeleste.svg" alt="icon AgregarCarrito">
        </button>`

    tarjeta.setAttribute("class", "tarjeta-producto")
    tarjeta.setAttribute("id", producto.id);

    document.getElementById("productos").append(tarjeta);
}
//metodo de filtrado, revisa si se aplicaron filtros
function revisionFiltrado(producto) {

    let filtroMarca = document.getElementById("filtro-marca").value;
    let filtroTipo = document.getElementById("filtro-tipo").value;

    if (filtroMarca != "") {
        filtroMarca = filtroMarca.toLowerCase()
    }
    if (filtroTipo != "") {
        filtroTipo = filtroTipo.toLowerCase()
    }

    if (filtroMarca === "" && filtroTipo === "") {
        crearTarjeta(producto)

    } else if (filtroMarca === "") {
        if (producto.tipo.toLowerCase() === filtroTipo) {
            crearTarjeta(producto)

        }
    } else if (filtroTipo === "") {
        if (producto.marca.toLowerCase() === filtroMarca) {
            crearTarjeta(producto)

        }
    } else {
        if (producto.tipo.toLowerCase() === filtroTipo && producto.marca.toLowerCase() === filtroMarca) {
            crearTarjeta(producto)

        }
    }

}

const buttonCarrito = document.getElementById("header-carrito-button")
buttonCarrito.addEventListener("click", () => crearTarjetaCarrito());

const crearTarjetaCarrito = () => {

    //limpio las busquedas
    limpiarResultados();
    let carritoTotal = document.getElementById("carrito")

    //hago visible el carrito
    carritoTotal.classList.remove("hidden");
    carritoTotal.setAttribute("class", "carrito")

    //actualizo contador del carrito
    let cantidadTotal = 0
    productosCarrito.forEach(producto => {
        cantidadTotal += producto.cantidad
    });
    document.getElementById("header-contador").innerHTML = cantidadTotal || "0";
    

    //traigo la seccion de productos y creo las tarjetas de los productos
    let carritoProductos = document.getElementById("carrito-productos")

    //caso de que no hayan productos
    if (productosCarrito.length === 0) {
        carritoProductos.innerHTML = "No has agregado ningun elemento al carrito"
    } else {
        carritoProductos.innerHTML = ""
        productosCarrito.forEach(producto => {
            const tarjetaCarrito = document.createElement("div");

            tarjetaCarrito.innerHTML = `
            
                <div class="carrito-info-producto" id="${producto.id}">
                    <h3>${producto.tipo} ${producto.marca} ${producto.modelo}</h3>
                    <p>${producto.descripcion}</p>
                </div>
                <div class=carrito-responsive>
                    <div class="carrito-imagen">
                        <img src="${producto.Image}">
                    </div>
                    <div class="carrito-cantidades">
                        <h4>precio: $${producto.precio * producto.cantidad} ARS</h4>
                        <h4>cantidad: ${producto.cantidad}</h4>
                    </div>
                    <div class="carrito-botones">
                        <button class="button-sumarProducto" id="button-sumarProducto">
                            <img src="Icons/carritoSumar.svg" alt="icon sumar">
                        </button>
                        <button class="button-eliminarProducto" id="button-eliminarProducto">
                            <img src="Icons/carritoEliminar.svg" alt="icon eliminar">
                        </button>
                    </div>
                </div>
            `
            //los agrego al html
            tarjetaCarrito.setAttribute("class", "carrito-tarjeta")
            carritoProductos.append(tarjetaCarrito);
        });

            //cargamos los eventos de los botones
       let buttonEliminarProducto = document.querySelectorAll(".button-eliminarProducto")
       let buttonAgregarProducto = document.querySelectorAll(".button-sumarProducto")
   
       //recorro todos los botones para asignar los eventos
       for (let i=0 ; i < buttonAgregarProducto.length ; i++){
           buttonEliminarProducto[i].addEventListener("click", () => eliminarProducto(buttonAgregarProducto[i].parentElement.parentElement.parentElement))
           buttonAgregarProducto[i].addEventListener("click", () => agregarProducto(buttonAgregarProducto[i].parentElement.parentElement.parentElement))
       }
       calculoDineroTotal();
        
    }
}
//elimina un producto del carrito
const eliminarProducto = (tarjetaProducto) => {

    tarjetaProducto = tarjetaProducto.children[0]

    let productoBuscado = productosCarrito.find((producto) => producto.id == tarjetaProducto.id)

    //revisa si hay mas o lo tiene que eliminar
    if (productoBuscado.cantidad === 1) {
        productosCarrito = productosCarrito.filter((producto) => producto.id != tarjetaProducto.id)
    } else {
        productoBuscado.cantidad--;
    }

    //actualiza el local storage
    localStorage.setItem("carrito", JSON.stringify(productosCarrito));
    crearTarjetaCarrito();
    calculoDineroTotal();
}

//metodo que suma mas productos iguales
const agregarProducto = (tarjetaProducto) => {
    
    tarjetaProducto = tarjetaProducto.children[0]
    

    let productoBuscado = productosCarrito.find((producto) => producto.id == tarjetaProducto.id)

    productoBuscado.cantidad++

    //actualiza el localStorage
    localStorage.setItem("carrito", JSON.stringify(productosCarrito));
    crearTarjetaCarrito();
    calculoDineroTotal();
}

const limpiarCarrito = () => {
    productosCarrito = [];
    localStorage.setItem("carrito", JSON.stringify(productosCarrito))
    crearTarjetaCarrito();
    calculoDineroTotal();
}

const pagarCarrito = () => {
    if(calculoDineroTotal() == 0){
        Swal.fire({
            icon: 'error',
            title: 'No has agregado nada al carrito',
            showConfirmButton: false,
            timer: 1500
            
          })
    }else{
        limpiarCarrito();
        calculoDineroTotal();
        Swal.fire({
            icon: 'success',
            title: 'Has pagado con exito',
            showConfirmButton: false,
            timer: 1500
          })
    }
}


