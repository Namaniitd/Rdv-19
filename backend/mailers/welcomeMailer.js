/**
 * RDV Mailer
 */
const AWS = require('aws-sdk');
const utils = require('../../utils');
const SES = new AWS.SES({
  accessKeyId: "AKIAIMEEAD3XNEOEMZZQ",
  secretAccessKey: "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",
  region: "us-west-2",
  endpoint: new AWS.Endpoint('https://email.us-west-2.amazonaws.com')
});

function sendMail(email, name, rdv_number) {
  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: {
          Data: '<p>Greetings ' + name + ', <br /><br /> Congratulations! You have successfully registered for Rendezvous 2018. Your RDV Number is <strong>' + rdv_number + '</strong>.<br /><br /><strong>Please Note - Your RDV Number is also your Referral Code.</strong><br /><br /></p>' +
          '<p><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/rdv-logo.png" alt="" height="60px" align="left" /> <strong>Rendezvous 2018 | IIT Delhi</strong><br />North India\'s Largest Cultural Fest<br />' +
          '<a href="https://www.facebook.com/rendezvous.iitd"><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/svg/facebook.png" alt="" height="15px" /></a> ' +
          '<a href="https://twitter.com/theRDVstory"><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/svg/twitter.png" alt="" height="15px" /></a> ' +
          '<a href="https://www.instagram.com/rendezvous.iitdelhi"><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/svg/instagram.png" alt="" height="15px" /></a></p>',
        },
      },
      Subject: {
        Data: "Welcome to Rendezvous!"
      }
    },
    Source: "Rendezvous Registration \<registration@rdv-iitd.com\>",
  };
  SES.sendEmail(params, function (err, data) {
    if (err) {
      setTimeout(function() {
        sendMail(email, name, rdv_number);
      }, 300);
    }
    else
      console.log('%s: Welcome Mailer sent to %s', utils.logTime(), email);
  });
}

module.exports = {
  sendMail: sendMail,
};