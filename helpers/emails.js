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
    <p>Si usted no creo esta cuenta, puede crear este mensaje</p>
    `
  })

}


export {
    emailRegistro
}