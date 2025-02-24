//const express = require('express') //CommonJs
import express from 'express' //ES Modules
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import db from './config/db.js'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'

//Crear la app
const app = express()

express.json()

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended:true}))

//Habilitar cookie parser
app.use(cookieParser())

//Habilitar CSRF
app.use(csrf({cookie: true}))

//Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log('Conexion correcta a la base de datos');
} catch (error) {
    console.log(error)
}

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta publica
app.use(express.static('public'))

//Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes)
app.use('/', propiedadesRoutes)


//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})