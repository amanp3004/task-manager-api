const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email,name)=>{
    const greet = {
        from : 'pandeyaman5570@gmail.com',
        to : email,
        subject : `Greetings ${name}`,
        text : 'Thank you for choosing us!! We hope you enjoy our services and we are cherished by seeing you becoming the integral part of our family'
      }
      sgMail.send(greet).then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      });
}

const sendLeavingMail = (email,name)=>{
    const leave = {
        from : 'pandeyaman5570@gmail.com',
        to : email,
        subject : `Please ${name} undergo a survey`,
        text : 'We aint happy seeing you leaving us. Please write to us for feedback so that we can improve our services for you next time. Waiting to see you soon'
      }
      sgMail.send(leave).then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      });
}

module.exports ={
    sendWelcomeMail,
    sendLeavingMail
}
  
  

    

