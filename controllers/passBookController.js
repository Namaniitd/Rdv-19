/**
RDV 18 pass system
 */

//***************BOOKING PERIOD CONFIG*****************//

// SEt Whom you are booking passes for
let type = process.env.type;//"external";
const secret = require('../Models/secrets');

let startTime = new Date(process.env.startBook);
let endTime = new Date(process.env.endBook);

let waitlist = false;

let waitlist_pronite = process.env.waitlist_pronite;
let timeGap = parseInt(process.env.timeGap);
let requestTimes = {};

//***************BOOKING PERIOD CONFIG*****************//

let bookPass = module.exports = {};

let utils = require('../utils');
const jwt = require('jsonwebtoken');
const request = require('request');
//let bookMailer = require('../mailers/bookmailer');

let dynamoDB = utils.connectToDB();
let tableName = '2019_RDV_Registrations';
let tableName1 = '2018_Pronite_Reg';

bookPass.book = function (req, res) {
  console.log("req recieved")
  let curTime = new Date();
console.log(req.body);
console.log(req.body);
  if (curTime < startTime)
    return utils.error(res, 400, "Have Patience! Booking hasn't started yet :)");
  if (curTime > endTime)
    return utils.error(res, 400, "Booking Period Over!");

  let token = req.body.token;
  let pronite = req.body.pronite;

  if (!token || !pronite)
    return utils.error(res, 400, "Bad Request");

  console.log(token)
  jwt.verify(token, secret.passbook+parseInt((endTime.getTime()-curTime.getTime())/(1000*60*process.env.slotSize)).toString(), function(err, user) {
    if (err){
      console.log(err)
      return utils.error(res, 401, "Invalid Token");
    }

    let rdvNumber = user.rdv_number;
  console.log(rdvNumber)
  console.log(user)

    if (!req.headers.referer || !req.headers.referer.startsWith(process.env.referer)) {
      console.log('%s: %s is using a script.', utils.logTime(), rdvNumber);
      return utils.error(res, 400, "Something went wrong. Please try again soon.");
    }

    if (requestTimes[rdvNumber] && (curTime - requestTimes[rdvNumber]) < timeGap) {
      console.log('%s: %s made a request too soon.', utils.logTime(), rdvNumber);
      return utils.error(res, 400, "You clicked too soon! Please wait "+timeGap/1000+"s between two requests.");
    }
    requestTimes[rdvNumber] = curTime;

  if(process.env.captcha == "True"){
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      console.log('%s: %s did not have captcha.', utils.logTime(), rdvNumber);
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
        console.log('%s: %s failed captcha.', utils.logTime(), rdvNumber);
        return utils.error(res, 400, "Failed captcha verification");
      }

      getNumPasses(res, pronite, (numPasses) => {
        if (numPasses <= 0 && !waitlist)
          return utils.error(res, 400, "Sorry! All passes have been exhausted for today :(");

      if(numPasses <= process.env.slotPasses*parseInt((endTime.getTime()-curTime.getTime())/(1000*60*process.env.slotSize)))
          return utils.error(res, 400, "Sorry! All passes have been exhausted for current Slot :(");


        dynamoDB.get(params("rdv_number", rdvNumber), function (err, data) {
          if (err) {
            return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
          } else {
            if (!data.Item)
              return utils.error(res, 400, "User Does Not Exist!");
            else
              bookUser(req, res, data.Item, pronite, numPasses);
          }
        });
      });
    });
  }else{
          getNumPasses(res, pronite, (numPasses) => {
        if (numPasses <= 0 && !waitlist)
          return utils.error(res, 400, "Sorry! All passes have been exhausted for today :(");

        if(numPasses <= process.env.slotPasses*parseInt((endTime.getTime()-curTime.getTime())/(1000*60*process.env.slotSize)))
          return utils.error(res, 400, "Sorry! All passes have been exhausted for current Slot :(");

        dynamoDB.get(params("rdv_number", rdvNumber), function (err, data) {
          if (err) {
            return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
          } else {
            if (!data.Item)
              return utils.error(res, 400, "User Does Not Exist!");
            else
              bookUser(req, res, data.Item, pronite, numPasses);
          }
        });
      });
  }


  });

};

