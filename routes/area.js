var express = require('express');
var router = express.Router();
const jwt_decode = require('jwt-decode');
var User = require('../model/user')
var points = require('../model/point')
    //const adminController = require('../controllers/admin.controller');
const areaController = require('../controllers/area.controller');

var cors = require('cors');

const multer = require("multer");

const upload = multer({});

//const upload = multvendorlistControllerer({});

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080', 'http://paizattoteam.paizatto.com', 'http://admopal.paizatto.com', 'http://paizattoadmin.paizatto.com', 'http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
//router.post('/addmembership', upload.fields([{name:'image', maxCount: 1}]), vendorController.addmembership); 
router.get('/area', areaController.areadetails);
router.post('/area', areaController.addarea);
router.post('/area/updatearea', areaController.Updatearea);
router.post('/area/deletearea', areaController.deletearea);
router.post('/districtarealists', areaController.districtarea);

router.get('/district', areaController.districtdetails);
router.post('/district', areaController.adddistrict);
router.post('/district/updatedistrict', areaController.Updatedistrict);
router.post('/district/deletedistrict', areaController.deletedistrict);


router.get('/pincode', areaController.pincodedetails);
router.post('/pincode', areaController.addpincode);
router.post('/pincode/updatepincode', areaController.Updatepincode);
router.post('/pincode/deletepincode', areaController.deletepincode);

router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;