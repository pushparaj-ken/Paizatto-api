const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');


const generateToken = async (uid) => {
  const payload = {
    uid: uid
  };
  let token = await jwt.sign(payload, process.env.TOKEN_SECRET);
  return token;
};


module.exports = {
  generateToken
};