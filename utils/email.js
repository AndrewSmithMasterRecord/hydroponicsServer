const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) Create the transporter
  // const transpoter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASSWORD
  //   }
  //   //Activate "less secure app" option
  // })
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) Define the email options
  const emailOptions = {
    from: 'Mr. Smith <smith@mail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //3)Send email
  await transport.sendMail(emailOptions);
};

module.exports = sendEmail;
