import express from "express"
import {admin, crear, guardar} from '../controllers/propiedadController.js'
import { body } from "express-validator"
import protegerRuta from "../middleware/protegerRuta.js"

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


export default router