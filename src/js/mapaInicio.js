(function () {
    const lat = 20.67444163271174;
    const lng = -103.38739216304566;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 16);

    let markers = new L.FeatureGroup().addTo(mapa)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    const obtenerPropiedades = async () =>{
        try {
            const url = '/api/propiedades'
            const respuesta = await fetch(url)

            const propiedades = await respuesta.json()

            mostrarPropiedades(propiedades)

            //console.log(propiedades)
        } catch (error) {
            console.log(error)
        }
    }

    const mostrarPropiedades = propiedades => {
        propiedades.forEach(propiedad =>{
            //Agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true

            })
            .addTo(mapa).bindPopup('Informacion')

            markers.addLayer(marker)
    })
    }
    obtenerPropiedades()


})()