import express from "express"
import {admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, cambiarEstado, eliminar, mostrarPropiedad, enviarMensaje, verMensajes} from '../controllers/propiedadController.js'
import { body } from "express-validator"
import protegerRuta from "../middleware/protegerRuta.js"
import upload from "../middleware/subirImagen.js"
import identificarUsuario from "../middleware/identificarUsuario.js"

const router = express.Router()

router.get('/mis-propiedades', protegerRuta, admin)

router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta,
    
    //Campos llenados manualmente
    body('titulo').notEmpty().withMessage('El titulo del anuncio es requerido'),
    body('descripcion').notEmpty().withMessage('La descripcion del anuncio es requerida'),

    //Seleccion de combos - Clasificaciones de propiedad
    body('categoria').isNumeric().withMessage('Selecciona una categoria de propiedad'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios de la propiedad'),

    //Seleccion de combos - Caracteristicas de propiedad
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones de la propiedad'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos de la propiedad'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños de la propiedad'),

    //Mapa
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    
    guardar
)

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen);

router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id',
    protegerRuta,
    editar
)

router.post('/propiedades/editar/:id', protegerRuta,
    
    //Campos llenados manualmente
    body('titulo').notEmpty().withMessage('El titulo del anuncio es requerido'),
    body('descripcion').notEmpty().withMessage('La descripcion del anuncio es requerida'),

    //Seleccion de combos - Clasificaciones de propiedad
    body('categoria').isNumeric().withMessage('Selecciona una categoria de propiedad'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios de la propiedad'),

    //Seleccion de combos - Caracteristicas de propiedad
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones de la propiedad'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos de la propiedad'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños de la propiedad'),

    //Mapa
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    
    guardarCambios
)

router.post('/propiedades/eliminar/:id',
    protegerRuta, eliminar
)

router.put('/propiedades/:id', protegerRuta
    , cambiarEstado
)

//Area publica
router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad

)

//Almacenar los mensajes
router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min:10}).withMessage('El mensaje no puede ir vacio o es muy corto'),
    enviarMensaje

)

router.get('/mensajes/:id', protegerRuta, verMensajes)



export default router