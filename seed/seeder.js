import {exit} from 'node:process'
import categorias from './categorias.js'
import precios from './precios.js'
import db from "../config/db.js";
import {Categoria, Precio } from '../models/index.js'

const importarDatos = async() =>{
    try 
    {
        //Autenticar
        await db.authenticate()

        //Generar las columnas
        await db.sync()

        //Insertar los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios)
        ])


        console.log('Datos importados correctamente')
        exit()
        
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

if(process.argv[2]=== "-i"){
    importarDatos();
}

const eliminarDatos = async () => {
    try {
        await Promise.all([
            Propiedad.destroy({ where: {}, force: true }),
            Precio.destroy({where: {}, truncate: true}),
            Categoria.destroy({where: {}, truncate: true})

        ])
        console.log("Datos eliminados correctamente")
        exit()
    } catch (error) {
        console.log(error)
    }
}


if(process.argv[2]=== "-e"){
    eliminarDatos();
}
