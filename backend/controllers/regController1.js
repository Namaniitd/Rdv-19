const request = require('request');
const verificationMailer = require('../mailers/verificationMailer');
const welcomeMailer = require('../mailers/welcomeMailer');
const forgotPasswordMailer = require('../mailers/forgotPasswordMailer');
const utils = require('../../utils')

module.exports = {
  login: login,
  register: register,
  recaptcha: recaptcha,
  changePassword: changePassword,
  getRegCount: getRegCount,
  getRegistrations: getRegistrations,
};


const Database = utils.connectToDB();
const tableName = 'RDV_Registrations';

function getRegistrations(req, res) {
  onRegScan(res, [], null, 0, function (registrations) {
    return res.json({
      registrations: registrations,
    })
  })
}

function onRegScan(res, registrations, lastEvaluatedKey, num, cb) {
  let params = {
    TableName: tableName,
    AttributesToGet: [
      'rdvId',
      'email',
      'name',
      'lastname',
      'college',
      'contact',
      'gender',
      'rdvPoints',
    ],
  };
  if (!lastEvaluatedKey && num != 0)
    cb(registrations);
  else {
    if (lastEvaluatedKey)
      params.ExclusiveStartKey = lastEvaluatedKey;
    Database.scan(params, function (err, data) {
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
      TableName: 'RDV_Registrations',
      Key: {
        rdv_number: id,
      },
    }
  } else {
    return {
      TableName: 'RDV_Registrations',
      IndexName: 'email',
      KeyConditionExpression: 'email = :value',
      ExpressionAttributeValues: {
        ':value': id,
      },
    }
  }
}

// Register or Signup function for RDV18 
// It registers user

function register(req, res) {
  const user = req.body;
  // front-end guys are doing crazy stuff
  if (!user)
    return utils.error(res, 400, "Invalid Data");
  // really no email whats going on
  if (!user.email)
    return utils.error(res, 400, "Please enter Email Address");

// there are some fools so we need this
  user.email = user.email.toLowerCase();
  // This is some regex stuff don't worry it's correct at least i think that
  if (!user.email.match(/^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)) {
    console.log('%s: Invalid email entered - %s', utils.logTime(), user.email);
    return utils.error(res, 400, "Please enter a valid Email Address");
  }
  if (!user.first_name)
    return utils.error(res, 400, "Please enter First Name");
 // Attacks are on the line 
  if (!user.first_name.match(/^[A-Za-z ]+$/))
    return utils.error(res, 400, "Name cannot contain Special Characters");
  if (!user.last_name)
    return utils.error(res, 400, "Please enter Last Name");
 // Attacks are on the line seriously nobody is robot here
  if (!user.last_name.match(/^[A-Za-z ]+$/))
    return utils.error(res, 400, "Name cannot contain Special Characters");
  if (!user.password)
    return utils.error(res, 400, "Please enter Password");

// need to work like genius now......
  const secretKey = '%%Blocking#Clever#Users%%';
  const email = user.email;
  const name = user.first_name + " " + user.last_name;
  const generatedOTP = crypto.createHash('md5').update(email + secretKey).digest('hex').substring(0,6);

  if (req.headers.origin === 'http://brca.iitd.ac.in')
    user.otp = generatedOTP;

  if (!user.otp) {
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

  if (user.college === 'IIT Delhi Staff' && req.headers.origin !== 'http://brca.iitd.ac.in')
    user.college = 'IIT Delhi';

  const queryParams = {
    TableName: 'RDV_Registrations',
    IndexName: 'email',
    KeyConditionExpression: 'email = :value',
    ExpressionAttributeValues: {
      ':value': user.email,
    },
  };

  Database.query(queryParams, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (data.Items.length !== 0)
        return utils.error(res, 400, "Member with Email Address already exists");
      else {
        if (!user.referral_code)
          addUser(res, user, 200);
        else if (user.referral_code.match(/^RDV[a-z0-9]{5}$/)) {
          const secretKey2 = "%%LifeRocks%butItsCrazyAnyway%%";
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
          Database.update(refParams, function (err, data) {
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
  user.rdv_number = generateRDVNumber(user.first_name, user.last_name);
  user.registered_events = [{id: "rdv17", name: "Rendezvous"}];
  user.reg_time = (new Date()).toString();
  user.rdv_points = rdv_points;
  const addParams = {
    TableName: tableName,
    Item: user,
    ConditionExpression: 'attribute_not_exists(rdv_number)',
  };

  Database.put(addParams, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        addUser(res, user, rdv_points);
    } else {
      welcomeMailer.sendMail(user.email, user.first_name + " " + user.last_name, user.rdv_number);
      delete user.password;
      const token = utils.generateTokenRDV(user);
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
  if (token) {
    jwt.verify(token, '##As%CrazyITComes##', function(err, user) {
      if (err)
        return utils.error(res, 401, "Invalid Token");
      Database.get(params("rdv_number", user.rdv_number), function (err, data) {
        if (err) {
          return utils.error(res, 500, "Internal Server Error");
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
    if (!loginID || !password)
      return utils.error(res, 401, "Login ID or Password is empty");
    Database.query(params("email", loginID.toLowerCase()), function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        if (data.Items.length === 0) {
          Database.get(params("rdv_number", loginID), function (err, data) {
            if (err) {
              return utils.error(res, 500, "Internal Server Error");
            } else {
              if (!data.Item)
                return utils.error(res, 401, "User Not Found");
              if (data.Item.password !== password)
                return utils.error(res, 401, "Password Incorrect");
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
          if (user.password !== password)
            return utils.error(res, 401, "Password Incorrect");
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
  getCount(res, 0, null, 0, function (regCount) {
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
    Database.scan(params, function (err, data) {
      if (err) {
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

  Database.query(getParams, function (err, data) {
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

        Database.update(updateParams, function (err, data) {
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