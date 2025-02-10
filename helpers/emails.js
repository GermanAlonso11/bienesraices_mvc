import nodemailer from 'nodemailer'

const emailRegistro = async(datos) => {
    // Looking to send emails in production? Check out our Email API/SMTP product!
const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const {email, nombre, token} = datos
  //Enviar email
  await transport.sendMail({
    from: 'BienesRaices.com',
    to: email,
    subject: 'Confirma tu cuenta en BienesRaices.com',
    text: 'Confirma tu cuenta en BienesRaices.com',
    html: `
    <p>Hola ${nombre}, comprueba tu cuenta en bienesraices.com</p>
    <p>Tu cuenta esta lista, solo debes confirmarla en el siguiente enlace</p>
    <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token} ">Confirmar cuenta</a>
    <p>Si usted no creo esta cuenta, puede ignorar este mensaje</p>
    `
  })

}

const emailOlvidePassword = async(datos) => {
  // Looking to send emails in production? Check out our Email API/SMTP product!
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const {email, nombre, token} = datos
//Enviar email
await transport.sendMail({
  from: 'BienesRaices.com',
  to: email,
  subject: 'Restablece tu Password en BienesRaices.com',
  text: 'Restablece tu Password en BienesRaices.com',
  html: `
  <p>Hola ${nombre}, solicitaste restablecer tu password en bienesraices.com</p>
  <p>Sigue al siguiente link para generar un nuevo password</p>
  <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/recuperarpassword/${token} ">Restablecer password </a>
  <p>Si usted no solicito este cambio de password, puede ignorar este mensaje</p>
  `
})

}


export {
    emailRegistro, emailOlvidePassword
}