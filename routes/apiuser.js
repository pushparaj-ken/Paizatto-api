var express = require('express');
var router = express.Router();

//const adminController = require('../controllers/admin.controller');
const apiuserController = require('../controllers/apiuser.controller');
var cors = require('cors');



// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com'] }));


router.post('/registerapi', apiuserController.register_associate)
router.post('/loginapi', apiuserController.login_associate)
router.post('/updateprofile', apiuserController.updateprofiledetails)
router.get('/validate', apiuserController.loginotpdetails)


router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});



module.exports = router;