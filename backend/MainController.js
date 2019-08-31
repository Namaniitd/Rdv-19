let utils = require('./utils');
let dynamoDB = utils.connectToDB();
const jwt = require('jsonwebtoken');
const secret =  require('./secrets');
const request = require("request");

module.exports = {
	home:home,
	login:login,
	events:events,
	team:team,
	accommodation:accommodation,
	coming:coming,
	form:form,
	dance:dance,
	dramatics:dramatics,
	debating:debating,
	pfc:pfc,
	facc:facc,
	literary:literary,
	adventure:adventure,
	comedy:comedy,
	culinary:culinary,
	glamour:glamour,
	hindisamiti:hindisamiti,
	magic:magic,
	music:music,
	quizzing:quizzing,
	spicmacay:spicmacay,
	talent:talent,
	deb:deb,
	proniteLogin:proniteLogin,
	proniteLoginPost:proniteLoginPost,
	pronitePassbook:pronitePassbook,
	proniteConfirm:proniteConfirm,
	passFac:passFac,
	passFac1:passFac1,
	sponsors:sponsors
}


//==========================================================
//========== get request handling==========================
//==========================================================
function deb(req,res){
	console.log("event hit");
	console.log(req.body);
	console.log(req.query)
	 res.json({"hi":"yoyoy"});
}

function home(req,res){
	res.render('index.ejs', {
	});
}
function login(req,res){
	res.render('login/login.ejs', {
	});
}
function team(req,res){
	res.render('team/team.ejs', {
	});
}
function events(req,res){
	res.render('compevents/events.ejs', {
	});
}

function dance(req,res){
	res.render('compevents/Dance/dance.ejs', {
	});
}
function dramatics(req,res){
	res.render('compevents/Dramatics/dramatics.ejs', {
	});
}
function debating(req,res){
	res.render('compevents/Debating/debating.ejs', {
	});
}
function pfc(req,res){
	res.render('compevents/PFC/pfc.ejs', {
	});
}
function facc(req,res){
	res.render('compevents/FACC/facc.ejs', {
	});
}
function literary(req,res){
	res.render('compevents/Literary/literary.ejs', {
	});
}
function adventure(req,res){
	res.render('compevents/Adventure/adventure.ejs', {
	});
}
function comedy(req,res){
	res.render('compevents/Comedy/comedy.ejs', {
	});
}
function culinary(req,res){
	res.render('compevents/Culinary/culinary.ejs', {
	});
}
function glamour(req,res){
	res.render('compevents/Glamour/glamour.ejs', {
	});
}
function hindisamiti(req,res){
	res.render('compevents/HindiSamiti/hindisamiti.ejs', {
	});
}
function magic(req,res){
	res.render('compevents/Magic/magic.ejs', {
	});
}
function music(req,res){
	res.render('compevents/Music/music.ejs', {
	});
}
function quizzing(req,res){
	res.render('compevents/Quizzing/quizzing.ejs', {
	});
}
function spicmacay(req,res){
	res.render('compevents/SpicMacay/spicmacay.ejs', {
	});
}
function talent(req,res){
	res.render('compevents/Talent/talent.ejs', {
	});
}

function accommodation(req,res){
    res.render('accomodation/accomodation.ejs', {
    });
}
function coming(req,res){
	res.render('coming/coming.ejs', {
	});
}
function sponsors(req,res){
	res.render('sponsors/sponsors.ejs',{
	});
}

function form(req,res){
	console.log(req.body);
	console.log(req.params)
	console.log("------------\n");
	res.json({"hi":"yoyoy"});
}


function proniteLogin(req,res){
	res.render('passbooksystem/Passbook_login/index.ejs',{
		captcha: process.env.captcha,
		gCaptcha: process.env.gCaptcha
	});
}

function params(key, id) {
  if (key == 'rdv_number') {
    return {
      TableName: '2019_RDV_Registrations',
      Key: {
        rdv_number: id,
      },
    }
  } else {
    return {
      TableName: '2019_RDV_Registrations',
      IndexName: 'email',
      KeyConditionExpression: 'email = :value',
      ExpressionAttributeValues: {
        ':value': id,
      },
    }
  }
}

