(function () {
    const lat = 20.67444163271174;
    const lng = -103.38739216304566;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 16);

    let markers = new L.FeatureGroup().addTo(mapa)

    let propiedades = [];

    //Filtros
    const filtros = {
        categoria: '',
        precio: ''
    }

    const categoriasSelect = document.querySelector('#categorias')
    const preciosSelect = document.querySelector('#precios')

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //Filtrado de cat y prec
    categoriasSelect.addEventListener('change', e=>{
        filtros.categoria = +e.target.value
        filtrarPropiedades()
    })

    preciosSelect.addEventListener('change', e=>{
        filtros.precio = +e.target.value
    })

    const obtenerPropiedades = async () =>{
        try {
            const url = '/api/propiedades'
            const respuesta = await fetch(url)

            propiedades = await respuesta.json()

            mostrarPropiedades(propiedades)

            //console.log(propiedades)
        } catch (error) {
            console.log(error)
        }
    }

    const mostrarPropiedades = propiedades => {

        //Limpiar los markers previos
        markers.clearLayers()

        propiedades.forEach(propiedad =>{
            //Agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true

            })
            .addTo(mapa).bindPopup(`
                <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad.imagen}" alt="Imagen Propiedad ${propiedad.titulo}">
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
                <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
                <a href="/propiedad/${propiedad.id}" class="bg-indigo-500 block p-2 text-center font-bold uppercase text-white">Ver propiedad</a>

                `)

            markers.addLayer(marker)
    })
    }
    
    const filtrarPropiedades = () => {
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio)
        mostrarPropiedades(resultado)
    }

    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad
    
    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad

    obtenerPropiedades()


})()