/**
 * Created by Nikhil on 23/05/17.
 */
const utils = require('../utils');
const jwt = require('jsonwebtoken');
// Db info
const teamName = '2019_RDV_Team'
const dynamoDB = utils.connectToDB();

const secret = require('../Models/secrets');

function params(email) {
  return {
    TableName: teamName,
    Key: {
      "email": email,
    }
  }
}


// function for session login
// @review change password sys
function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password)
    return utils.error(res, 401, "Email or Password is wrong");
  dynamoDB.get(params(email), function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 401, "Email does not exist");
      if (data.Item.password !== password)
        return utils.error(res, 401, "Password incorrect");
      delete data.Item['password'];
      const token = utils.generateToken(data.Item);
      return res.json({
        user: data.Item,
        token: token,
      })
    }
  })
}

function validateToken(req, res) {
  const token = req.body.token || req.query.token;
  if (!token) {
    return utils.error(res, 401, "Token not found");
  }
  jwt.verify(token, secret.encry, function(err, user) {
    if (err)
      return utils.error(res, 401, "Invalid Token");
    dynamoDB.get(params(user.email), function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        if (!data.Item)
          return utils.error(res, 401, "Invalid Token");
        delete data.Item['password'];
        const token = utils.generateToken(data.Item);
        return res.json({
          user: data.Item,
          token: token,
        })
      }
    })
  });
}


module.exports = {
  login: login,
  validateToken: validateToken,
};