function proniteLoginPost(req,res){
console.log("in login")
	console.log(req.body);

	const loginID = req.body.login_id;
	const password = req.body.password;
	const token = req.body.token;
	let endTime = new Date(process.env.endBook);
	let curTime = new Date();
	if(token){
		var s = parseInt((endTime.getTime()-curTime.getTime())/(1000*60*process.env.slotSize)).toString();
		console.log(s)
		jwt.verify(token,secret.passbook,function(err,user){
			if(err)
				return utils.error(res,401,"Invalid Pronite token");
			dynamoDB.get(params("rdv_number",user.rdv_number),(err,data)=>{
				if(err)
					return utils.error(res,500,"Internal Server Error");
				else{
					if(!data.Item)
						return utils.error(res,401,"Invalid Rdv Number");
					delete data.Item['password'];
					delete data.Item['contact_number'];
					delete data.Item['registered_events'];
					const token = generateTokenPronite(data.Item);
					return res.json({
						user:data.Item,
						token:token
					})
				}
			})
		})
	}
	else{
		let curTime = new Date();
		let startTime = new Date(process.env.startBook);

		  if (curTime < startTime)
	    return utils.error(res, 400, "Have Patience! Booking hasn't started yet :)");

		if (!loginID || !password)
		  return utils.error(res, 401, "Login ID or Password is empty");

		    // captcha
		    console.log("captch check");
		    console.log(process.env.captcha)


		if(process.env.captcha == "True"){
			console.log(" probs here");
		    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
		      console.log('%s: %s did not have captcha.', utils.logTime(), loginID);
		      return utils.error(res, 400, "No captcha");
		    }
		    // Put your secret key here.
		    var secretKey = process.env.gCaptchaSite;
		    // req.connection.remoteAddress will provide IP address of connected user.
		    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'];
		    // Hitting GET request to the URL, Google will respond with success or error scenario.
		    request(verificationUrl,function(error,response,body) {
		    	body = JSON.parse(body);
			    // Success will be true or false depending upon captcha validation.
			    if(body.success !== undefined && !body.success) {
			    	console.log('%s: %s failed captcha.', utils.logTime(), loginID);
			    	return utils.error(res, 400, "Failed captcha verification");
			    }
		    console.log("captcha cleared")
			dynamoDB.query(params("email", loginID.toLowerCase()), function (err, data) {
			  if (err) {
				// console.log(err)
				return utils.error(res, 500, "Internal Server Error");
			  }
			  else {
				if (data.Items.length === 0) {
				  return utils.error(res, 401, "User Not Found");
				} else {
				  let user = data.Items[0];
				  // console.log(user);
				  if (user.password !== password){
					return utils.error(res, 401, "Password Incorrect");
				  }
				  delete user.password;
				  delete user.dob;
				  delete user.contact_number;
				  delete user.registered_events;



				  const token = generateTokenPronite(user);
				  // console.log("token is :")
				  // console.log(token)
				  return res.json({
					user: user,
					token: token,
				  })
				}
			  }
			})

			});
		}else{
			dynamoDB.query(params("email", loginID.toLowerCase()), function (err, data) {
			  if (err) {
				// console.log(err)
				return utils.error(res, 500, "Internal Server Error");
			  }
			  else {
				if (data.Items.length === 0) {
				  return utils.error(res, 401, "User Not Found");
				} else {
				  let user = data.Items[0];
				  // console.log(user);
				  if (user.password !== password){
					return utils.error(res, 401, "Password Incorrect");
				  }
				  delete user.password;
				  delete user.dob;
				  delete user.contact_number;
				  delete user.registered_events;


				  const token = generateTokenPronite(user);
				  // console.log("token is :")
				  // console.log(token)
				  return res.json({
					user: user,
					token: token,
				  })
				}
			  }
			})
		}
	}
}

function pronitePassbook(req,res){
	res.render('passbooksystem/Passbook_window/index.ejs',{
		captcha: process.env.captcha,
		type : process.env.type,
		gCaptcha: process.env.gCaptcha

	});
}

function proniteConfirm(req,res){
	res.render('passbooksystem/Passbook_confirm/index.ejs',{
	});
}

function passFac(req,res){
	res.render('passbooksystem/Passbook_faculty/index.ejs',{

	});
}

function passFac1(req,res){
	console.log(req.body)
	res.json({});
}

function generateTokenPronite(user) {
  //1. Dont use password and other sensitive fields
  //2. Use fields that are useful in other parts of the
  //app/collections/models
  var u = {
    rdv_number: user.rdv_number
  };
  // expires in 30 days

  var token = jwt.sign(u, secret.passbook, {
    expiresIn: 60 * 60 * 24
  });
  // console.log(secret.passbook)
  // jwt.verify(token,secret.passbook,function(err,user){
  // 	if(err)
  // 		console.log(err)
  // 	console.log(user);
  // })

  return token
}
