// import Precio from "../models/Precio.js"
// import Categoria from "../models/Categoria.js"
import {Precio, Categoria, Propiedad} from '../models/index.js'
import { validationResult } from "express-validator"

const admin = async (req, res) =>{
    const { id } = req.usuario

    const propiedades = await Propiedad.findAll({
        where: {
            usuarioId: id
        }
    })

    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        propiedades
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
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {
    //Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
 
        return res.render('propiedades/crear', {
            pagina: 'Crear propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    //Crear un registro
    const {titulo, descripcion, categoria: categoriaId, precio: precioId, habitaciones, estacionamiento, wc, calle, lat, lng} = req.body

    const {id: usuarioId} = req.usuario

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''

        })
        console.log(req.body); // Verifica que `categoria` llega correctamente desde el formulario

        const {id} = propiedadGuardada

        res.redirect(`/propiedades/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async (req, res) => {

    const {id} = req.params
    //Validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad no esta publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad

    });
}

const almacenarImagen = async (req, res, next) =>{
    const {id} = req.params
    //Validar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad no esta publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    try {
        propiedad.imagen = req.file.filename

        propiedad.publicado = 1

        await propiedad.save()

        next()

        //almacenar imagen y prublicar propiedad
    } catch (error) {
        console.log(error)
    }
}


export {
    admin, crear, guardar, agregarImagen, almacenarImagen
}