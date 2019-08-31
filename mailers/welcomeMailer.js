/**
 * RDV Mailer
 */
const AWS = require('aws-sdk');
const utils = require('../utils');
const SES = new AWS.SES({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
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
          Data: '<p>Greetings ' + name + ', <br /><br /> Congratulations! You have successfully registered for Rendezvous 2019. Your RDV Number is <strong>' + rdv_number + '</strong>.<br /><br /><strong>Please Note - Your RDV Number is also your Referral Code.</strong><br /><br />Some tips to help you live Rendezvous to the fullest:</p><ul><li>Take a screenshot of this email, and use your RDV Number to register for 200+ events at Rendezvous to earn RDV Points. You can redeem these points at the various food stalls at Rendezvous.</li><li>If you haven\'t already, please Like our <a href="https://www.facebook.com/rendezvous.iitd" rel="noreferrer noreferrer" target="_blank">Facebook page</a> and follow us on <a href="https://www.instagram.com/rendezvous.iitd" target="_blank">Instagram page</a> for useful info and to stay updated about all our events during your time at Rendezvous.</li><li>Bookmark our <a href="http://www.rdviitd.org" rel="noreferrer noreferrer" target="_blank">Website</a> - find event details, registration forms and venues in a jiffy.</li></ul>' +
          '<p><br><strong>You\'ll need to show your College ID cards to the security personnel at Rendezvous. Please keep it available with you at all times.</strong><br> We hope to see you at the most exciting edition of the fest so far!<br><br> Thanks & Regards,</p>'+
          '<p><img src="https://assets.rdviitd.org/logos/rendezvous.png" alt="" height="60px" align="left" /> <strong>Rendezvous 2019 | IIT Delhi</strong><br />North India\'s Largest Cultural Fest<br />' +
          '<a href="https://www.facebook.com/rendezvous.iitd"><img src="https://assets.rdviitd.org/logos/fb.svg" alt="" height="15px" /></a> ' +
          '<a href="https://www.instagram.com/rendezvous.iitd"><img src="https://assets.rdviitd.org/lgoos/insta.svg" alt="" height="15px" /></a></p>',
        },
      },
      Subject: {
        Data: "Welcome to Rendezvous!"
      }
    },
    Source: "Rendezvous Registration \<registration@rdviitd.org\>",
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
