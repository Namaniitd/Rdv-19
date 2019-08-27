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
    			Data: "Greetings!<br>"+ "IIT Delhi is back with another edition of Rendezvous, ‘A Symphony of Nostalgia’ with the journey spanning over 4 days from 13th-16th October. We would like to officially invite you to join us for yet another season of unlimited fun with a myriad of events ranging from Fashion, Dance and Music to Culinary Arts, Adventure and many more.<br><br>" +
    				"Think about the moments of the past, let your memory flow over them like water, let that familiar scent of grass take over as you join us to cherish that feeling- romance with the past, spin it around, take another look at that vintage film in black and white.Come experience the extravaganza!" +
					"<ul><li>Visit: <a href='http://rdv-iitd.com/login'> RDV-login</a> to register with us and earn RDV points. Stand a chance to win pronite passes, exclusive merchandise and much more.</li><br>"+
					"<li>To book your accommodation, go to: <a href='rdv-iitd.com/accommodation'>rdv-iitd.com/accommodation</a></li><br>"+
					"<li>For more updates, follow us on :<br>Facebook: <a href='https://www.facebook.com/rendezvous.iitd/'>https://www.facebook.com/rendezvous.iitd/</a><br>"+
					"Instagram: <a href='https://www.instagram.com/rendezvous.iitdelhi/'> https://www.instagram.com/rendezvous.iitdelhi/</a><br></li><br>"+
					"See you there!"   +
					'<p><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/rdv-logo.png" alt="" height="60px" align="left" /> <strong>Rendezvous 2018 | IIT Delhi</strong><br />North India\'s Largest Cultural Fest<br />' +
          			'<a href="https://www.facebook.com/rendezvous.iitd"><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/svg/facebook.png" alt="" height="15px" /></a> ' +
          			'<a href="https://twitter.com/theRDVstory"><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/svg/twitter.png" alt="" height="15px" /></a> ' +
          			'<a href="https://www.instagram.com/rendezvous.iitdelhi"><img src="https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/svg/instagram.png" alt="" height="15px" /></a></p>',		
    			},
    	},
    	Subject:{
    		Data: "Invitation to Rendezvous '18 - A Symphony of Nostalgia"
    	}
	},Source : "Rendezvous Registration \<registration@rdv-iitd.com\>", 
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