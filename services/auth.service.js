const httpStatus = require('http-status');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');
var admin = require('firebase-admin');

const decode_token = async (req) => {
  var idToken = req.body.TOKEN
  let decodedToken
  try {
   decodedToken = await admin.auth().verifyIdToken(idToken)
  }
  catch (error) {
    console.log({error});
	throw new ApiError(httpStatus.UNAUTHORIZED, 'Token decode failed');
  }
  return decodedToken;
};


module.exports = {
  decode_token
};