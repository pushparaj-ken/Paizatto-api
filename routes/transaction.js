var express = require('express');
var router = express.Router();
const transactionController = require('../controllers/transaction.controller');

var cors = require('cors');
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
router.get('/execute', transactionController.execute);

router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;