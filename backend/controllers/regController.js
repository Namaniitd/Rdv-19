/**
Karan and Sunil
 */




const utils = require('../utils');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const request = require('request');
const secret = require('../secrets');
// Db settings
const dynamoDB = utils.connectToDB();
const tableName = '2019_RDV_Registrations';

const verificationMailer = require('../mailers/verificationMailer');
const welcomeMailer = require('../mailers/welcomeMailer');
const forgotPasswordMailer = require('../mailers/forgotPasswordMailer');
const generator = require('generate-password');


// get all registrations
function getRegistrations(req, res) {
  onRegScan(res, [], null, 0, function (registrations) {
    console.log(registrations)
    return res.json({
      registrations: registrations,
    })
  })
}

// returns array of registration
// gives rdvNumber,email,firstname,lastname,college ,number,gender,reqTiem,points
function onRegScan(res, registrations, lastEvaluatedKey, num, cb) {
  let params = {
    TableName: tableName,
    AttributesToGet: [
      'rdv_number',
      'email',
      'first_name',
      'last_name',
      'college',
      'contact_number',
      'gender',
      'reg_time',
      'rdv_points',
    ],
  };
  if (!lastEvaluatedKey && num != 0)
    cb(registrations);
  else {
    if (lastEvaluatedKey)
      params.ExclusiveStartKey = lastEvaluatedKey;
    dynamoDB.scan(params, function (err, data) {
      if (err)
        return utils.error(res, 500, "Internal Server Error");
      else {
        registrations = registrations.concat(data.Items);
        onRegScan(res, registrations, data.LastEvaluatedKey, num+1, cb);
      }
    })
  }
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

function register(req, res) {
  const user = req.body;
  if (!user)
    return utils.error(res, 400, "Invalid Data");
  if (!user.email)
    return utils.error(res, 400, "Please enter Email Address");

  user.email = user.email.toLowerCase();
  if (!user.email.match(/^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)) {
    console.log('%s: Invalid email entered - %s', utils.logTime(), user.email);
    return utils.error(res, 400, "Please enter a valid Email Address");
  }
  if (!user.first_name)
    return utils.error(res, 400, "Please enter First Name");
  if (!user.first_name.match(/^[A-Za-z ]+$/))
    return utils.error(res, 400, "Name cannot contain Special Characters");
  if (!user.last_name)
    return utils.error(res, 400, "Please enter Last Name");
  if (!user.last_name.match(/^[A-Za-z ]+$/))
    return utils.error(res, 400, "Name cannot contain Special Characters");
  if (!user.password)
    return utils.error(res, 400, "Please enter Password");

  const secretKey = secret.clever;
  const email = user.email;
  const generatedOTP = crypto.createHash('md5').update(email + secretKey).digest('hex').substring(0,6);

  if (!user.otp) {
    const name = user.first_name + " " + user.last_name;
    verificationMailer.sendMail(email, name, generatedOTP);
    return utils.error(res, 401, "Email Verification Required");
  }
  if (user.otp != generatedOTP)
    return utils.error(res, 401, "Incorrect OTP");
  delete user.otp;

  delete user.dhoom;
  delete user.spectrum;
  delete user.melange;
  delete user.kaleidoscope;

  const queryParams = {
    TableName: '2019_RDV_Registrations',
    IndexName: 'email',
    KeyConditionExpression: 'email = :value',
    ExpressionAttributeValues: {
      ':value': user.email,
    },
  };
  if(user.referral_code == ''){
    delete user.referral_code;
  }
// console.log("--- line 143");
  dynamoDB.query(queryParams, function (err, data) {
    if (err) {
      console.log(err)
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (data.Items.length !== 0)
        return utils.error(res, 400, "Member with Email Address already exists");
      else {
        if (!user.referral_code)
          addUser(res, user, 200);
        else if (user.referral_code.match(/^RDV[a-z0-9]{5}$/)) {
          const secretKey2 = secret.referal;
          const code = 'RDV' + crypto.createHash('md5').update(email + secretKey2).digest('hex').substring(0,5);
          if (code === user.referral_code)
            addUser(res, user, 400);
          else
            return utils.error(res, 400, "Invalid Referral Code");
        }
        else if (user.referral_code.match(/^RDV[A-Z]{2}[0-9]{5}$/)) {
          let refParams = {
            TableName: tableName,
            Key: {
              'rdv_number': user.referral_code,
            },
            ConditionExpression: 'attribute_exists(rdv_number)',
            UpdateExpression: 'SET rdv_points = rdv_points + :value',
            ExpressionAttributeValues: {
              ':value': 100,
            },
          };
          dynamoDB.update(refParams, function (err, data) {
            if (err) {
              return utils.error(res, 400, "Invalid Referral Code");
            } else {
              delete user.referral_code;
              addUser(res, user, 200);
            }
          });
        }
        else
          return utils.error(res, 400, "Invalid Referral Code");
      }
    }
  })
}

function addUser(res, user, rdv_points) {
  //console.log("--- in add user ---")
  user.rdv_number = generateRDVNumber(user.first_name, user.last_name);
  user.registered_events = [{id: "rdv19", name: "Rendezvous"}];
  user.reg_time = (new Date()).toString();
  user.rdv_points = rdv_points;
  const addParams = {
    TableName: tableName,
    Item: user,
    ConditionExpression: 'attribute_not_exists(rdv_number)',
  };
console.log(addParams);
  dynamoDB.put(addParams, function (err, data) {
    if (err) {
      // console.log("in 204");
      // console.log(err)
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        addUser(res, user, rdv_points);
    } else {
      welcomeMailer.sendMail(user.email, user.first_name + " " + user.last_name, user.rdv_number);
      delete user.password;
      const token = utils.generateTokenRDV(user);
      // console.log("---updated user ----")
      return res.json({
        user: user,
        token: token,
      });
    }
  })
}

function login(req, res) {
  const loginID = req.body.login_id;
  const password = req.body.password;
  const token = req.body.token || req.query.token;
  console.log(req.body);
  if (token) {
    jwt.verify(token, secret.encry, function(err, user) {
      if (err){
        console.log(err);
        console.log(token)
        return utils.error(res, 401, "Invalid Token");
      }
      console.log(user)
      dynamoDB.get(params("rdv_number", user.rdv_number), function (err, data) {
        if (err) {
          console.log(err)
          return utils.error(res, 500, "Internal Server Error in db");
        } else {
          if (!data.Item)
            return utils.error(res, 401, "Invalid Token");
          delete data.Item['password'];
          const token = utils.generateTokenRDV(data.Item);
          return res.json({
            user: data.Item,
            token: token,
          })
        }
      })
    });
  } else {
    // console.log(req.body)
    if (!loginID || !password)
      return utils.error(res, 401, "Login ID or Password is empty");
    dynamoDB.query(params("email", loginID.toLowerCase()), function (err, data) {
      if (err) {
        console.log(err)
        return utils.error(res, 500, "Internal Server Error");
      } else {
        if (data.Items.length === 0) {
          dynamoDB.get(params("rdv_number", loginID), function (err, data) {
            if (err) {
              console.log(err)
              return utils.error(res, 500, "Internal Server Error");
            } else {
              if (!data.Item)
                return utils.error(res, 401, "User Not Found");
              if (data.Item.password !== password){
                console.log("password sent : "+data.Item.password)
                console.log("actual password : "+password)
                return utils.error(res, 401, "Password Incorrect");
              }
              delete data.Item['password'];
              const token = utils.generateTokenRDV(data.Item);
              return res.json({
                user: data.Item,
                token: token,
              })
            }
          })
        } else {
          let user = data.Items[0];
          console.log(user);
          if (user.password !== password){
                console.log("password sent : "+user.password)
                console.log("actual password : "+password)
            return utils.error(res, 401, "Password Incorrect");
          }
          delete user.password;
          const token = utils.generateTokenRDV(user);
          return res.json({
            user: user,
            token: token,
          })
        }
      }
    })
  }
}

function getRegCount(req, res) {
   // return res.json({count:1});
   // console.log("ho")
  getCount(res, 0, null, 0, function (regCount) {
     console.log(regCount);
    return res.json({count: regCount});
  });
}

function getCount(res, regCount, lastEvaluatedKey, num, cb) {
  let params = {
    TableName: tableName,
    Select: 'COUNT',
  };
  if (!lastEvaluatedKey && num != 0)
     cb(regCount);
  else {
    params.ExclusiveStartKey = lastEvaluatedKey;
     // console.log(params)
    dynamoDB.scan(params, function (err, data) {
      if (err) {
        // throw err
        // console.log(err )
        return utils.error(res, 500, "Internal Server Error");
      } else {
        getCount(res, regCount + data.Count, data.LastEvaluatedKey, num + 1, cb);
      }
    })
  }
}

function generateRDVNumber(firstName, lastName) {
  let rdvNumber = "RDV" + firstName[0].toUpperCase() + lastName[0].toUpperCase();
  let possible = "0123456789";

  for (let i = 0; i < 5; i++)
    rdvNumber += possible.charAt(Math.floor(Math.random() * possible.length));

  return rdvNumber;
}

function forgotPassword(req, res) {
  const user = req.body;
  if (!user)
    return utils.error(res, 400, "Invalid Data");
  if (!user.email)
    return utils.error(res, 400, "Please enter Email Address");

  const password = generator.generate({length: 10, numbers: true});
  const hashPassword = crypto.createHash('md5').update(password).digest('hex')

  const queryParams = {
    TableName: '2019_RDV_Registrations',
    IndexName: 'email',
    KeyConditionExpression: 'email = :value',
    ExpressionAttributeValues: {
      ':value': user.email,
    },
  };

  dynamoDB.query(queryParams, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (data.Items.length == 0)
        return utils.error(res,400, "Member with the given Email Address does not exist")
      else {
        const existing_user = data.Items[0];
        // console.log(existing_user);
        let refParams = {
          TableName: tableName,
          Key: {
            'rdv_number': existing_user.rdv_number,
          },
          ConditionExpression: 'attribute_exists(rdv_number)',
          UpdateExpression: 'SET password = :value',
          ExpressionAttributeValues: {
            ':value': hashPassword,
          },
        };
        dynamoDB.update(refParams, function (err, data) {
          if (err) {
            console.log(err);
            return utils.error(res, 400, "Invalid email address given");
          } else {
            forgotPasswordMailer.sendMail(existing_user.email.toLowerCase(), existing_user.first_name + " " + existing_user.last_name, existing_user.rdv_number, password);
            return res.json({
              message: "Success! New password send to your mail id",
            });
          }
        });
      }
    }
  });
}

