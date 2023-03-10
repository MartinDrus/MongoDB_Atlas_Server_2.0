import nodemailer from 'nodemailer';

let transporter;

export async function startMailService(){
    transporter = nodemailer.createTransport({
        host: "smtp.ionos.de",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.EMAIL_SENDER_PW
        },
      });
    
    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
        }
    });
}


function sendVerificationEmail(userEmail, verificationToken) {
    let mailOptions = {
        from: 'noreply@martindrus.de',
        to: userEmail,
        subject: 'Please verify your email',
        html: `<p>Please click on the following link to verify your email: <a href="http://localhost:4444/auth/verify-email?t=${verificationToken}" target="_blank">Verify Email</a></p>`
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

export default sendVerificationEmail; 