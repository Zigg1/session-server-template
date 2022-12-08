import nodemailer from 'nodemailer';

export default function sendEmail(email:string, userId:string, token:string){
  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
  });

  const verifyLink: string = `${process.env.SITE_URL}/api/verifyemail/${userId}/${token}`;
  const mailOptions={
    to: email,
    subject: "Please confirm your Email account",
    html: `<html>
      <body>
        <p>please visit this link to verify your account</p>
        <link>${verifyLink}</link.>
      </body>`
  }

  smtpTransport.sendMail(mailOptions, err=>{
    if(err){
      console.log(err);
    }else{
      console.log("verification email sent");
    }
  });
}