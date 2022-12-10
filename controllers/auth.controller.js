const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService } = require('../services');


const check_user = catchAsync(async (req, res) => {
  console.log(req.body)
  const decoded_token = await authService.decode_token(req);
  console.log(decoded_token);
  const user = await userService.user_verify(decoded_token);
  if(user.code == 201){
	  res.status(httpStatus.CREATED).send(user);
  }else if(user.code == 200){
	  res.send(user)
  }  
});

module.exports = {
  check_user
};
