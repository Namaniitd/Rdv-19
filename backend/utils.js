/**
 * Created by Sunil
 */
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const secret =  require('./secrets');

if ((process.env.NODE_ENV === 'production')) {
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: "ap-south-1",
    endpoint: new AWS.Endpoint('https://dynamodb.ap-south-1.amazonaws.com')
  });
} else {
  AWS.config.update({
    accessKeyId: "None",
    secretAccessKey: "None",
    region: "None",
    endpoint: new AWS.Endpoint('http://localhost:8000')
  });
}

function connectToDB() {
  return new AWS.DynamoDB.DocumentClient();
}

function generateToken(user) {
  //1. Dont use password and other sensitive fields
  //2. Use fields that are useful in other parts of the
  //app/collections/models
  var u = {
    email: user.email,
  };
  return token = jwt.sign(u, secret.encry, {
    expiresIn: 60 * 60 * 24 * 30 // expires in 30 days
  });
}

function generateTokenRDV(user) {
  //1. Dont use password and other sensitive fields
  //2. Use fields that are useful in other parts of the
  //app/collections/models
  var u = {
    rdv_number: user.rdv_number,
  };
  return token = jwt.sign(u, secret.encry, {
    expiresIn: 60 * 60 * 24 * 30 // expires in 30 days
  });
}

function error(res, statusCode, msg) {
  res.status(statusCode).json({
    error: true,
    message: msg,
  })
}

function logTime() {
  return (new Date()).toLocaleString("en", {timeZone: "Asia/Kolkata"});
}

module.exports = {
  connectToDB: connectToDB,
  generateToken: generateToken,
  generateTokenRDV: generateTokenRDV,
  error: error,
  logTime: logTime,
};
