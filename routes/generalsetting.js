
var express = require('express');
var router = express.Router();
const jwt_decode = require('jwt-decode');
var User = require('../model/user')
var points = require('../model/point')
//const adminController = require('../controllers/admin.controller');
const generalsettingController = require('../controllers/generalsetting.controller');

var cors = require('cors');

const multer = require("multer");

const upload = multer({});

//const upload = multvendorlistControllerer({});

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com','http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
//router.post('/addmembership', upload.fields([{name:'image', maxCount: 1}]), vendorController.addmembership); 
router.get('/generalsetting', generalsettingController.generalsettingdetails);
router.post('/generalsetting',  generalsettingController.addgeneralsetting); 
router.post('/generalsetting/:id', generalsettingController.Updategeneralsetting);
router.post('/generalsetting/delete/:id', generalsettingController.deletegeneralsetting);




router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;