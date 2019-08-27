/**
 * Forgot password mailer for RDV
 * Sunil Kumar
 */
var AWS = require('aws-sdk');
const utils = require('../utils');
var SES = new AWS.SES({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: "us-west-2",
  endpoint: new AWS.Endpoint('https://email.us-west-2.amazonaws.com')
});

function sendMail(email, name, rdvNumber, password) {
  console.log(email+" "+name+" "+" "+rdvNumber+" "+password)
  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: {
          Data: 'Hey ' + name + ', <br/><br/>We have successfully changed your password! <br/>' +
          'Your new details are: <br/> RDV Number: <b>'+rdvNumber+'</b><br/> Password: <b>'+password+
          '</b><br/><br/> Hope you have a great RDV! :) <br/><br/>Regards,<br/>Team Rendezvous.',
        },
      },
      Subject: {
        Data: "Password Changed for Rendezvous Account"
      }
    },
    Source: "Rendezvous Password \<support@rdviitd.org\>",
  };
  SES.sendEmail(params, function (err, data) {
    if (err) {
      setTimeout(function() {
        sendMail(email, name, otp);
      }, 300);
    }
    else
      console.log('%s: Password change for %s', utils.logTime(), email);
  });
}

module.exports = {
  sendMail: sendMail,
};