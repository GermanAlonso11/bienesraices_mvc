import { check, validationResult, ExpressValidator } from 'express-validator'
import Usuario from '../models/Usuario.js'
import { generarId } from '../helpers/tokens.js'

const formLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
        autenticado: false
    })
}

const formRegister = (req, res) =>{
    res.render('auth/register', {
        pagina: 'Crear Cuenta'
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
            errores: [{msg: 'Existe un usuario que ya esta registrado con ese email'}],
            usuario:{
                nombre: req.body.nombre,
                email : req.body.email
            }
        })
    }
    
    //res.json(resultado.array());
    
    await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });
    
    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Se ha enviado un email de confirmacion a su correo, haz click en el enlace'
    })


}

const formRecuperarPassword = (req, res) =>{
    res.render('auth/recuperarpassword', {
        pagina: 'Recupera tu acceso'
    })
}


export {
    formLogin, formRegister, formRecuperarPassword, registrar
}