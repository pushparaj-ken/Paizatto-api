var express = require('express');
var router = express.Router();
const jwt_decode = require('jwt-decode');
var User = require('../model/user')
var points = require('../model/point')
//const adminController = require('../controllers/admin.controller');
const productController = require('../controllers/product.controller');

var cors = require('cors');

const multer = require("multer");

//const upload = multvendorlistControllerer({});

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com','http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
router.get('/product', productController.productdetails);
router.post('/product',  productController.addproduct); 
router.post('/product/:id', productController.Updateproduct);
router.post('/product/delete/:id', productController.deleteproduct);



router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;