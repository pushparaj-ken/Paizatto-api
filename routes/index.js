
var express = require('express');
var router = express.Router();
const jwt_decode = require('jwt-decode');
var User = require('../model/user')
//const adminController = require('../controllers/admin.controller');
//const productController = require('../controllers/product.controller');
const userController = require('../controllers/user.controller');

var cors = require('cors');

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com','http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
//router.get('/sliders', productController.get_sliders);

router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;