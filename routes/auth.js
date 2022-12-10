var express = require('express');
var router = express.Router();
var User = require('../model/user') 
const authController = require('../controllers/auth.controller');

//const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');

var admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "wesource-8b69e",
    "private_key_id": "6ecaa6bf827c03e73bbf8949bcf9d2da42ca3703",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1ogFpx2sF/pCI\nvH46qvRe844y6pBPkplnYiRpUyrutOfvW4lriRfQT+6WNXeaZ+SbWqiyeS9tWDJZ\nioNLx3sG3eYzE2UFgNwGlZhEj+4abNLIEelDqW04gPVWpjrzev5soQYEV8pPZ8kU\niJua8zmyM8ZFlFNlTQbQJnabywJmIwlcujcAvgiW4pBzn31ui0uHX3moNyir6X/I\n5v7rZpF31jUWLWxmoxyAxkQyb7WV5FHVrhXNuuW6lFkx5wums12jWuI7krCIbWPk\nyMcEbXrKlohDltI8VSaqLX/bd/xhQbZWxsG1dwltbBWWpdP/X/3TDVWlhjEt3QvJ\nHK5/oj5pAgMBAAECggEAC8+AgwXWFjoy4MlM9fim0kPJE9N/1cTFF91gW77uND5s\nNHrByU3NUBzaeUb5w38M9PMktBJAPL52666fkf5jKBOmw9x3fa+e3wi8MX0gcPRx\nklPj1KQAN6PfECbX/3wYbizcTMz+mUI4545oe99j+Yv3UQ/vik9DaaaOoNvHCKgT\nX2wtZcD3yxE7vEoLF960PILIs9SaJzZpkWVwGk1/z/OExLziDmeYxd6DO2b85IKO\nlS6vW0xJ6Xt6Y6MVyNO438ZD9RxEDloDHpNdCIxPrh0genneAovSslcxJKOEMahZ\nbPShNcCVbQnDbvI3EFW9DXEg+iRo8iBvwtAyw4qpuQKBgQDwLcY8tsfm7MmGkuXR\nUNWONBiJ+ojL0rhLI62NZh2csVU1sP56GvLG/2QAdpNPLrkG7nqIvDUTFbbmJuLu\ncychJh4T7JHQAlZWtpxQw9a0jKRcef0DC6KLVZuOjMo2FTtOSmDiur/XJXIhR4Vs\nHZDzF77Fo3+fDH+vSfDHtrUWxQKBgQDBmPLJe+PWJqCDtDmDodojIryyL+aIHKZk\nBjYjtkSnb0nWcLVPwGak5MHN4E/XlIbtkNSp7zZk3/QDsPf0PK2vSdY/btvNWoDP\nsM2KWhljjAWou42V2yJT1X4t/bDwP1Epdt+g5rlJytVfKnkppMlm31byki1P/PAJ\nIX2Q1h3jVQKBgQDTYYX6A2gWPknzLbAkM39wYztBnITu1isqvmDNdJUVRiFXWsnt\nD3CiYT1TBwkJBHcFubeQRgx0GoVZM9o/wIssqo6IPInsR1JTiO40StfZGXrChP5/\nwqqw9IwuvoxtYuxKMD3q7i9PG/7BeV/c0nyy5jAZY5c7lNV/oZTPQGdKfQKBgQCw\nnKJoksAP3l8yp1iMsDu7L/Zqq+4oH9LfjxcWzzGkeY8ntNyDK+e36ASxlz/fUF0j\nHqwTduntbq1CLNCXHD/qmHZ+mdilZzn5vrZTz8w3l0aWXrtUiXuwdSROOpCPK4QU\nSqDKPZGtMwAieDHefrlJQtgkJJx3yy0Dd20Ak4TinQKBgEoQOp7ukYkpHzCs98nY\n6qPiVO/fP2vqRV6wpM7oh8kZyEOovxHPcdL5QuXl9IQrhh5dQxMj05ABFUqhcf1s\nG3YnplMg56IwRd0MnlnOeNrvX7MW2ApVEsHYI2d5fpYsLxYZCbfvlM2+DX+rtUGD\naWGAJLCFwaPR56WIgx7XVL2d\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-1wqv6@wesource-8b69e.iam.gserviceaccount.com",
    "client_id": "106520235786131845846",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1wqv6%40wesource-8b69e.iam.gserviceaccount.com"
  }),
  databaseURL: 'https://wesource-8b69e-default-rtdb.firebaseio.com'
});

router.post('/signin', authController.check_user);



/* router.post('/oauth/access_token', async (req, res) => {
	//Validate Token
	//UserController.decodetoken
  var idToken = req.header('X-AUTH-TOKEN')
  console.log({idToken})
  //const {idToken} = req.body
  let decodedToken
  try {
   decodedToken = await admin.auth().verifyIdToken(idToken)
  }
  catch (error) {
    console.log({error})
    return res.status(401).json({message: (error && error.errorInfo && error.errorInfo.message) || 'Oops something went wrong'})
  }
  if (decodedToken) {
    const uid = decodedToken.uid;
    const mobile = decodedToken.mobile;
    const user = await User.findOne({ uid })
    if (!user) {
      let newUser = new User({uid:uid,mobile:mobile})
      await newUser.save()
      const token = await jwt.sign({uid:uid}, process.env.TOKEN_SECRET);
      return res.json({
			"code": "200",
			"success": true,
			"message": "New user created",
			"timestamp":new Date(),
			"data":{
				"account": newUser,
				"authentication":{
					"token":token
				}
			}
		  })
    } else {
      const token = await jwt.sign({uid:uid}, process.env.TOKEN_SECRET);
      return res.json({
			"code": "200",
			"success": true,
			"message": "Existed user",
			"timestamp":new Date(),
			"data":{
				"account": user,
				"authentication":{
					"token":token
				}
			}
		  })
    }

  } else {
    res.status(401).json({message: 'Oops something went wrong'})
  }
})
 */
router.post('/users/profile', async (req, res) => {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
	var decodedHeader = jwt_decode(bearerToken);
	console.log(decodedHeader);
	console.log(req.body);
	//let updateRecord = new User(req.body);
	await User.update({uid:decodedHeader.uid},req.body, (err,result)=> {
		console.log(err)
		return res.json({
			"success":true
		})
	})
  }
});

module.exports = router;
  