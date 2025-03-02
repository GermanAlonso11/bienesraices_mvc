import { check, validationResult, ExpressValidator } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import {generarJWT, generarId } from '../helpers/tokens.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/emails.js'

const formLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
        // autenticado: false,
        csrfToken : req.csrfToken()
    })
}

const autenticar = async(req, res) =>{
    //Validacion
    //Validacion email
    await check('email').isEmail().withMessage('Email obligatorio').run(req)

    //Validacion password
    await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req)

    let resultado = validationResult(req)

if (!resultado.isEmpty()) {
    //Errores
    return res.render('auth/login', {
        pagina: 'Iniciar sesion',
        csrfToken : req.csrfToken(),
        errores: resultado.array()
        
    })
}

//Comprobar si el usuario existe
const {email, password} = req.body

const usuario = await Usuario.findOne({where: {email}})
if(!usuario){
    return res.render('auth/login', {
        pagina: 'Iniciar sesion',
        csrfToken : req.csrfToken(),
        errores: [{msg: 'El usuario no existe'}]
        
    })
}

//COmprobar si el usuario esta confirmado
if(!usuario.confirmado){
    return res.render('auth/login', {
        pagina: 'Iniciar sesion',
        csrfToken : req.csrfToken(),
        errores: [{msg: 'Tu cuenta no esta confirmada'}]
        
    })
}

//Revisar el password
if(!usuario.verificarPassword(password)){
    return res.render('auth/login', {
        pagina: 'Iniciar sesion',
        csrfToken : req.csrfToken(),
        errores: [{msg: 'La contraseña es incorrecta'}]
        
    })
}

//Autenticar al usuario
const token = generarJWT({id: usuario.id, nombre: usuario.nombre})
console.log(token)

//Almacenar en cookie
return res.cookie('_token', token, {
    httpOnly: true
    //secure: true,
}).redirect('/mis-propiedades')
}

const cerrarSesion = (req, res) =>{
    return res.clearCookie('_token').status(200).redirect('/auth/login')
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

//formularioOlvidePassword
const formRecuperarPassword = (req, res) =>{
    res.render('auth/recuperarpassword', {
        pagina: 'Recupera tu acceso',
        csrfToken : req.csrfToken()
    })
}

const resetPassword = async(req, res) =>{
    
    //Validacion email
    await check('email').isEmail().withMessage('Email obligatorio').run(req)
        
    //Verificar que el resultado este vacio
    let resultado = validationResult(req)
    // return res.json(resultado.array())
    
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/recuperarpassword', {
            pagina: 'Recupera tu acceso',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
        })
    
    }

    //Buscar el usuario
    const {email} = req.body
    const usuario = await Usuario.findOne({where: {email}})

    console.log(usuario)

    if(!usuario){
        return res.render('auth/recuperarpassword', {
            pagina: 'Recupera tu acceso',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'El email no pertenece a ningun usuario existente'}]
        })
    }

    //Generar un token y enviar email
    usuario.token = generarId();
    await usuario.save();

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar un mensaje
    res.render('templates/mensaje', {
        pagina: 'Restablece tu password',
        mensaje: 'Se ha enviado un email con las instrucciones'
    })
}

const comprobarToken = async (req, res, ) =>{
    const {token} = req.params;
    const usuario = await Usuario.findOne({where: {token}})
    
    console.log(usuario)
    
    if(!usuario){
        return res.render('./auth/confirmarCuenta', {
            pagina: 'Restablece tu Password',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        })
    }

    //Mostrar form para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Restablece tu password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) =>{
    //Validar pass
    await check('password').isLength({min: 6}).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)
    
    //Verificar que el resultado este vacio
    let resultado = validationResult(req)
    // return res.json(resultado.array())

    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu password',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
            
        })

    }

    const {token} = req.params
    const {password} = req.body;

    //Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}});

    //Hashear el nuevo pass
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save()
    
    res.render('auth/confirmarCuenta', {
        pagina: 'Password Restablecido',
        mensaje: 'El password se guardo correctamente'
    })

}

export {
    formLogin, formRegister, formRecuperarPassword, registrar, confirmar, resetPassword, comprobarToken, nuevoPassword, autenticar, cerrarSesion
}