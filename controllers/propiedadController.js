import Precio from "../models/Precio.js"
import Categoria from "../models/Categoria.js"

const admin = (req, res) =>{
    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        barra: true
    })
}

//Form para crear una nueva propiedad
const crear = async (req, res) => {
    //Consultar modelo de precio y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    
    res.render('propiedades/crear', {
        pagina: 'Crear propiedad',
        barra: true,
        categorias,
        precios
    })
}


export {
    admin, crear
}