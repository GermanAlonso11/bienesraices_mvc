import {exit} from 'node:process'
import categorias from './categorias.js'
import precios from './precios.js'
import db from "../config/db.js";
import usuarios from './usuarios.js'
import {Categoria, Precio, Propiedad, Usuario } from '../models/index.js'

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
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
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

// const eliminarDatos = async () => {
//     try {
//         await Promise.all([
//             Propiedad.destroy({ where: {}, truncate: true }),
//             Precio.destroy({where: {}, truncate: true}),
//             Categoria.destroy({where: {}, truncate: true})

//         ])
//         console.log("Datos eliminados correctamente")
//         exit()
//     } catch (error) {
//         console.log(error)
//     }
// }

// const eliminarDatos = async () => {
//     try {
//         // Deshabilitar restricciones de clave foránea
//         await db.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });

//         // Eliminar los datos en el orden correcto
//         await Propiedad.destroy({ where: {}, TRUNCATE: true });
//         await Precio.destroy({ where: {}, TRUNCATE: true });
//         await Categoria.destroy({ where: {}, TRUNCATE: true });

//         // Volver a habilitar restricciones de clave foránea
//         await db.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

//         console.log("Datos eliminados correctamente");
//         exit(0);
//     } catch (error) {
//         console.log(error);
//         process.exit(1);
//     }
// };

const eliminarDatos = async () => {
    try {
    // usando promise 
   await Promise.all([ 
   Categoria.destroy({where: {}, TRUNCATE: true}), 
   Precio.destroy({where: {}, TRUNCATE: true}), 
   db.sync({force:true}) 
   ]) 
   console.log('datos eliminados')
    exit() 
   }
    catch (error) {
    console.log(error) 
   exit(1)
    } 
   }



if(process.argv[2]=== "-e"){
    eliminarDatos();
}
