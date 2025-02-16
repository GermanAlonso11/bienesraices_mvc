import Propiedad from './Propiedad.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'

//Precio.hasOne(Propiedad)

Propiedad.belongsTo(Precio)
Propiedad.belongsTo(Categoria, {foreignKey: 'FK_categoriaId'})
Propiedad.belongsTo(Usuario, {foreignKey: 'FK_usuarioId'})

export { 
    Propiedad, 
    Precio, 
    Categoria, 
    Usuario 
};