// book pass for user
function bookUser(req, res, user, pronite, numPasses) {
  if (user[pronite])
    return utils.error(res, 400, "You've already been processed for this ProNite.");

  let bookString = "Booked";
  let numPass = 1;
// for prof automatically confirms
  if (type === "prof") {
    numPass = req.body.num_passes;

    if (!numPass)
      return utils.error(res, 400, "Bad Request");

    if (user.college !== "IIT Delhi Staff")
      return utils.error(res, 400, "This booking period is only for IIT Delhi Staff and Faculty. You are liable for Disciplinary Action, Good luck buddy and have faith in God!");

    bookString = "Confirmed";
  }

  else if (type === "external") {
    if (user.email.endsWith("@iitd.ac.in"))
      return utils.error(res, 400, "This booking period is only for Non-IITD Students.");
    if (user.email.includes("iitd.ac.in"))
      return utils.error(res, 400, "This booking period is only for Non-IITD Students.");
    if(user.college == "IITD")
      return utils.error(res, 400, "This booking period is only for Non-IITD Students.");

  }

  else {
    if (!user.email.endsWith("@iitd.ac.in") || user.college === "IIT Delhi Staff")
      return utils.error(res, 400, "This booking period is only for IITD Students.");
    if(user.college != "IITD")
      return utils.error(res, 400, "This booking period is only for IITD Students.");
  }

  bookString += " " + numPass;

  if (numPasses - numPass < 0 && !waitlist)
    return utils.error(res, 400, "Sorry! All passes have been exhausted for today :(");

  if (numPasses - numPass < 0) {
    bookString = "Waitlisted";
    numPass = 0;
  }

  updateNumPasses(res, pronite, -numPass, () => {
    let bookParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ConditionExpression: 'attribute_not_exists('+ pronite + ')',
      ExpressionAttributeValues: {
        ':value': bookString
      }
    };

    dynamoDB.update(bookParams, function (err, data) {
      if (err) {
        updateNumPasses(res, pronite, numPass, () => {
          if (err.statusCode >= 500)
            return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
          else
            return utils.error(res, 400, "You've already been processed for this ProNite.");
        })
      } else {
        if (bookString.startsWith("Waitlist")) {
          console.log('%s: %s has been waitlisted for %s.', utils.logTime(), user.email, pronite);
          return res.json({
            error: false,
            message: "You've been waitlisted for this pronite.",
          });
        } else {
          console.log('%s: %s booked a pass for %s. %d left.', utils.logTime(), user.email, pronite, numPasses - numPass);
          return res.json({
            error: false,
            message: "Pass booked succesfully!",
          });
        }
      }
    });
  });
}

