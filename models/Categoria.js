import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Categoria = db.define('categorias', { 
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
})

export default Categoria