function changePassword (req, res) {
  if (req.headers.origin !== 'http://brca.iitd.ac.in') {
    return utils.error(res, 400, "Invalid usage of API");
  }
  const secretKey2 = "anb3jB@#JEBH";
  const email = req.body.email;
  const token2 = req.body.token2;
  var genToken = crypto.createHash('md5').update(email + secretKey2).digest('hex');

  if (!email)
    return utils.error(res, 400, "Bad Request");

  if (token2!=genToken)
    return utils.error(res, 400, "Bad Token");

  const password = req.body.password;
  if (!password)
    return utils.error(res, 400, "Bad Request");

  let getParams = {
    TableName: tableName,
    IndexName: 'email',
    KeyConditionExpression: 'email = :value',
    ExpressionAttributeValues: {
      ':value': email
    }
  };

  dynamoDB.query(getParams, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Sorry! The server seems to be congested. Please try again.");
    } else {
      if (data.Items.length === 0)
        return utils.error(res, 400, "User Does Not Exist!");
      else {
        let updateParams = {
          TableName: tableName,
          Key: {
            rdv_number: data.Items[0].rdv_number
          },
          UpdateExpression: 'SET password = :pass',
          ExpressionAttributeValues: {
            ':pass': password
          },
        };

        dynamoDB.update(updateParams, function (err, data) {
          if (err) {
            return utils.error(res, 500, "Internal Server Error");
          } else {
            console.log("%s: Password changed for %s", utils.logTime(), email);
            return res.json({
              error: false,
              message: "Password changed successfully!",
            });
          }
        });
      }
    }
  });
}

function recaptcha (req, res) {
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.
    // return res.json({"responseCode" : 1,"responseDesc" : req.query});
  if(req.query['g-recaptcha-response'] === undefined || req.query['g-recaptcha-response'] === '' || req.query['g-recaptcha-response'] === null) {
    return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
  }
  // Put your secret key here.
  var secretKey = "6Lef9DMUAAAAANzX-DCuLu0WWDT4el95-W71thJA";
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.query['g-recaptcha-response'];
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
    }
    res.json({"responseCode" : 0,"responseDesc" : "Success"});
  });
}

module.exports = {
  login: login,
  register: register,
  recaptcha: recaptcha,
  changePassword: changePassword,
  getRegCount: getRegCount,
  forgotPassword: forgotPassword,
  getRegistrations: getRegistrations,
};
