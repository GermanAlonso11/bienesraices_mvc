import bcrypt from 'bcrypt';

const usuarios = [
    {
        nombre: 'german',
        email: 'german@german.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios