const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



function sendEmail(subject, text) {
    console.log(subject);
    console.log(text);
    console.log(123);
    const mailOptions = {
        from: 'ekankm2@gmail.com',
        to: 'ekankmaheshwari.211it019@nitk.edu.in',
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
}



module.exports = {
    sendEmail,
};