import { check, validationResult, ExpressValidator } from 'express-validator'
import Usuario from '../models/Usuario.js'
import { generarId } from '../helpers/tokens.js'
import {emailRegistro} from '../helpers/emails.js'

const formLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
        autenticado: false
    })
}

const formRegister = (req, res) =>{
    //console.log(req.csrfToken())

    res.render('auth/register', {
        pagina: 'Crear Cuenta',
        csrfToken : req.csrfToken()
    })
}

const registrar =  async (req, res) =>{

    console.log(req.body)

//Validacion nombre
await check('nombre').notEmpty().withMessage('Nombre obligatorio').run(req)

//Validacion email
await check('email').isEmail().withMessage('Email obligatorio').run(req)

//Validacion password
await check('password').isLength({min: 6}).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)

//Repetir password
await check('repetir_password').equals(req.body.password).withMessage('Los passwords no son iguales').run(req)

//Verificar que el resultado este vacio
let resultado = validationResult(req)
// return res.json(resultado.array())

if (!resultado.isEmpty()) {
    //Errores
    return res.render('auth/register', {
        pagina: 'Crear Cuenta',
        csrfToken : req.csrfToken(),
        errores: resultado.array(),
        usuario:{
            nombre: req.body.nombre,
            email : req.body.email
        }
    })

}
    const {nombre, email, password} = req.body


    //Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({where: {email}})
    if(existeUsuario){
        return res.render('auth/register', {
            pagina: 'Crear Cuenta',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'Existe un usuario que ya esta registrado con ese email'}],
            usuario:{
                nombre: req.body.nombre,
                email : req.body.email
            }
        })
    }
    
    //res.json(resultado.array());
    
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    //Enviar email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })
    
    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Se ha enviado un email de confirmacion a su correo, haz click en el enlace'
    })


}

//Funcion que comprueba una cuenta
const confirmar = async(req, res) => {
    const {token} = req.params;

    //Verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}})

    console.log(usuario)

    if(!usuario){
        return res.render('./auth/confirmarCuenta', {
            pagina: 'Error al confirmar la cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta',
            error: true
        })
    }

    //Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('./auth/confirmarCuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo exitosamente',
        error: false
    })

}

const formRecuperarPassword = (req, res) =>{
    res.render('auth/recuperarpassword', {
        pagina: 'Recupera tu acceso'
    })
}


export {
    formLogin, formRegister, formRecuperarPassword, registrar, confirmar
}