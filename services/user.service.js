const httpStatus = require('http-status');
const User = require('../model/user');
const ApiError = require('../utils/ApiError');
const tokenService = require('../services/token.service');

const user_verify = async (decodedToken) => {
	let response = {}
	if(decodedToken){
		const user = await getUserByUID(decodedToken.uid);
		console.log("user",user);
		console.log("decodedToken",decodedToken);
		if(!user){
			let newUser = await createUser(decodedToken);
			let token = await tokenService.generateToken(decodedToken.uid);
			response.data = {};
			response.code = 201;
			response.success = true;
			response.message = "The resource access granted";
			response.timestamp = new Date();
			response.data.account = newUser;
			response.data.authorization = {};
			response.data.authorization.jwt_token = token;
			return response;
		}else{
			let token = await tokenService.generateToken(user.uid);
			console.log("token",token);
			console.log("user",user);
			response.data = {};
			response.code = 200;
			response.success = true;
			response.message = "The resource access granted"
			response.timestamp = new Date();
			response.data.account = user;
			response.data.authorization = {};
			response.data.authorization.jwt_token = token;
			return response;
		}
	}else{
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Error while decoding token');
	}
}

const createUser = async (userBody) => {
  const user = await User.create(userBody);
  return user;
};


const getUserByUID = async (uid) => {
	console.log(User)
  let user = await User.findOne({ uid });
  return user;
};

module.exports = {
  user_verify,
  createUser,
  getUserByUID
};