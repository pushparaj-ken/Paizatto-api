var express = require('express');
var router = express.Router();
const reportController = require('../controllers/reports.controller');

var cors = require('cors');
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com'] }));

const multer = require("multer");

const upload = multer({});

router.post('/cashback', reportController.CashbackReports);

router.post('/active-inactive', reportController.ActiveInactiveReports);

router.post('/downlinepoints', reportController.DownlinePoints1);

router.post('/referralreport', reportController.ReferralReport);

router.post('/purchasereport', reportController.PurchaseReport);

router.post('/levelreport', reportController.LevelReport);



module.exports = router;