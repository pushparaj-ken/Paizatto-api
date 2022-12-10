var express = require('express');
var router = express.Router(); 
const jwt_decode = require('jwt-decode'); 
//const adminController = require('../controllers/admin.controller');
const sliderController = require('../controllers/slider.controller');

var cors = require('cors');

const multer = require("multer");

//const upload = multvendorlistControllerer({});

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com','http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
router.get('/sliders', sliderController.sliderdetails); 
router.post('/addsliders', sliderController.addsliderdetails); 

router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;