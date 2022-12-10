var express = require('express');
var router = express.Router();
const reportController = require('../controllers/report.controller');

var cors = require('cors');
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com'] }));

const multer = require("multer");

const upload = multer({});

router.post('/downlinePoints', reportController.downlinePointsReport);
router.post('/referral', reportController.referralReport);
router.post('/level', reportController.levelReport);
router.post('/purchase', reportController.purchaseReport);

module.exports = router;