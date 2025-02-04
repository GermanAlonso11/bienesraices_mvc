import express from "express";
import { formLogin, formRegister, formRecuperarPassword, registrar, confirmar, resetPassword } from '../controllers/usuarioController.js';

const router = express.Router();

//Routing
router.get('/login', formLogin);

router.get('/registro', formRegister)
router.post('/registro', registrar)

//olvide-password
router.get('/recuperarpassword', formRecuperarPassword)

// router.post('/nosotros', (req, res) =>{
//     res.json({msg: 'Respuesta de Tipo Post'})
// })

//Confirmar cuenta
router.get('/confirmar/:token', confirmar)

//Reset password
router.post('/recuperarpassword', resetPassword)

export default router