// import Precio from "../models/Precio.js"
// import Categoria from "../models/Categoria.js"
import {unlink} from 'node:fs/promises'
import {Precio, Categoria, Propiedad} from '../models/index.js'
import { validationResult } from "express-validator"

const admin = async (req, res) =>{
    //Leer query string
    const {pagina: paginaActual} = req.query

    const expresion = /^[0-9]$/

    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const { id } = req.usuario

        //Limites y offset para el paginador
        const limit = 10
        const offset = ((paginaActual * limit) - limit)

    const [propiedades, total] = await Promise.all([
         Propiedad.findAll({
            limit,
            offset,
            where: {
                usuarioId: id
            },
            include: [
                {
                    model: Categoria, as: 'categoria'
                    
                },
                {
                    model: Precio, as: 'precio'
                }
            ]
        }),
        Propiedad.count({
            where: {
                usuarioId: id
            }
        })
    ])

    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        propiedades,
        csrfToken: req.csrfToken(),
        paginas: Math.ceil(total/limit),
        paginaActual,
        total,
        offset,
        limit
    })


    } catch (error) {
        console.log(error)
    }
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

const editar = async (req, res) => {
    //Consultar modelo de precio y categorias
    const {id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //Revisar que el creador de la propiedad pueda entrar a la propiedad, no otro
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    
    res.render('propiedades/editar', {
        pagina: `Editar propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async (req, res) => {

    //Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
 
        
        return res.render('propiedades/editar', {
            pagina: 'Editar propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })

    }

    //Verificar validacion
    const {id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //Revisar que el creador de la propiedad pueda entrar a la propiedad, no otro
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Reescribir el obj y actualizarlo
    try {
        const {titulo, descripcion, categoria: categoriaId, precio: precioId, habitaciones, estacionamiento, wc, calle, lat, lng} = req.body
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })
        await propiedad.save();
        res.redirect('/mis-propiedades')

    } catch (error) {
        
    }

}

const eliminar = async (req, res) => {
        //Verificar validacion
        const {id } = req.params

        //Validar que la propiedad exista
        const propiedad = await Propiedad.findByPk(id)
    
        if(!propiedad){
            return res.redirect('/mis-propiedades')
        }
    
        //Revisar que el creador de la propiedad pueda entrar a la propiedad, no otro
        if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
            return res.redirect('/mis-propiedades')
        }

        //Eliminar imagen
        await unlink(`public/uploads/${propiedad.imagen}`)

        

        //Eliminar la propiedad
        await propiedad.destroy()
        res.redirect('/mis-propiedades')


}

//Mostrar propiedad
    const mostrarPropiedad = async (req, res) => {
        const {id} = req.params

        //Comprobar que la propiedad exista
        const propiedad = await Propiedad.findByPk(id, {
            include: [
                {
                    model: Precio, as: 'precio'
                },
                {
                    model: Categoria, as: 'categoria'
                }
            ]
        })

        if(!propiedad){
            return res.redirect('/404')
        }

        res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo
        })
    }


export {
    admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, mostrarPropiedad
}