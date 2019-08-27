/**
 * Created by Sunil Kumar
 */
const AWS = require('aws-sdk');
const utils = require('../utils');
const SES = new AWS.SES({
  accessKeyId: "AKIAIMEEAD3XNEOEMZZQ",
  secretAccessKey: "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",
  region: "us-west-2",
  endpoint: new AWS.Endpoint('https://email.us-west-2.amazonaws.com')
});


function sendMail(member, password) {
  const params = {
    Destination: {
      ToAddresses: [member.email]
    },
    Message: {
      Body: {
        Html: {
          Data: 'Hey ' + member.name + ', <br/><br/>Congratulations on being selected as the <b>' + member.designation +
        '</b> for Rendezvous! You can access your admin account at http://rdviitd.org/admin with the following credentials.' +
        '<br/><br/><p style="text-indent: 6em;margin: 0;padding: 0"><b>Username:</b> ' + member.email + '</p>' +
        '<p style="text-indent: 6em;margin: 0;padding: 0"><b>Password:</b> ' + password + '</p><br/>' +
        'You\'re recommended to change your password after logging in. ' +
        'Best of luck and have a great RDV! :) <br/><br/>Regards,<br/>Rendezvous Web Admin',
      },
    },Subject: {
        Data: "Hello from Rendezvous Admin Portal!"
      }
    },Source: "Rendezvous Registration \<admin@rdviitd.org\>",
  };
SES.sendEmail(params, function (err, data) {
    if (err) {
      setTimeout(function() {
        sendMail(member,password);
      }, 300);
    }
    else
      console.log('%s: Welcome Mailer sent to %s', utils.logTime(), member.email);
  });
}


module.exports = {
  sendMail: sendMail,
};