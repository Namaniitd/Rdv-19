/**
 * Created by Sunil Kumar
 */
const AWS = require('aws-sdk');
const utils = require('../utils');
const SES = new AWS.SES({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: "us-west-2",
  endpoint: new AWS.Endpoint('https://email.us-west-2.amazonaws.com')
});
var count = 0;
function sendMail(email) {
	// body...
	const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
		Body: {
    		Html: {
    			Data: "Greetings!<br>"+ "IIT Delhi is back with another edition of Rendezvous, ‘A Mystical Odyssey’ with the journey spanning over 4 days from 2nd-5th October. We would like to officially invite you to join us for yet another season of unlimited fun with a myriad of events ranging from Fashion, Dance and Music to Culinary Arts, Adventure and many more.<br><br>" +
    				"Think about the moments of the past, let your memory flow over them like water, let that familiar scent of grass take over as you join us to cherish that feeling- romance with the past, spin it around, take another look at that vintage film in black and white.Come experience the extravaganza!" +
					"<ul><li>Visit: <a href='https://rdviitd.org/login'> RDV-login</a> to register with us and earn RDV points. Stand a chance to win pronite passes, exclusive merchandise and much more.</li><br>"+
					"<li>To book your accommodation, go to: <a href='https://rdviitd.org/accommodation'>rdviitd.org/accommodation</a></li><br>"+
					"<li>For more updates, follow us on :<br>Facebook: <a href='https://www.facebook.com/rendezvous.iitd/'>https://www.facebook.com/rendezvous.iitd/</a><br>"+
					"Instagram: <a href='https://www.instagram.com/rendezvous.iitd/'> https://www.instagram.com/rendezvous.iitd/</a><br></li><br>"+
					"See you there!"   +
					'<p><img src="https://assets.rdviitd.org/logos/rendezvous.png" alt="" height="60px" align="left" /> <strong>Rendezvous 2019 | IIT Delhi</strong><br />North India\'s Largest Cultural Fest<br />' +
          			'<a href="https://www.facebook.com/rendezvous.iitd"><img src="https://assets.rdviitd.org/logos/fb.svg" alt="" height="15px" /></a> ' +
          			'<a href="https://www.instagram.com/rendezvous.iitd"><img src="https://assets.rdviitd.org/logos/insta.svg" alt="" height="15px" /></a></p>',
    			},
    	},
    	Subject:{
    		Data: "Invitation to Rendezvous '19 - A Mystical Odyssey"
    	}
	},Source : "Rendezvous Registration \<registration@rdviitd.org\>",
	};

	SES.sendEmail(params, function (err, data) {
    if (err) {
    	console.log("failed")
    	console.log(err)
      setTimeout(function() {
        sendMail(email);
      }, 300);
    }
    else{
    	count+=1;
      console.log('%s: Ruddu Mailer sent to %s   %s', utils.logTime(),email,count);
  	}
  });
}



module.exports = {
  sendMail: sendMail,
};
