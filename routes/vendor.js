var express = require('express');
var router = express.Router();
const jwt_decode = require('jwt-decode');
var User = require('../model/user')
    //const adminController = require('../controllers/admin.controller');
const vendorController = require('../controllers/vendor.controller');

var cors = require('cors');

const multer = require("multer");

const upload = multer({});

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080', 'http://paizattoteam.paizatto.com', 'http://admopal.paizatto.com', 'http://paizattoadmin.paizatto.com'] }));




/* Public Routes */
router.get('/transactions', vendorController.transactionsdetails);

router.post('/transactions', vendorController.addtransactions);

router.post('/transactions/:id', vendorController.Updatetransactions);

router.post('/delete', vendorController.deletetransactions);

router.post('/signupVendor', vendorController.RegisterVendor);



router.post('/login', vendorController.LoginVendor);

router.post('/vendorform', vendorController.VedorFormAPI);

router.post('/validateReferralID', vendorController.ValidateReferralIdAPI)

router.post('/forgotpassword', vendorController.ForgotPasswordVendor);

router.post('/updatepassword', vendorController.UpdateVendorPassword);

router.post('/profile', vendorController.UpdateVendorProfile);

router.post('/getprofile', vendorController.GetVendorDetails);

router.post('/verify', vendorController.VerifyPhoneNumberExistsAlready);

router.get('/salesSummary', vendorController.getSalesSummary);

router.get('/transactionreport', vendorController.VendorTransactionReport);

router.post('/vendordashboard', vendorController.VendorDashboard);

router.post('/kyc', upload.fields([{ name: 'pan', maxCount: 1 }, { name: 'gst', maxCount: 1 }, { name: 'kyc', maxCount: 1 }]), vendorController.UpdateVendorKYC);

router.post('/updateshop', upload.fields([{ name: 'shop', maxCount: 10 }, { name: 'offers', maxCount: 10 }, { name: 'QRCode', maxCount: 1 }, { name: 'featuredImage', maxCount: 1 }]), vendorController.UpdateShopDetails)

router.post('/faq', vendorController.FAQVendor);

router.post('/contactus', vendorController.ContactUsVendor);

router.get('/fetchContactUs', vendorController.getContactUs);

router.post('/updateContact', vendorController.updateContactUs);

router.post('/deleteContact', vendorController.deleteContactUs);

router.post('/exportvendor', vendorController.ExportVendorData);


//router.get('/fetchFaq', vendorController.getFaq);

//router.post('/createFaq', vendorController.createFaq);

//router.post('/updateFaq', vendorController.updateFaq);

router.post('/listReferVendors', vendorController.listReferVendors);

router.post('/refervendor', vendorController.ReferVendor);

router.post('/listassociates', vendorController.ListAssociatesOnPincode);

router.post('/sendmarketingmessage', vendorController.SendMarketingMessages);

router.post('/marketingmessagereport', vendorController.MarketingMessageReport);

router.post('/listallmarketingmessages', vendorController.ListAllMarketingMessages);

router.post('/marketingmessageapproval', vendorController.ApproveMarketingMessages);

router.post('/sendnotificatons', vendorController.SendNotification)

router.post('/readnotificatons', vendorController.ReadNotification)

router.post('/allnotificatons', vendorController.GetAllNotification)

router.post('/uploadimage', upload.fields([{ name: 'image', maxCount: 1 }]), vendorController.UploadImageInvendor);

router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});

module.exports = router;