bookPass.waitListBook = function (req, res) {
  let curTime = new Date();

  if (curTime < startTime)
    return utils.error(res, 400, "Have Patience! Booking hasn't started yet :)");
  if (curTime > endTime)
    return utils.error(res, 400, "Booking Period Over!");

  let token = req.body.token;
  let pronite = req.body.pronite;

  if (!token || !pronite)
    return utils.error(res, 400, "Bad Request");

  if (pronite !== waitlist_pronite)
    return utils.error(res, 400, "Not booking for this night today!");

  jwt.verify(token, secret.passbook+parseInt((endTime.getTime()-curTime.getTime())/(1000*60*process.env.slotSize)).toString(), function(err, user) {
    if (err)
      return utils.error(res, 401, "Invalid Token");

    let rdvNumber = user.rdv_number;
    // for header checking
    // if (!req.headers.referer || !req.headers.referer.startsWith('http://rdviitd.org/bohogetaway')) {
    //   console.log('%s: %s is using a script.', utils.logTime(), rdvNumber);
    //   return utils.error(res, 400, "Something went wrong. Please try again soon.");
    // }

    if (requestTimes[rdvNumber] && (curTime - requestTimes[rdvNumber]) < timeGap ) {
      console.log('%s: %s made a request too soon.', utils.logTime(), rdvNumber);
      return utils.error(res, 400, "You clicked too soon! Please wait "+timeGap/1000+"s between two requests.");
    }
    requestTimes[rdvNumber] = curTime;

    /*if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      console.log('%s: %s did not have captcha.', utils.logTime(), rdvNumber);
      return utils.error(res, 400, "No captcha");
    }*/

    // Put your secret key here.
    /*var secretKey = "6Lef9DMUAAAAANzX-DCuLu0WWDT4el95-W71thJA";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'];
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
      // Success will be true or false depending upon captcha validation.
      if(body.success !== undefined && !body.success) {
        console.log('%s: %s failed captcha.', utils.logTime(), rdvNumber);
        return utils.error(res, 400, "Failed captcha verification");
      }*/

      getNumPasses(res, pronite, (numPasses) => {
        if (numPasses <= 0)
          return utils.error(res, 400, "Sorry! All passes have been exhausted for today :(");

        dynamoDB.get(params("rdv_number", rdvNumber), function (err, data) {
          if (err) {
            return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
          } else {
            if (!data.Item)
              return utils.error(res, 400, "User Does Not Exist!");
            else
              bookWaitlist(req, res, data.Item, pronite, numPasses);
          }
        });
      });
    });
  //});
};

function bookWaitlist(req, res, user, pronite, numPasses) {
  if (user[pronite] !== "Waitlisted")
    return utils.error(res, 400, "You're not eligble for the Waitlist Booking period.");

  let bookString = "Confirmed 1";
  let numPass = 1;

  if (numPasses - numPass < 0)
    return utils.error(res, 400, "Sorry! All passes have been exhausted for today :(");

  updateNumPasses(res, pronite, -numPass, () => {
    let bookParams = {
      TableName: tableName,
      Key: {
        'rdv_number': user.rdv_number
      },
      UpdateExpression: 'SET ' + pronite + ' = :value',
      ConditionExpression: pronite + ' = :value2',
      ExpressionAttributeValues: {
        ':value': bookString,
        ':value2': "Waitlisted"
      }
    };

    dynamoDB.update(bookParams, function (err, data) {
      if (err) {
        updateNumPasses(res, pronite, numPass, () => {
          if (err.statusCode >= 500)
            return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
          else
            return utils.error(res, 400, "You're not eligble for the Waitlist Booking period.");
        })
      } else {
        console.log('%s: %s confirmed a pass for %s. %d left.', utils.logTime(), user.email, pronite, numPasses - numPass);
        return res.json({
          error: false,
          message: "Pass confirmed succesfully!",
        });
      }
    });
  });
}

// @sunil take it to top
function getNumPasses (res, pronite, cb) {
  let params = {
    TableName: tableName1,
    Key: {
      pronite: pronite
    }
  };
  dynamoDB.get(params, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "Bad Request!");
      else
        cb(data.Item.numPasses);
    }
  });
}

function updateNumPasses (res, pronite, change, cb) {
  let params = {
    TableName: tableName1,
    Key: {
      pronite: pronite
    },
    UpdateExpression: 'SET numPasses = numPasses + :value',
    ExpressionAttributeValues: {
      ':value': change
    }
  };
  dynamoDB.update(params, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
    } else {
      cb();
    }
  });
}

function params (key, id) {
  if (key == 'rdv_number') {
    return {
      TableName: tableName,
      Key: {
        rdv_number: id
      }
    }
  } else {
    return {
      TableName: '2019_RDV_Registrations',
      IndexName: 'email',
      KeyConditionExpression: 'email = :value',
      ExpressionAttributeValues: {
        ':value': id
      }
    }
  }
}