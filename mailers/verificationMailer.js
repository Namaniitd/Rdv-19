/**
 * RDV Mailer
 */
const AWS = require('aws-sdk');
const utils = require('../utils');
const SES = new AWS.SES({
  accessKeyId: "AKIAIMEEAD3XNEOEMZZQ",
  secretAccessKey: "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",
  region: "us-west-2",
  endpoint: new AWS.Endpoint('https://email.us-west-2.amazonaws.com')
});

function sendMail(email, name, otp) {
  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: {
          Data: 'Hey ' + name + ', <br/><br/>Thanks for your interest in Rendezvous! ' +
          'The OTP for completing your registration process is: <b>' + otp + '</b>. ' +
          'Hope you have a great RDV! :) <br/><br/>Regards,<br/>Team Rendezvous',
        },
      },
      Subject: {
        Data: "OTP for Rendezvous Registration!"
      }
    },
    Source: "Rendezvous Verification \<verification@rdviitd.org\>",
  };
  SES.sendEmail(params, function (err, data) {
    if (err) {
      console.log('%s: SES error in sending OTP to %s', utils.logTime(), email);
      setTimeout(function() {
        sendMail(email, name, otp);
      }, 300);
    }
    else
      console.log('%s: OTP sent to %s', utils.logTime(), email);
  });
}

module.exports = {
  sendMail: sendMail,
};