var express = require('express');
var router = express.Router();
const jwt_decode = require('jwt-decode');
var User = require('../model/user')
var points = require('../model/point')
//const adminController = require('../controllers/admin.controller');
const pointsController = require('../controllers/points.controller');

var cors = require('cors');

const multer = require("multer");

//const upload = multvendorlistControllerer({});

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com','http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
router.get('/points', pointsController.pointsdetails);
router.post('/points',  pointsController.addpoints); 
router.post('/points/:id', pointsController.Updatepoints);
router.post('/points/delete/:id', pointsController.deletepoints);



router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;